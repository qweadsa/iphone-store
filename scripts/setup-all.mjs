import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function syncEnv() {
  const localPath = join(root, ".env.local");
  const envPath = join(root, ".env");
  if (!existsSync(localPath)) {
    console.log("❌ 找不到 .env.local");
    console.log("   请复制 .env.local.example 为 .env.local 并填写 DATABASE_URL");
    return false;
  }
  const content = readFileSync(localPath, "utf8");
  const match = content.match(/^DATABASE_URL=(.+)$/m);
  if (!match?.[1]?.trim()) {
    console.log("❌ .env.local 里未设置 DATABASE_URL");
    return false;
  }
  writeFileSync(envPath, `DATABASE_URL=${match[1].trim()}\n`);
  console.log("✓ 已同步 DATABASE_URL 到 .env");
  return true;
}

function run(cmd) {
  execSync(cmd, { stdio: "inherit", cwd: root, shell: true });
}

console.log("\n=== iPhone Store 一键配置 ===\n");

if (!syncEnv()) process.exit(1);

try {
  console.log("\n→ 连接 MySQL 并创建数据表...\n");
  run("npx prisma db push");
  console.log("\n→ 导入初始数据...\n");
  run("npx prisma db seed");
  console.log("\n✅ 数据库配置完成！\n");
  console.log("  盲盒首页: http://localhost:3000");
  console.log("  后台说明: http://localhost:3000/admin-setup");
  console.log("  Navicat 里可编辑 products / blind_box_prizes 等表\n");
} catch {
  console.log("\n⚠️  无法连接 MySQL，请检查：\n");
  console.log("  1. MySQL 服务是否已启动（Navicat 点「测试连接」）");
  console.log("  2. .env.local 里密码是否正确，例如：");
  console.log("     DATABASE_URL=mysql://root:你的密码@localhost:3306/iphone_store");
  console.log("  3. 或在 Navicat 里手动运行 database/init.sql\n");
  console.log("  网站仍可用内置默认数据：npm run dev\n");
  process.exit(1);
}
