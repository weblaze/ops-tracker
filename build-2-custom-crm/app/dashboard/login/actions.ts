"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken, SESSION_COOKIE } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (pin !== process.env.DASHBOARD_PIN) {
    redirect(`/dashboard/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const token = await createSessionToken(process.env.DASHBOARD_PIN_SECRET!);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  redirect(next);
}
