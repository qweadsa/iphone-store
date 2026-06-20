import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/user-auth";
import { needsShippingClaim, getPrizeFulfillment } from "@/lib/blindbox-fulfillment";
import { getEmailValidationMessage, validateEmail } from "@/lib/email-validation";
import type { BlindBoxPrize } from "@/types/blindbox";

export async function GET(req: Request) {
  const paymentId = new URL(req.url).searchParams.get("paymentId")?.trim();
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment" }, { status: 400 });
  }

  const draw = await prisma.blindBoxDraw.findFirst({ where: { paymentId } });
  if (!draw) {
    return NextResponse.json({ error: "Draw not found" }, { status: 404 });
  }

  const prize = {
    key: draw.prizeType,
    name: draw.prizeName,
    weight: 0,
    emoji: "🎁",
    fulfillmentType: (draw.fulfillmentType ?? draw.prizeType) as BlindBoxPrize["fulfillmentType"],
  } as BlindBoxPrize;
  const fulfillment = getPrizeFulfillment(prize);

  return NextResponse.json({
    paymentId,
    prizeName: draw.prizeName,
    fulfillmentType: draw.fulfillmentType,
    needsShipping: needsShippingClaim(fulfillment),
    claimed: !!draw.claimedAt,
    claim: draw.claimedAt
      ? {
          name: draw.claimName,
          phone: draw.claimPhone,
          email: draw.claimEmail,
          address: draw.claimAddress,
          city: draw.claimCity,
          state: draw.claimState,
          zip: draw.claimZip,
          claimedAt: draw.claimedAt,
        }
      : null,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentId = body.paymentId?.trim();
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment" }, { status: 400 });
    }

    const draw = await prisma.blindBoxDraw.findFirst({ where: { paymentId } });
    if (!draw) {
      return NextResponse.json({ error: "Draw not found" }, { status: 404 });
    }

    const prize = {
      key: draw.prizeType,
      name: draw.prizeName,
      weight: 0,
      emoji: "🎁",
      fulfillmentType: (draw.fulfillmentType ?? draw.prizeType) as BlindBoxPrize["fulfillmentType"],
    } as BlindBoxPrize;
    const fulfillment = getPrizeFulfillment(prize);

    if (!needsShippingClaim(fulfillment)) {
      return NextResponse.json({ error: "此奖品无需填写地址" }, { status: 400 });
    }
    if (draw.claimedAt) {
      return NextResponse.json({ error: "地址已提交" }, { status: 409 });
    }

    const name = body.name?.trim();
    const emailRaw = body.email?.trim();
    const address = body.address?.trim();
    if (!name || !emailRaw || !address) {
      return NextResponse.json({ error: "请填写姓名、邮箱和地址" }, { status: 400 });
    }

    const emailCheck = validateEmail(emailRaw);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { error: getEmailValidationMessage(emailCheck.reason, "zh") },
        { status: 400 },
      );
    }
    const email = emailCheck.normalized;

    const updated = await prisma.blindBoxDraw.update({
      where: { id: draw.id },
      data: {
        claimName: name,
        claimEmail: email.toLowerCase(),
        claimPhone: body.phone?.trim() || null,
        claimAddress: address,
        claimCity: body.city?.trim() || "",
        claimState: body.state?.trim() || "",
        claimZip: body.zip?.trim() || "",
        claimedAt: new Date(),
        email: draw.email ?? email.toLowerCase(),
      },
    });

    await prisma.order.updateMany({
      where: { paymentId },
      data: {
        customerName: name,
        email: email.toLowerCase(),
        phone: body.phone?.trim() || null,
        address,
        city: body.city?.trim() || "",
        state: body.state?.trim() || "",
        zip: body.zip?.trim() || "",
      },
    });

    const user = await getSessionUser();
    if (user && !updated.userId) {
      await prisma.blindBoxDraw.update({
        where: { id: draw.id },
        data: { user: { connect: { id: user.id } } },
      });
    }

    return NextResponse.json({ ok: true, claimedAt: updated.claimedAt });
  } catch {
    return NextResponse.json({ error: "提交失败" }, { status: 500 });
  }
}
