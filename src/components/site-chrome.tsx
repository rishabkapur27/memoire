import Link from "next/link";
import { Wordmark } from "./brand";
import { SITE } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Wordmark />
        <nav className="flex items-center gap-5 text-sm font-medium text-ink/80">
          <Link href="/#breads" className="hidden hover:text-burgundy sm:inline">
            Breads
          </Link>
          <Link href="/#how" className="hidden hover:text-burgundy sm:inline">
            How it works
          </Link>
          <Link href="/journal" className="hidden hover:text-burgundy sm:inline">
            Journal
          </Link>
          <Link href="/track" className="hover:text-burgundy">
            Track order
          </Link>
          <Link
            href="/order"
            className="rounded-full bg-burgundy px-4 py-2 text-cream transition hover:bg-burgundy-deep"
          >
            Pre-order
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-parchment/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-3">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-muted">
            {SITE.tagline}. Slow fermented French bread, baked in small batches in {SITE.city}.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-ink">Visit</p>
          <p className="mt-2 text-muted">{SITE.pickupAddress}</p>
          <p className="mt-1 text-muted">Tuesday to Sunday. The oven rests on Mondays.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-ink">Explore</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li><Link href="/order" className="hover:text-burgundy">Pre-order bread</Link></li>
            <li><Link href="/track" className="hover:text-burgundy">Track an order</Link></li>
            <li><Link href="/journal" className="hover:text-burgundy">Journal</Link></li>
            {SITE.instagram && (
              <li><a href={SITE.instagram} className="hover:text-burgundy" rel="noopener noreferrer" target="_blank">Instagram</a></li>
            )}
          </ul>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted">
        © {new Date().getFullYear()} Mémoire. Made with flour, water, salt and time.
      </p>
    </footer>
  );
}
