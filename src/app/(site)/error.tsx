"use client";

import { useEffect } from "react";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 py-24 text-center">
      <h1 className="font-display text-4xl text-burgundy">The oven hiccupped</h1>
      <p className="mt-3 text-muted">
        Something went wrong loading this page. Your basket hasn&apos;t been charged or lost. Please try again.
      </p>
      <button onClick={reset} className="mt-8 rounded-full bg-burgundy px-6 py-3 font-semibold text-cream hover:bg-burgundy-deep">
        Try again
      </button>
      {error.digest && <p className="mt-4 font-mono text-xs text-muted">Ref: {error.digest}</p>}
    </div>
  );
}
