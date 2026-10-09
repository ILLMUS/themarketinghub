import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, ShoppingCart } from "lucide-react";

type Tier = "premium" | "featured" | null;

// Adjust these field names to match your `advertisements` table if they differ.
const tierOf = (ad: any): Tier => {
  const t = String(ad.tier ?? ad.listing_type ?? ad.plan ?? "").toLowerCase();
  if (ad.is_premium || t === "premium") return "premium";
  if (ad.is_featured || ad.featured || t === "featured") return "featured";
  return null;
};

const formatPrice = (p: any) =>
  p === null || p === undefined || p === "" || isNaN(Number(p))
    ? "Contact"
    : `E${Number(p).toLocaleString("en-US")}`;

interface AdCardProps {
  ad: any;
  /** Mirrors the layout (badge/text right, buttons left) like the right column in the mockup, mobile only. */
  mirror?: boolean;
}

export const AdCard = ({ ad, mirror = false }: AdCardProps) => {
  const [liked, setLiked] = useState(false);
  const tier = tierOf(ad);
  const image: string | undefined = ad.images?.[0] ?? ad.image_url ?? ad.image;
  const category = ad.categories?.name ?? "Listing";

  const rowMirror = mirror ? "max-sm:flex-row-reverse" : "";
  const textMirror = mirror ? "max-sm:text-right" : "";
  const justifyMirror = mirror ? "max-sm:justify-end" : "";

  return (
    <article
      className="group relative rounded-[2rem] p-[1.5px] transition-all duration-500 hover:-translate-y-1.5
                 bg-[linear-gradient(135deg,#FFC82C_0%,#1E5BFF_48%,#0B1F5C_100%)]
                 shadow-[0_10px_30px_-10px_rgba(30,91,255,0.55)] hover:shadow-[0_18px_45px_-8px_rgba(255,200,44,0.45)]"
    >
      <div className="relative overflow-hidden rounded-[calc(2rem-1.5px)] bg-[linear-gradient(160deg,#07123A_0%,#0E2A7C_58%,#1E5BFF_140%)] p-2.5">
        {/* futuristic grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* yellow corner glow */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-[#FFC82C]/25 blur-3xl" />
        {/* hover shine sweep */}
        <span className="pointer-events-none absolute inset-0 z-20 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {/* Image area */}
        <Link to={`/ad/${ad.id}`} className="relative z-10 block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/15 bg-[linear-gradient(135deg,#0B1F5C,#1E5BFF_70%,#FFC82C_160%)]">
            {image ? (
              <img
                src={image}
                alt={ad.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xl font-extralight tracking-[0.25em] text-white/80 uppercase">
                  {tier ?? "Ad"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07123A]/70 via-transparent to-transparent" />
            {tier === "premium" && (
              <span className="absolute top-2 left-2 rounded-full bg-black/40 px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-[#FFC82C] uppercase backdrop-blur-md border border-[#FFC82C]/50">
                ★ Premium
              </span>
            )}
          </div>
        </Link>

        {/* Details */}
        <div className={`relative z-10 mt-3 flex items-end gap-2 ${rowMirror}`}>
          <Link to={`/ad/${ad.id}`} className={`min-w-0 flex-1 space-y-1 ${textMirror}`}>
            <div className={`flex items-center gap-2 ${justifyMirror} ${rowMirror}`}>
              {tier && (
                <span className="rounded-full bg-[linear-gradient(90deg,#FFC82C,#FFE27A)] px-2.5 py-[2px] text-[9px] font-bold tracking-wider text-[#07123A] uppercase shadow-[0_0_12px_rgba(255,200,44,0.6)]">
                  {tier === "premium" ? "Premium" : "Featured"}
                </span>
              )}
              <span className="truncate text-[10px] font-medium tracking-[0.18em] text-sky-200/70 uppercase">
                {category}
              </span>
            </div>

            <h3 className="truncate text-sm font-bold text-white">{ad.title}</h3>

            <p className="text-base font-extrabold bg-[linear-gradient(90deg,#FFC82C,#FFF1B8)] bg-clip-text text-transparent">
              {formatPrice(ad.price)}
            </p>

            <p className={`flex items-center gap-1 text-[11px] text-sky-100/60 ${justifyMirror}`}>
              <MapPin className="h-3 w-3 text-[#FFC82C]" />
              <span className="truncate">{ad.location ?? "Eswatini"}</span>
            </p>
          </Link>

          {/* Actions */}
          <div className={`flex shrink-0 items-center gap-1.5 ${rowMirror}`}>
            <button
              type="button"
              aria-label="Add to cart"
              className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:border-[#FFC82C] hover:text-[#FFC82C] hover:shadow-[0_0_14px_rgba(255,200,44,0.6)]"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Save listing"
              onClick={() => setLiked((v) => !v)}
              className={`grid h-8 w-8 place-items-center rounded-full border transition ${
                liked
                  ? "border-[#FFC82C] bg-[#FFC82C] text-[#07123A] shadow-[0_0_16px_rgba(255,200,44,0.8)]"
                  : "border-white/20 bg-white/10 text-white hover:border-[#FFC82C] hover:text-[#FFC82C]"
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default AdCard;