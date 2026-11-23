"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-navy-100 bg-white p-8 text-center">
      <h1 className="text-2xl font-medium text-navy-950">We couldn&apos;t load this page</h1>
      <p className="mt-2 text-sm text-navy-600">The data service may be unavailable. If you are running locally, check that PostgreSQL is running and run <code className="rounded bg-navy-50 px-1">npm run db:setup</code>.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white">Try again</button>
    </div>
  );
}
