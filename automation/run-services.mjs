import { spawn } from "node:child_process";
import net from "node:net";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const mode = process.argv[2] === "start" ? "start" : "dev";
// Check both ports before starting either service; never stop another application.
async function assertPortAvailable(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", reject);
    probe.listen(port, () => probe.close(resolve));
  }).catch((error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Stop the existing website terminal with Ctrl+C, then run npm run dev again.`,
      );
    } else
      console.error(
        `Cannot start service on port ${port}: ${error.code || "unknown error"}`,
      );
    process.exit(1);
  });
}
await assertPortAvailable(3001);
await assertPortAvailable(5001);
const children = ["backend", "frontend"].map((workspace) =>
  spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", mode, "--workspace", workspace],
    { cwd: root, stdio: "inherit", detached: process.platform !== "win32" },
  ),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    try {
      if (process.platform === "win32") child.kill("SIGTERM");
      else process.kill(-child.pid, "SIGTERM");
    } catch {}
  }
  setTimeout(() => process.exit(code), 500).unref();
}
for (const child of children) {
  child.on("error", () => stop(1));
  child.on("exit", (code) => {
    if (!stopping) stop(code ?? 1);
  });
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
