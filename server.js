import express from "express";
import { spawn } from "child_process";
import { readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const WORKSPACE = process.env.WORKSPACE || "/workspace";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";
const MAX_RETRIES = 2;

// Serve workspace files (for iframe preview)
app.use("/preview", express.static(WORKSPACE));

// List HTML files in workspace
app.get("/api/files", (_req, res) => {
  try {
    const files = readdirSync(WORKSPACE)
      .filter((f) => f.endsWith(".html"))
      .map((f) => {
        const stat = statSync(join(WORKSPACE, f));
        return { name: f, mtime: stat.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);
    res.json(files);
  } catch {
    res.json([]);
  }
});

// Validate HTML file — returns null if ok, error string if broken
function validateHtml(filename) {
  try {
    const content = readFileSync(join(WORKSPACE, filename), "utf8").trim();
    if (content.length < 50) return "Filen är för kort eller tom.";
    if (!content.includes("<html") && !content.includes("<!DOCTYPE"))
      return "Filen saknar html-tagg.";
    if (!content.includes("</html>") && !content.includes("</body>"))
      return "Filen verkar ofullständig (saknar avslutande taggar).";
    // Check for obvious JS syntax errors by looking for unclosed script tags
    const scriptOpen = (content.match(/<script/gi) || []).length;
    const scriptClose = (content.match(/<\/script>/gi) || []).length;
    if (scriptOpen !== scriptClose)
      return "Filen har ett trasigt script-block.";
    return null;
  } catch (e) {
    return `Filen kunde inte läsas: ${e.message}`;
  }
}

// Run one claude invocation, returns Promise<{ sessionId, detectedFile, text }>
function runClaude(message, sessionId) {
  return new Promise((resolve, reject) => {
    const args = [
      "--print",
      "--output-format", "stream-json",
      "--allowedTools", "Bash,Read,Write,Edit,Glob,Grep",
      "-p", message,
    ];
    if (sessionId) args.push("--resume", sessionId);

    const proc = spawn(CLAUDE_BIN, args, {
      cwd: WORKSPACE,
      env: { ...process.env, CLAUDE_NONINTERACTIVE: "1" },
      windowsHide: true,
    });

    let newSessionId = sessionId || null;
    let detectedFile = null;
    let text = "";
    let rawBuf = "";

    proc.stdout.on("data", (chunk) => {
      rawBuf += chunk.toString();
      const lines = rawBuf.split("\n");
      rawBuf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.type === "system" && obj.subtype === "init" && obj.session_id)
            newSessionId = obj.session_id;
          if (obj.type === "assistant" && Array.isArray(obj.message?.content)) {
            for (const block of obj.message.content) {
              if (block.type === "text") text += block.text;
            }
          }
          if (obj.type === "tool" && obj.content) {
            const f = detectHtmlFile(obj);
            if (f) detectedFile = f;
          }
        } catch {}
      }
    });

    proc.stderr.on("data", (chunk) => {
      console.error("[claude stderr]", chunk.toString().trim());
    });

    proc.on("close", (code) => {
      if (code !== 0) return reject(new Error(`claude exited ${code}`));
      resolve({ sessionId: newSessionId, detectedFile, text });
    });
  });
}

// SSE endpoint with silent self-healing retry loop
app.post("/api/chat", async (req, res) => {
  const { message, sessionId: incomingSessionId } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  let currentSessionId = incomingSessionId || null;
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    // On retry, inject the validation error silently into the prompt
    const prompt =
      attempt === 0
        ? message
        : `Den HTML-fil du skapade hade ett fel: "${lastError}". Fixa det direkt och spara om filen. Skriv inget till användaren om detta.`;

    if (attempt === 0) {
      send({ type: "action", text: "Tänker på din idé..." });
    }

    try {
      const result = await runClaude(prompt, currentSessionId);
      currentSessionId = result.sessionId;

      // Emit session id on first attempt
      if (attempt === 0 && result.sessionId) {
        send({ type: "session", sessionId: result.sessionId });
      }

      // Emit assistant text (only on first attempt — retries are silent)
      if (attempt === 0 && result.text) {
        send({ type: "text", text: result.text });
      }

      // Validate the HTML file if one was written
      if (result.detectedFile) {
        const error = validateHtml(result.detectedFile);
        if (error) {
          lastError = error;
          attempt++;
          console.log(`[self-heal] attempt ${attempt}: ${error}`);
          continue; // retry silently
        }
        // File is good — tell the browser to show it
        send({ type: "file", file: result.detectedFile });
      }

      // Success
      send({ type: "done" });
      res.end();
      return;
    } catch (err) {
      console.error("[runClaude error]", err.message);
      lastError = err.message;
      attempt++;
    }
  }

  // All retries exhausted
  send({ type: "error", text: "Oj, något gick fel! Försök med en ny idé." });
  send({ type: "done" });
  res.end();
});

function detectHtmlFile(toolObj) {
  const text = JSON.stringify(toolObj);
  const match = text.match(/\/workspace\/([\w\-]+\.html)/);
  return match ? match[1] : null;
}

const PORT = process.env.PORT || 3456;
app.listen(PORT, () => {
  console.log(`ClaudeKids running at http://localhost:${PORT}`);
  console.log(`Workspace: ${WORKSPACE}`);
  console.log(`Claude bin: ${CLAUDE_BIN}`);
});
