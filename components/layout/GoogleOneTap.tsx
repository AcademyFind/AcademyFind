"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/auth-client";

export function GoogleOneTap() {
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      authClient.oneTap({}).catch((err) => {
        console.error("Google One Tap error:", err);
      });
    }
  }, [session, isPending]);

  return null;
}
