"use client";
import { useState } from "react";
import { Check, Copy, Download, Mail, QrCode, Send, Share2 } from "lucide-react";

function track(channel: string) {
  fetch("/api/referrals/activity", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "share", channel }), keepalive: true }).catch(() => {});
}

const WhatsApp = (p: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={p.className} aria-hidden fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.2-.2-.5-.3Z" /></svg>
);

export function ShareKit({ url, code, firstName, qr }: { url: string; code: string; firstName: string; qr: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState(
    `I've joined The Billionaire Circle founding community — a movement to build wealth together and create jobs across Nigeria. It's free to join and it's not an investment. Join with my link:`,
  );
  const full = `${message} ${url}`;
  const enc = encodeURIComponent;

  const copy = async (text: string, what: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* older browsers */ }
    setCopied(what);
    track(what === "link" ? "copy" : "copy_message");
    setTimeout(() => setCopied(null), 1800);
  };
  const share = (channel: string, href: string) => { track(channel); window.open(href, "_blank", "noopener,noreferrer"); };
  const downloadQr = () => {
    const blob = new Blob([qr], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TBC-referral-QR-${code}.svg`;
    a.click();
    track("qr_download");
  };

  const btn = "flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl border border-navy-100 bg-white px-2 py-3 text-[0.7rem] font-semibold text-navy-800 transition hover:border-navy-300 hover:bg-mist";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">Your personal link</p>
        <div className="mt-2 flex items-stretch gap-2">
          <input readOnly value={url} aria-label="Your referral link" onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 rounded-xl border border-navy-200 bg-mist px-3 py-3 font-mono text-xs text-navy-900 sm:text-sm" />
          <button type="button" onClick={() => copy(url, "link")} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#0d1b2b] px-4 text-sm font-semibold text-white hover:bg-navy-800">
            {copied === "link" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}{copied === "link" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-xs text-navy-500">Referral code: <span className="font-mono font-semibold tracking-wider text-navy-900">{code}</span></p>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <button type="button" className={btn} onClick={() => share("whatsapp", `https://wa.me/?text=${enc(full)}`)}><WhatsApp className="h-5 w-5 text-[#1f9d55]" />WhatsApp</button>
          <button type="button" className={btn} onClick={() => share("facebook", `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}><span className="text-base font-black text-[#1877f2]" aria-hidden>f</span>Facebook</button>
          <button type="button" className={btn} onClick={() => share("x", `https://x.com/intent/tweet?text=${enc(message)}&url=${enc(url)}`)}><span className="text-base font-black" aria-hidden>𝕏</span>X</button>
          <button type="button" className={btn} onClick={() => share("telegram", `https://t.me/share/url?url=${enc(url)}&text=${enc(message)}`)}><Send className="h-5 w-5 text-[#229ed9]" aria-hidden />Telegram</button>
          <button type="button" className={btn} onClick={() => share("email", `mailto:?subject=${enc(`${firstName} invited you to The Billionaire Circle`)}&body=${enc(full)}`)}><Mail className="h-5 w-5 text-navy-600" aria-hidden />Email</button>
          <button
            type="button"
            className={btn}
            onClick={async () => {
              if (navigator.share) { try { await navigator.share({ title: "The Billionaire Circle", text: message, url }); track("native"); } catch { /* cancelled */ } }
              else copy(full, "message");
            }}
          ><Share2 className="h-5 w-5 text-navy-600" aria-hidden />More</button>
        </div>

        <label className="mt-6 block text-xs font-semibold uppercase tracking-[0.2em] text-gold-700" htmlFor="invite-msg">Your invitation message</label>
        <textarea id="invite-msg" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))} rows={4} className="mt-2 w-full rounded-xl border border-navy-200 px-3 py-2.5 text-sm text-navy-900 focus:border-navy-900 focus:outline-none" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-navy-500">
          <span>Your link is added automatically. Please keep messages truthful — no promises of income.</span>
          <button type="button" onClick={() => copy(full, "message")} className="font-semibold text-navy-800 hover:underline">{copied === "message" ? "Copied ✓" : "Copy message"}</button>
        </div>
      </div>

      <div className="flex flex-col items-center rounded-2xl border border-navy-100 bg-mist p-5 text-center">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold-700"><QrCode className="h-3.5 w-3.5" aria-hidden /> Scan to join</p>
        <div className="mt-3 w-44 rounded-xl bg-white p-2 shadow-sm [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label={`QR code for ${url}`} />
        <div className="mt-4 grid w-full gap-2">
          <button type="button" onClick={downloadQr} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800 hover:bg-white/60"><Download className="h-3.5 w-3.5" aria-hidden />QR code (SVG)</button>
          <a href="/api/referral-card" download={`TBC-invite-${code}.png`} onClick={() => track("card_download")} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#d4af37] px-4 py-2 text-xs font-semibold text-[#0d1b2b] hover:bg-gold-300"><Download className="h-3.5 w-3.5" aria-hidden />Referral card (PNG)</a>
          <a href="/api/referral-card?format=flyer" download={`TBC-flyer-${code}.png`} onClick={() => track("flyer_download")} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-semibold text-navy-800"><Download className="h-3.5 w-3.5" aria-hidden />A4 QR flyer (PNG)</a>
        </div>
      </div>
    </div>
  );
}
