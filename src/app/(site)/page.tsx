import Link from "next/link";
import { FleurDeLis } from "@/components/brand";
import { Baguette, Boule, WheatSprig } from "@/components/illustrations";
import { RULES, SITE } from "@/lib/config";
import { listProducts, type Product } from "@/lib/data";
import { formatINR } from "@/lib/dates";

export const revalidate = 300;

async function getMenu(): Promise<Product[]> {
  try {
    return await listProducts();
  } catch (err) {
    console.error("Menu unavailable", err);
    return [];
  }
}

const steps = [
  {
    n: "I",
    title: "Choose your day",
    body: `Book up to a week ahead. Orders for a bake day close at ${RULES.cutoffHour % 12} pm the evening before, when we mix the dough.`,
  },
  {
    n: "II",
    title: "Pick your loaves",
    body: "We bake a fixed number of each bread daily. What you see is what is left in the oven plan, live.",
  },
  {
    n: "III",
    title: "Collect it warm",
    body: "Pick up from the bakehouse in your slot, or have it delivered anywhere in Gurgaon. Pay by UPI or cash.",
  },
];

const faqs = [
  {
    q: "Why pre-order?",
    a: "Good bread takes 36 hours. Knowing your order before we mix means nothing is wasted and your loaf is never a day old.",
  },
  {
    q: "Do you deliver?",
    a: `Yes, across Gurgaon (pincodes starting 1220). Delivery is ${formatINR(RULES.deliveryFeeInr)}, free on orders above ${formatINR(RULES.freeDeliveryOverInr)}.`,
  },
  {
    q: "How do I pay?",
    a: "Pay by UPI or cash when you collect or when your bread arrives. No card needed to reserve.",
  },
  {
    q: "Can I change or cancel?",
    a: "Message us with your order code before the 8 pm cutoff and we will sort it out.",
  },
];

export default async function Home() {
  const menu = await getMenu();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: "Mémoire",
    slogan: SITE.tagline,
    url: SITE.url,
    address: { "@type": "PostalAddress", addressLocality: "Gurgaon", addressRegion: "Haryana", addressCountry: "IN" },
    servesCuisine: "French",
    priceRange: "₹₹",
    hasMenu: `${SITE.url}/order`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1.15fr_1fr] md:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Boulangerie · {SITE.city}
            </p>
            <h1 className="mt-5 font-display text-5xl font-medium leading-[1.02] text-burgundy sm:text-6xl md:text-7xl">
              Bread worth <em className="font-semibold">remembering.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink/80">
              Slow fermented French loaves, baked each morning in small batches. Reserve yours by{" "}
              {RULES.cutoffHour % 12} pm and it will be waiting for you, still warm.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/order"
                className="rounded-full bg-burgundy px-7 py-3.5 text-base font-semibold text-cream shadow-sm transition hover:bg-burgundy-deep"
              >
                Reserve tomorrow&apos;s bread
              </Link>
              <Link href="#breads" className="text-sm font-semibold text-burgundy underline-offset-4 hover:underline">
                See the menu
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rotate-1 rounded-[2rem] border border-line bg-linen p-8 shadow-[0_30px_60px_-30px_rgba(78,21,32,0.35)]">
              <div className="flex items-center justify-between text-burgundy">
                <WheatSprig className="h-16 w-6 opacity-70" />
                <div className="text-center">
                  <FleurDeLis className="mx-auto h-8 w-8" />
                  <p className="mt-1 font-display text-xl italic">Fournée du jour</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Today&apos;s bake</p>
                </div>
                <WheatSprig className="h-16 w-6 -scale-x-100 opacity-70" />
              </div>
              <Boule className="mx-auto mt-6 w-56 text-burgundy" />
              <Baguette className="mx-auto -mt-2 w-60 text-burgundy/80" />
              <p className="mt-4 text-center font-display text-lg italic text-ink/70">
                Farine, eau, sel, temps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="breads" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">La carte</p>
            <h2 className="mt-2 font-display text-4xl text-burgundy sm:text-5xl">This week&apos;s breads</h2>
          </div>
          <Link href="/order" className="text-sm font-semibold text-burgundy hover:underline">
            Check availability →
          </Link>
        </div>

        {menu.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-line bg-linen p-8 text-muted">
            The menu is being chalked up. <Link href="/order" className="font-semibold text-burgundy underline">Head to pre-orders</Link> to see what is baking.
          </p>
        ) : (
          <ul className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {menu.map((p) => (
              <li key={p.id} className="flex flex-col bg-linen p-7">
                <p className="font-display text-sm italic text-gold">{p.frenchName}</p>
                <div className="mt-1 flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-semibold text-ink">{p.name}</h3>
                  <span className="shrink-0 font-semibold text-burgundy">{formatINR(p.priceInr)}</span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
                {p.weightGrams && <p className="mt-4 text-xs uppercase tracking-widest text-muted/80">{p.weightGrams} g</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 border-y border-line bg-burgundy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Comment ça marche</p>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Baked to order, never to waste</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="font-display text-5xl italic text-gold">{s.n}</span>
                <h3 className="mt-3 font-display text-2xl">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/80">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center font-display text-4xl text-burgundy">Questions, answered</h2>
        <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-linen">
          {faqs.map((f) => (
            <details key={f.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink">
                {f.q}
                <span className="text-burgundy transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/order"
            className="inline-block rounded-full bg-burgundy px-8 py-4 font-semibold text-cream transition hover:bg-burgundy-deep"
          >
            Start your pre-order
          </Link>
        </div>
      </section>
    </>
  );
}
