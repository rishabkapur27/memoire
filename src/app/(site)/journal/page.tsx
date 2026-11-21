import type { Metadata } from "next";
import Link from "next/link";
import { posts } from "@/lib/journal";
import { formatDate } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes from the Mémoire bakehouse on sourdough, French bread and baking in Gurgaon.",
  alternates: { canonical: "/journal" },
};

export default function JournalIndex() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Le journal</p>
      <h1 className="mt-2 font-display text-5xl text-burgundy">Notes from the bakehouse</h1>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {posts.map((p) => (
          <li key={p.slug} className="py-8">
            <Link href={`/journal/${p.slug}`} className="group block">
              <p className="text-xs uppercase tracking-widest text-muted">
                {formatDate(p.date)} · {p.readMinutes} min read
              </p>
              <h2 className="mt-2 font-display text-3xl text-ink group-hover:text-burgundy">{p.title}</h2>
              <p className="mt-2 text-muted">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
