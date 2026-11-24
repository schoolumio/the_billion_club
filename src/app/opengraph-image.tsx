import { renderOg, OG_SIZE } from "@/lib/og";

export const alt = "The Billionaire Circle — 10 million people. One shared vision. A new generation of wealth.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "A movement for shared prosperity",
    title: "10 million people. One shared vision. A new generation of wealth.",
    subtitle: "Join the founding community of a transparently governed movement to build wealth, businesses and jobs across Nigeria.",
  });
}
