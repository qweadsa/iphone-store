import { prisma } from "@/lib/prisma";

export async function getPaymentRequireAdminConfirm(): Promise<boolean> {
  const settings = await prisma.siteSettings.findFirst({ where: { id: 1 } });
  return settings?.paymentRequireAdminConfirm ?? true;
}
