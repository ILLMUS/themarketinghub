// Dynamic OG image generator – returns a branded PNG
// Routes: /og-image?type=ad&id=...   |   ?type=category&id=...&location=...   |   ?type=home
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let wasmReady: Promise<void> | null = null;
function ensureWasm() {
  if (!wasmReady) {
    wasmReady = (async () => {
      const wasm = await fetch("https://esm.sh/@resvg/resvg-wasm@2.6.2/index_bg.wasm").then((r) => r.arrayBuffer());
      await initWasm(wasm);
    })();
  }
  return wasmReady;
}

const escape = (s: string) =>
  (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]!));

function wrap(text: string, max: number, maxLines: number) {
  const words = (text || "").split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/.{0,3}$/, "…");
  }
  return lines;
}

function buildSvg(opts: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  price?: string;
  imageDataUrl?: string;
}) {
  const { eyebrow, title, subtitle, price, imageDataUrl } = opts;
  const W = 1200, H = 630;
  const titleLines = wrap(title, 26, 3);
  const titleStartY = 230;

  const hasImg = !!imageDataUrl;
  const textX = hasImg ? 60 : 80;
  const textW = hasImg ? 600 : 1040;

  const imgBlock = hasImg
    ? `<defs><clipPath id="c"><rect x="700" y="60" width="440" height="510" rx="24"/></clipPath></defs>
       <image href="${imageDataUrl}" x="700" y="60" width="440" height="510" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/>
      <stop offset="1" stop-color="#2563eb"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="120" cy="540" r="180" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="1080" cy="120" r="140" fill="#ffffff" fill-opacity="0.05"/>

  <g font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" fill="#ffffff">
    <text x="${textX}" y="90" font-size="28" font-weight="700" letter-spacing="2" fill-opacity="0.85">MARKET HUB</text>
    <text x="${textX}" y="170" font-size="26" font-weight="600" fill-opacity="0.9">${escape(eyebrow)}</text>
    ${titleLines
      .map((l, i) => `<text x="${textX}" y="${titleStartY + i * 76}" font-size="64" font-weight="800">${escape(l)}</text>`)
      .join("")}
    ${price ? `<text x="${textX}" y="${titleStartY + titleLines.length * 76 + 40}" font-size="56" font-weight="800" fill="#fbbf24">${escape(price)}</text>` : ""}
    ${subtitle ? `<text x="${textX}" y="560" font-size="28" fill-opacity="0.9">${escape(subtitle)}</text>` : ""}
  </g>

  ${imgBlock}
</svg>`;
}

async function fetchImageDataUrl(url: string): Promise<string | undefined> {
  try {
    const r = await fetch(url);
    if (!r.ok) return undefined;
    const ct = r.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    return `data:${ct};base64,${btoa(bin)}`;
  } catch {
    return undefined;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "home";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    let eyebrow = "Eswatini Marketplace";
    let title = "Buy & Sell in Eswatini";
    let subtitle: string | undefined = "Cars · Property · Electronics · Jobs · Services";
    let price: string | undefined;
    let imageUrl: string | undefined;

    if (type === "ad") {
      const id = url.searchParams.get("id");
      if (id) {
        const { data } = await supabase
          .from("advertisements")
          .select("title, price, location, images, categories(name)")
          .eq("id", id)
          .maybeSingle();
        if (data) {
          title = data.title;
          price = `E${Number(data.price).toLocaleString()}`;
          eyebrow = (data as any).categories?.name || "Listing";
          subtitle = data.location ? `📍 ${data.location}` : undefined;
          imageUrl = data.images?.[0];
        }
      }
    } else if (type === "category") {
      const id = url.searchParams.get("id");
      const location = url.searchParams.get("location") || "";
      if (id) {
        const { data } = await supabase.from("categories").select("name, description").eq("id", id).maybeSingle();
        if (data) {
          eyebrow = "Browse Category";
          title = location ? `${data.name} in ${location}` : data.name;
          subtitle = data.description || "Discover great deals from local sellers";
        }
      }
    }

    await ensureWasm();
    const imageDataUrl = imageUrl ? await fetchImageDataUrl(imageUrl) : undefined;
    const svg = buildSvg({ eyebrow, title, subtitle, price, imageDataUrl });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();

    return new Response(png, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    return new Response(`Error: ${(e as Error).message}`, { status: 500, headers: corsHeaders });
  }
});