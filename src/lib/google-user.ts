import { prisma } from "@/lib/prisma";
import type { GoogleProfile } from "@/lib/google-oauth";

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const byGoogle = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });
  if (byGoogle) return byGoogle;

  const byEmail = await prisma.user.findUnique({
    where: { email: profile.email },
  });

  if (byEmail) {
    if (byEmail.googleId && byEmail.googleId !== profile.googleId) {
      throw new Error("GOOGLE_ACCOUNT_CONFLICT");
    }
    return prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleId: profile.googleId,
        name: byEmail.name || profile.name,
      },
    });
  }

  return prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      googleId: profile.googleId,
    },
  });
}
