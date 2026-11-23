import Link from "next/link";

export function PreLaunchBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-9 items-center justify-center bg-gold-500 px-4 text-center text-[0.7rem] font-semibold text-navy-950 sm:h-8 sm:text-xs" role="note">
      <span className="truncate">
        <span className="hidden sm:inline">Pre-launch demonstration · </span>No contributions are being collected<span className="hidden sm:inline"> · Not yet licensed</span> ·{" "}
        <Link href="/compliance" className="underline underline-offset-2">Status</Link>
      </span>
    </div>
  );
}
