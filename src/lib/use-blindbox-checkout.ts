"use client";

import { useMemo } from "react";
import { computeBlindBoxCheckout } from "@/lib/blindbox-wallet";
import { useUser } from "@/lib/user-context";

export function useBlindBoxCheckout(fullPrice: number) {
  const { user } = useUser();
  return useMemo(
    () => computeBlindBoxCheckout(fullPrice, user?.balance ?? 0),
    [fullPrice, user?.balance],
  );
}
