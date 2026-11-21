import Link from "next/link";

export function FleurDeLis({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className} fill="currentColor">
      <path d="M32 4c-4 6-7 11-7 17 0 5 3 8 7 12 4-4 7-7 7-12 0-6-3-11-7-17Z" />
      <path d="M30 35c-3-5-8-9-15-9-5 0-9 3-9 8 0 4 3 7 7 7 3 0 5-2 5-5-2 1-5 0-5-2 0-3 3-4 6-3 5 1 8 6 9 11l2-7Z" />
      <path d="M34 35c3-5 8-9 15-9 5 0 9 3 9 8 0 4-3 7-7 7-3 0-5-2-5-5 2 1 5 0 5-2 0-3-3-4-6-3-5 1-8 6-9 11l-2-7Z" />
      <rect x="20" y="40" width="24" height="4" rx="2" />
      <path d="M29 44h6l-1 12c0 2-1 3-2 3s-2-1-2-3l-1-12Z" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 text-burgundy ${className}`}>
      <FleurDeLis className="h-6 w-6" />
      <span className="font-display text-3xl font-semibold italic leading-none tracking-tight">
        Mémoire
      </span>
    </Link>
  );
}
