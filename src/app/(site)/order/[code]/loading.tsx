export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse px-5 py-14" aria-busy="true" aria-label="Loading order">
      <div className="mx-auto h-10 w-10 rounded-full bg-line" />
      <div className="mx-auto mt-5 h-10 w-64 rounded bg-line" />
      <div className="mt-10 h-80 rounded-3xl bg-linen" />
    </div>
  );
}
