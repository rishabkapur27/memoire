import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Check the status of your Mémoire bread pre-order with your order code.",
  alternates: { canonical: "/track" },
};

async function lookup(formData: FormData) {
  "use server";
  const raw = String(formData.get("code") ?? "").trim().toUpperCase().replace(/\s+/g, "");
  const code = raw.startsWith("M-") ? raw : `M-${raw}`;
  if (!/^M-[A-Z2-9]{8}$/.test(code)) redirect("/track?error=1");
  redirect(`/order/${code}`);
}

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-5 py-20 text-center">
      <h1 className="font-display text-4xl text-burgundy">Track your order</h1>
      <p className="mt-3 text-muted">Enter the code from your confirmation, like M-AB3CD5EF.</p>
      <form action={lookup} className="mt-8 flex gap-2">
        <label htmlFor="code" className="sr-only">Order code</label>
        <input
          id="code"
          name="code"
          required
          autoCapitalize="characters"
          placeholder="M-XXXXXXXX"
          className="flex-1 rounded-full border border-line bg-white/70 px-5 py-3 font-mono uppercase tracking-wider focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        />
        <button className="rounded-full bg-burgundy px-6 py-3 font-semibold text-cream hover:bg-burgundy-deep">Find</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-burgundy">That code doesn&apos;t look right. Check and try again.</p>}
    </div>
  );
}
