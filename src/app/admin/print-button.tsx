"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-line bg-linen px-4 py-1.5 text-sm font-semibold hover:border-burgundy/50 print:hidden"
    >
      Print bake sheet
    </button>
  );
}
