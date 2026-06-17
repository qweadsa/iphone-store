/**
 * 一次性清理测试数据（与后台「一键清理」相同）
 * 用法: npx tsx scripts/cleanup-test-data.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [walletTx, draws, orderItems, orders, payments, users] =
    await prisma.$transaction([
      prisma.walletTransaction.deleteMany(),
      prisma.blindBoxDraw.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.payment.deleteMany(),
      prisma.user.deleteMany(),
    ]);

  await prisma.blindBoxConfig.updateMany({
    where: { id: 1 },
    data: { winnersDemoMode: false },
  });

  console.log("Cleanup done:");
  console.log(`  users: ${users.count}`);
  console.log(`  payments: ${payments.count}`);
  console.log(`  orders: ${orders.count}`);
  console.log(`  orderItems: ${orderItems.count}`);
  console.log(`  draws: ${draws.count}`);
  console.log(`  walletTransactions: ${walletTx.count}`);
  console.log("  winnersDemoMode -> false");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
