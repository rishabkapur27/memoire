export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse px-5 py-12" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-28 rounded bg-line" />
      <div className="mt-4 h-12 w-80 rounded bg-line" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-linen" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-linen" />
      </div>
    </div>
  );
}
