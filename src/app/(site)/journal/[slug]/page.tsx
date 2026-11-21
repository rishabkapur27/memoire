import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, posts } from "@/lib/journal";
import { formatDate } from "@/lib/dates";
import { SITE } from "@/lib/config";

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Mémoire" },
    publisher: { "@type": "Organization", name: "Mémoire" },
    mainEntityOfPage: `${SITE.url}/journal/${post.slug}`,
  };

  return (
    <article className="mx-auto max-w-2xl px-5 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/journal" className="text-sm font-semibold text-burgundy hover:underline">← Journal</Link>
      <p className="mt-8 text-xs uppercase tracking-widest text-muted">
        {formatDate(post.date)} · {post.readMinutes} min read
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-burgundy">{post.title}</h1>
      <div className="mt-10 space-y-6 text-lg leading-relaxed text-ink/85">
        {post.body.map((b, i) => (
          <section key={i}>
            {b.h && <h2 className="mb-2 font-display text-2xl font-semibold text-ink">{b.h}</h2>}
            <p>{b.p}</p>
          </section>
        ))}
      </div>
      <div className="mt-14 rounded-3xl bg-burgundy p-8 text-center text-cream">
        <p className="font-display text-3xl">Taste the difference</p>
        <p className="mt-2 text-cream/80">Reserve tomorrow&apos;s bake before 8 pm tonight.</p>
        <Link href="/order" className="mt-6 inline-block rounded-full bg-cream px-6 py-3 font-semibold text-burgundy">
          Pre-order now
        </Link>
      </div>
    </article>
  );
}
