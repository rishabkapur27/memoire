"use client";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-md flex-1 px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-burgundy">Couldn&apos;t load the bakehouse</h1>
      <p className="mt-3 text-sm text-muted">The database may be waking up. Give it a second and retry.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-burgundy px-6 py-3 font-semibold text-cream">Retry</button>
      {error.digest && <p className="mt-4 font-mono text-xs text-muted">Ref: {error.digest}</p>}
    </main>
  );
}
