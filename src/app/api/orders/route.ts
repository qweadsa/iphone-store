import { NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/orders";
import { findGuestBlindboxPayment } from "@/lib/guest-order-lookup";

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
        email: body.email.trim().toLowerCase(),
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
  const orderNumber = searchParams.get("orderNumber")?.trim();
  const email = searchParams.get("email")?.trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "请输入订单号和邮箱" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber, email },
      include: { items: true },
    });

    if (!order) {
      const blindbox = await findGuestBlindboxPayment(orderNumber, email);
      if (blindbox) {
        return NextResponse.json(blindbox);
      }
      return NextResponse.json({ error: "未找到订单" }, { status: 404 });
    }

    return NextResponse.json({ kind: "order", ...order });
  } catch {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}
