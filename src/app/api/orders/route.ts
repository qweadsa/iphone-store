import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import { findGuestRecordsByEmail } from "@/lib/guest-order-lookup";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";

type OrderItemInput = {
  productId: string;
  name: string;
  color: string;
  storage: string;
  price: number;
  quantity: number;
};

export async function POST(req: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "数据库未配置" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const items: OrderItemInput[] = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "购物车为空" }, { status: 400 });
    }
    if (!body.customerName?.trim() || !body.email?.trim() || !body.address?.trim()) {
      return NextResponse.json({ error: "请填写姓名、邮箱和地址" }, { status: 400 });
    }

    const emailCheck = validateEmail(body.email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: getEmailValidationMessage(emailCheck.reason, "zh") },
        { status: 400 },
      );
    }

    const paymentId = body.paymentId?.trim();
    if (!paymentId) {
      return NextResponse.json({ error: "请先完成支付" }, { status: 402 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const payment = await prisma.payment.findUnique({
      where: { paymentId },
    });
    if (!payment || payment.status !== "completed") {
      return NextResponse.json({ error: "请先完成支付" }, { status: 402 });
    }
    if (Math.abs(payment.amount - total) > 0.01) {
      return NextResponse.json({ error: "支付金额不匹配" }, { status: 400 });
    }
    if (payment.purpose !== "order" && payment.purpose !== "cart") {
      return NextResponse.json({ error: "该支付单不能用于商城下单" }, { status: 400 });
    }

    const used = await prisma.order.findFirst({ where: { paymentId } });
    if (used) {
      return NextResponse.json({ error: "该支付单已用于下单" }, { status: 409 });
    }

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: body.customerName.trim(),
        email: emailCheck.normalized,
        phone: body.phone?.trim() || null,
        address: body.address.trim(),
        city: body.city?.trim() || "",
        state: body.state?.trim() || "",
        zip: body.zip?.trim() || "",
        total,
        status: "paid",
        paymentId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.name,
            color: item.color,
            storage: item.storage,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ orderNumber: order.orderNumber, id: order.id });
  } catch {
    return NextResponse.json({ error: "下单失败，请稍后重试" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "数据库未配置" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const emailRaw = searchParams.get("email")?.trim() ?? "";
  const emailCheck = validateEmail(emailRaw);
  if (!emailCheck.valid) {
    return NextResponse.json(
      { error: getEmailValidationMessage(emailCheck.reason, "zh") },
      { status: 400 },
    );
  }
  const email = emailCheck.normalized;

  try {
    const records = await findGuestRecordsByEmail(email);

    if (records.length === 0) {
      return NextResponse.json({ error: "未找到与该邮箱相关的订单或抽奖记录" }, { status: 404 });
    }

    return NextResponse.json({ email, records });
  } catch {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
