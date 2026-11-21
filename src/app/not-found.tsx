import Link from "next/link";
import { FleurDeLis } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid flex-1 place-items-center px-5 py-24 text-center">
      <div>
        <FleurDeLis className="mx-auto h-10 w-10 text-burgundy" />
        <h1 className="mt-4 font-display text-5xl text-burgundy">Nothing in this oven</h1>
        <p className="mt-3 text-muted">The page or order you are looking for doesn&apos;t exist.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full border border-burgundy px-6 py-3 text-sm font-semibold text-burgundy">Home</Link>
          <Link href="/order" className="rounded-full bg-burgundy px-6 py-3 text-sm font-semibold text-cream">Pre-order</Link>
        </div>
      </div>
    </main>
  );
}
