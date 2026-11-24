/** Lightweight loading skeleton shown while dashboard data streams in. */
export function PageSkeleton() {
  const b = "animate-pulse rounded-2xl bg-navy-100/70";
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className={`${b} h-9 w-64`} />
      <div className={`${b} mt-3 h-4 w-96 max-w-full`} />
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className={`${b} h-28`} />)}</div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]"><div className={`${b} h-72`} /><div className={`${b} h-72`} /></div>
    </div>
  );
}
