import { Prisma } from "@prisma/client";

export function adminApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return "未登录，请重新登录后台";
  }

  const message =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.message
      : error instanceof Error
        ? error.message
        : fallback;

  if (message.includes("Unknown argument `displayOdds`")) {
    return "Prisma 客户端过期：请在项目目录运行 npx prisma generate，然后重启 npm run dev";
  }

  if (message.includes("Unknown argument `winnersDemoMode`")) {
    return "Prisma 客户端过期：请在项目目录运行 npx prisma generate，然后重启 npm run dev";
  }

  if (message.includes("Unknown argument `demoWinnersJson`")) {
    return "Prisma 客户端过期：请在项目目录运行 npx prisma generate，然后重启 npm run dev";
  }

  if (message.includes("Unknown argument `statsDemoMode`")) {
    return "Prisma 客户端过期：请在项目目录运行 npx prisma generate，然后重启 npm run dev";
  }

  if (/Unknown column [`']display_odds[`']/.test(message)) {
    return "数据库缺少 display_odds 字段：请运行 npm run db:push，或在 Navicat 执行 database/init.sql 末尾的 ALTER 语句";
  }

  if (/Unknown column [`']winners_demo_mode[`']/.test(message)) {
    return "数据库缺少 winners_demo_mode 字段：请运行 npm run db:push，或在 Navicat 执行 database/init.sql 末尾的 ALTER 语句";
  }

  if (/Unknown column [`']demo_winners_json[`']/.test(message)) {
    return "数据库缺少 demo_winners_json 字段：请运行 npm run db:push，或在 Navicat 执行 database/init.sql 末尾的 ALTER 语句";
  }

  if (/Unknown column [`']stats_demo_mode[`']/.test(message)) {
    return "数据库缺少 stats_demo_mode 字段：请运行 npm run db:push，或在 Navicat 执行 database/init.sql 末尾的 ALTER 语句";
  }

  if (/Unknown column [`']fulfillment_type[`']/.test(message) && message.includes("blind_box_draws")) {
    return "数据库缺少 blind_box_draws 领奖字段：请运行 npm run db:push，或在 Navicat 执行 database/init.sql 末尾的 ALTER 语句";
  }

  if (message.includes("Record to update not found")) {
    return "记录不存在，请刷新页面后重试";
  }

  return fallback;
}
