import { execSync, spawn } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { networkInterfaces, platform } from "node:os";

const PORT = 3000;

function lanAddresses() {
  const ips = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const info of list ?? []) {
      if (info.family !== "IPv4" || info.internal) continue;
      ips.push(info.address);
    }
  }
  return ips;
}

function prepare() {
  try {
    execSync("npx prisma generate", { stdio: "inherit", cwd: process.cwd() });
  } catch {
    console.warn("Warning: prisma generate failed — check DATABASE_URL in .env.local");
  }
}
function killPort(port) {
  if (platform() !== "win32") return;
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && /^\d+$/.test(pid) && pid !== "0") pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`Freed port ${port} (PID ${pid})`);
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* port already free */
  }
}

const clean = process.argv.includes("--clean");
const nextDir = join(process.cwd(), ".next");

killPort(PORT);
killPort(3001);

prepare();
if (clean && existsSync(nextDir)) {
  try {
    rmSync(nextDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    console.log("Removed .next cache");
  } catch {
    console.log("Could not remove .next cache (still in use) — starting anyway");
  }
}

console.log(`\nStarting dev server at http://localhost:${PORT}`);
const lan = lanAddresses();
if (lan.length) {
  console.log("\n局域网访问（同一 WiFi 下的手机/平板）:");
  for (const ip of lan) {
    console.log(`  → http://${ip}:${PORT}`);
  }
  console.log(
    "\n提示: 若手机打开无样式，把上面 IP 加到 next.config.ts 的 allowedDevOrigins，",
  );
  console.log("并把 .env.local 里 NEXT_PUBLIC_SITE_URL 改成 http://你的IP:3000\n");
} else {
  console.log("");
}

const nextScript = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

const child = spawn(
  process.execPath,
  [nextScript, "dev", "-p", String(PORT), "-H", "0.0.0.0"],
  { stdio: "inherit", cwd: process.cwd() },
);

child.on("exit", (code) => process.exit(code ?? 0));

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
