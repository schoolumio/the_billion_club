import "server-only";
import QRCode from "qrcode";

export async function qrSvg(text: string, opts: { dark?: string; light?: string } = {}) {
  return QRCode.toString(text, { type: "svg", errorCorrectionLevel: "M", margin: 1, color: { dark: opts.dark ?? "#0d1b2b", light: opts.light ?? "#ffffff" } });
}
