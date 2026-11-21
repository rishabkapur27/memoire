import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { LoginForm } from "./login-form";
import { FleurDeLis } from "@/components/brand";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bakehouse login", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid flex-1 place-items-center px-5 py-20">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-linen p-8 text-center">
        <FleurDeLis className="mx-auto h-9 w-9 text-burgundy" />
        <h1 className="mt-3 font-display text-3xl text-burgundy">Bakehouse</h1>
        <p className="mt-1 text-sm text-muted">Staff only</p>
        <LoginForm />
      </div>
    </main>
  );
}
