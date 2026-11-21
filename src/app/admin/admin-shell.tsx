import Link from "next/link";
import { Wordmark } from "@/components/brand";
import { logoutAction } from "./actions";

export function AdminShell({ active, children }: { active: "orders" | "products"; children: React.ReactNode }) {
  const tab = (href: string, label: string, key: typeof active) => (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active === key ? "bg-burgundy text-cream" : "text-ink/70 hover:bg-parchment"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <>
      <header className="border-b border-line bg-linen print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Wordmark />
            <span className="hidden rounded-full bg-parchment px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted sm:inline">
              Bakehouse
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {tab("/admin", "Orders", "orders")}
            {tab("/admin/products", "Menu", "products")}
            <form action={logoutAction}>
              <button className="ml-2 text-sm text-muted hover:text-burgundy">Sign out</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">{children}</main>
    </>
  );
}
