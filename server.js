import express from "express";
import { spawn } from "child_process";
import { readdirSync, statSync, readFileSync, copyFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "client/dist")));

const WORKSPACE = process.env.WORKSPACE || "/workspace";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";

app.use("/preview", express.static(WORKSPACE));

app.get("/api/files", (_req, res) => {
  try {
    const files = readdirSync(WORKSPACE)
      .filter((f) => f.endsWith(".html"))
      .map((f) => ({ name: f, mtime: statSync(join(WORKSPACE, f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    res.json(files);
  } catch {
    res.json([]);
  }
});

function validateHtml(filename) {
  try {
    const content = readFileSync(join(WORKSPACE, filename), "utf8").trim();
    if (content.length < 50) return "Filen är för kort eller tom.";
    if (!content.includes("<html") && !content.includes("<!DOCTYPE"))
      return "Filen saknar html-tagg.";
    if (!content.includes("</html>") && !content.includes("</body>"))
      return "Filen verkar ofullständig.";
    const opens  = (content.match(/<script/gi)  || []).length;
    const closes = (content.match(/<\/script>/gi) || []).length;
    if (opens !== closes) return "Filen har ett trasigt script-block.";
    return null;
  } catch (e) {
    return `Filen kunde inte läsas: ${e.message}`;
  }
}

// Stream Claude output directly to SSE response, with silent retry on bad HTML
app.post("/api/chat", (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  let currentSessionId = sessionId || null;
  let attempt = 0;
  const MAX_RETRIES = 2;

  function runAttempt(prompt) {
    // Refresh credentials from mounted (read-only) source before each spawn
    try {
      if (existsSync("/root/.claude/.credentials.json"))
        copyFileSync("/root/.claude/.credentials.json", "/tmp/claude-rw/.credentials.json");
      if (existsSync("/root/.claude/--.credentials.json"))
        copyFileSync("/root/.claude/--.credentials.json", "/tmp/claude-rw/--.credentials.json");
    } catch {}

    const args = [
      "--print",
      "--output-format", "stream-json",
      "--verbose",
      "--model", process.env.CLAUDE_MODEL || "claude-sonnet-4-5",
      "--allowedTools", "Bash,Read,Write,Edit,Glob,Grep",
      "-p", prompt,
    ];
    if (currentSessionId) args.push("--resume", currentSessionId);

    console.log(`[claude] attempt ${attempt + 1}, session: ${currentSessionId || "new"}`);

    const proc = spawn(CLAUDE_BIN, args, {
      cwd: WORKSPACE,
      env: {
        ...process.env,
        CLAUDE_NONINTERACTIVE: "1",
        CLAUDE_CONFIG_DIR: "/tmp/claude-rw",
        HOME: "/tmp",
      },
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    proc.stdin.end(); // Claude waits for stdin close when spawned non-interactively

    let buf = "";
    let detectedFile = null;
    let hasText = false;

    proc.stdout.on("data", (chunk) => {
      buf += chunk.toString();
      const lines = buf.split("\n");
      buf = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        let obj;
        try { obj = JSON.parse(line); } catch { continue; }

        // Session id
        if (obj.type === "system" && obj.subtype === "init" && obj.session_id) {
          currentSessionId = obj.session_id;
          send({ type: "session", sessionId: currentSessionId });
        }

        // Assistant text — stream it live
        if (obj.type === "assistant" && Array.isArray(obj.message?.content)) {
          for (const block of obj.message.content) {
            if (block.type === "text" && block.text && attempt === 0) {
              hasText = true;
              send({ type: "text", text: block.text });
            }
            // Tool use action label
            if (block.type === "tool_use") {
              const action = toolLabel(block.name, block.input);
              if (action) send({ type: "action", text: action });
            }
          }
        }

        // Tool result — detect written HTML files
        if (obj.type === "user" && Array.isArray(obj.message?.content)) {
          for (const block of obj.message.content) {
            if (block.type === "tool_result") {
              // Check tool_use_result for file path
              const fp = obj.tool_use_result?.filePath || "";
              if (fp.endsWith(".html")) detectedFile = fp.split("/").pop();
              // Also scan content text for /workspace/*.html
              const raw = JSON.stringify(block.content || "");
              const m = raw.match(/\/workspace\/([\w\-]+\.html)/);
              if (m) detectedFile = m[1];
            }
          }
        }
      }
    });

    proc.stderr.on("data", (chunk) => {
      const t = chunk.toString().trim();
      if (t && !t.includes("powershell") && !t.includes("hook")) console.error("[claude]", t);
    });

    proc.on("close", (code) => {
      console.log(`[claude] exit ${code}, file: ${detectedFile}`);

      if (code !== 0) {
        if (attempt < MAX_RETRIES) {
          attempt++;
          send({ type: "action", text: "Försöker igen..." });
          return runAttempt(`Något gick fel. Försök igen och skapa filen på nytt i /workspace.`);
        }
        send({ type: "error", text: "Oj, något gick fel! Försök med en ny idé." });
        send({ type: "done" });
        return res.end();
      }

      if (detectedFile) {
        const err = validateHtml(detectedFile);
        if (err && attempt < MAX_RETRIES) {
          attempt++;
          console.log(`[self-heal] ${err}`);
          return runAttempt(
            `Den HTML-fil du skapade hade ett fel: "${err}". Fixa det och spara om filen. Skriv inget till användaren.`
          );
        }
        send({ type: "file", file: detectedFile });
      }

      send({ type: "done" });
      res.end();
    });

    res.on("close", () => proc.kill());
  }

  runAttempt(message);
});

function toolLabel(name, input) {
  const file = input?.file_path?.split("/").pop() || "fil";
  if (name === "Write") return `Skapar ${file}...`;
  if (name === "Edit")  return `Ändrar ${file}...`;
  if (name === "Bash")  return `Kör kod...`;
  if (name === "Read")  return `Läser ${file}...`;
  return null;
}

// SPA fallback — serve index.html for non-API routes
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/preview")) return next();
  res.sendFile(join(__dirname, "client/dist/index.html"));
});

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`ClaudeKids running at http://localhost:${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
});
