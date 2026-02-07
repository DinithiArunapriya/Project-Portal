const { spawn } = require("node:child_process");

const processes = [
  { name: "backend", cmd: "npm", args: ["run", "dev:backend"] },
  { name: "frontend", cmd: "npm", args: ["run", "dev:frontend"] }
];

let shuttingDown = false;

function startProcess({ name, cmd, args }) {
  // Avoid using `shell: true` to prevent DEP0190 warning (passing args with shell
  // can be insecure). Pass command and args directly to spawn.
  const child = spawn(cmd, args, { stdio: "inherit" });

  child.on("error", (err) => {
    console.error(`[dev] ${name} failed to start:`, err.message || err);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[dev] ${name} exited (${reason}). Shutting down.`);
    shutdown(code ?? 1);
  });

  return child;
}

const running = processes.map(startProcess);

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const proc of running) {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
