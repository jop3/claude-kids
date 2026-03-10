import express from "express";
import { spawn } from "child_process";
import { readdirSync, statSync } from "fs";
import { join } from "path";


const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const WORKSPACE = process.env.WORKSPACE || "/workspace";
const CLAUDE_BIN = process.env.CLAUDE_BIN || "claude";

// Serve workspace files (for iframe preview)
app.use("/preview", express.static(WORKSPACE));

// List HTML files in workspace
app.get("/api/files", (_req, res) => {
  try {
    const files = readdirSync(WORKSPACE)
      .filter((f) => f.endsWith(".html") && f !== "CLAUDE.md")
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

// SSE endpoint — streams Claude Code output back to browser
app.post("/api/chat", (req, res) => {
  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // Build claude args
  const args = [
    "--print",
    "--output-format", "stream-json",
    "--allowedTools", "Bash,Read,Write,Edit,Glob,Grep",
    "-p", message,
  ];

  if (sessionId) {
    args.push("--resume", sessionId);
  }

  const env = {
    ...process.env,
    CLAUDE_NONINTERACTIVE: "1",
  };

  const proc = spawn(CLAUDE_BIN, args, {
    cwd: WORKSPACE,
    env,
    windowsHide: true,
  });

  let newSessionId = sessionId || null;
  let textBuffer = "";

  proc.stdout.on("data", (chunk) => {
    const raw = chunk.toString();
    // stream-json emits one JSON object per line
    for (const line of raw.split("\n")) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);

        // Capture session id from init event
        if (obj.type === "system" && obj.subtype === "init" && obj.session_id) {
          newSessionId = obj.session_id;
          send({ type: "session", sessionId: newSessionId });
        }

        // Stream assistant text
        if (obj.type === "assistant" && Array.isArray(obj.message?.content)) {
          for (const block of obj.message.content) {
            if (block.type === "text") {
              textBuffer += block.text;
              send({ type: "text", text: block.text });
            }
          }
        }

        // Tool use — tell the browser what Claude is doing
        if (obj.type === "assistant" && Array.isArray(obj.message?.content)) {
          for (const block of obj.message.content) {
            if (block.type === "tool_use") {
              const action = toolAction(block.name, block.input);
              if (action) send({ type: "action", text: action });
            }
          }
        }

        // Tool result — detect new/changed HTML files
        if (obj.type === "tool" && obj.content) {
          const fileMention = detectHtmlFile(obj);
          if (fileMention) send({ type: "file", file: fileMention });
        }
      } catch {
        // Non-JSON line, ignore
      }
    }
  });

  proc.stderr.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) console.error("[claude stderr]", text);
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      send({ type: "error", text: "Oj, nagonting gick fel. Forsok igen!" });
    }
    send({ type: "done" });
    res.end();
  });

  // If client disconnects, kill claude
  res.on("close", () => proc.kill());
});

function toolAction(name, input) {
  if (name === "Write") return `Skapar ${input?.file_path?.split("/").pop() || "fil"}...`;
  if (name === "Edit") return `Andrar ${input?.file_path?.split("/").pop() || "fil"}...`;
  if (name === "Bash") return `Kor kod...`;
  return null;
}

function detectHtmlFile(toolObj) {
  // Look for file paths in tool results or input
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
