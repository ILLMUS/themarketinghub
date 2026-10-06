import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

import { AdCard } from "@/components/AdCard";
import { BannerSlider } from "@/components/BannerSlider";
import { AdBanner } from "@/components/common/AdBanner";
import { SidebarBanner } from "@/components/SidebarBanner";

import { Button } from "@/components/ui/button";

import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Package,
  Wrench,
} from "lucide-react";

import { Seo } from "@/hooks/useSeo";
import { getUserLocation } from "@/utils/geolocation";

/* =========================================================
   TYPES
========================================================= */

type Category =
  | { name?: string | null }
  | { name?: string | null }[]
  | null;

type Advertisement = {
  id: string;
  title: string;
  price: number;
  images?: string[] | null;
  location?: string | null;

  status?: string | null;
  tier?: string | null;

  created_at?: string | null;
  expires_at?: string | null;

  categories?: Category;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BannerRow = Record<string, any>;

/* =========================================================
   BANNER CONFIG  (EDIT HERE IF YOUR DATABASE USES OTHER NAMES)

   BANNER_TABLE      -> the Supabase table the admin saves banners to
   *_POSITIONS       -> the value(s) saved in the "position" column
                        for each admin placement.

   Positions are compared after normalising (lower-case, symbols
   become "_"), so "Home Page (Top Banner)" and
   "home_page_top_banner" both match.
========================================================= */

const BANNER_TABLE = "banners";

const TOP_BANNER_POSITIONS = [
  "home_top",
  "home_page_top_banner",
  "home_top_banner",
  "top_banner",
  "home_hero",
  "hero",
  "top",
];

const MIDDLE_BANNER_POSITIONS = [
  "home_middle",
  "home_page_middle_banner",
  "home_middle_banner",
  "middle_banner",
  "middle",
];

const SIDEBAR_BANNER_POSITIONS = [
  "sidebar",
  "home_sidebar",
  "home_page_sidebar_banner",
  "sidebar_banner",
  "side",
];

/* =========================================================
   HELPERS
========================================================= */

const getCategoryName = (ad: Advertisement) => {
  if (Array.isArray(ad.categories)) {
    return ad.categories[0]?.name ?? "";
  }

  return ad.categories?.name ?? "";
};

/* The DATABASE TIER is the source of truth. */

const isFeatured = (ad: Advertisement) =>
  ad.tier === "e500" || ad.tier === "e350";

const isStandard = (ad: Advertisement) => ad.tier === "e250";

const uniqueAds = (ads: Advertisement[]) => {
  const seen = new Set<string>();

  return ads.filter((ad) => {
    if (seen.has(ad.id)) return false;
    seen.add(ad.id);
    return true;
  });
};

const normalise = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getBannerImage = (b: BannerRow): string =>
  b.image_url ?? b.image ?? b.banner_url ?? b.imageUrl ?? b.url ?? "";

const getBannerLink = (b: BannerRow): string =>
  b.link_url ?? b.link ?? b.target_url ?? b.href ?? "";

/* =========================================================
   FEATURED SLOT MAP

   Every featured position on the page owns ONE slot number.
   A single shared tick moves every slot to the next ad, and a
   slot always shows ads[(tick + slot) % total]. Because the slot
   numbers are different, an advertisement ID can only appear in
   ONE place at a time while the carousels play.
========================================================= */

const SLOT = {
  ROW2_LEFT: 0,
  ROW2_RIGHT: 1,
  ROW3_SMALL: 2,
  ROW5_PRODUCT: 3,
  ROW5_CAROUSEL_A: 4,
  ROW5_CAROUSEL_B: 5,
  ROW5_MINI_A: 6,
  ROW5_MINI_B: 7,
} as const;

const SLOT_COUNT = 8;
const ROTATION_MS = 5200;

/* Animated wrapper: remounts (and replays the slide-in) whenever
   the advertisement in that slot changes. */
const SlotMotion = ({
  id,
  slot,
  children,
  className = "",
}: {
  id?: string;
  slot: number;
  children: ReactNode;
  className?: string;
}) => (
  <div
    key={id ?? `empty-${slot}`}
    className={`market-carousel-slot h-full min-h-0 min-w-0 ${className}`}
    style={{ animationDelay: `${slot * 70}ms` } as CSSProperties}
  >
    {children}
  </div>
);

/* =========================================================
   DATABASE BANNER SLOT
   Fetches banners from the database, rotates them with the
   slide animation and falls back to the old component if the
   admin has not published a banner for that position.
========================================================= */

const DbBannerSlot = ({
  positions,
  parity,
  interval = 7000,
  arrows = false,
  fallback,
}: {
  positions: string[];
  /* 0 / 1 splits the banner list between two slots so the same
     banner is never shown in both. */
  parity?: 0 | 1;
  interval?: number;
  arrows?: boolean;
  fallback: ReactNode;
}) => {
  const { data: allBanners = [] } = useQuery({
    queryKey: ["home-banners", BANNER_TABLE],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(BANNER_TABLE)
        .select("*");

      if (error) throw error;

      return (data ?? []) as BannerRow[];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const banners = useMemo(() => {
    const wanted = new Set(positions.map(normalise));
    const now = Date.now();

    const list = allBanners
      .filter((b) => wanted.has(normalise(b.position ?? b.placement)))
      .filter(
        (b) =>
          b.is_active !== false &&
          b.active !== false &&
          b.status !== "inactive" &&
          b.status !== "rejected" &&
          b.status !== "draft"
      )
      .filter(
        (b) =>
          (!b.starts_at || new Date(b.starts_at).getTime() <= now) &&
          (!b.ends_at || new Date(b.ends_at).getTime() >= now) &&
          (!b.expires_at || new Date(b.expires_at).getTime() >= now)
      )
      .filter((b) => Boolean(getBannerImage(b)))
      .sort(
        (a, b) =>
          Number(a.sort_order ?? a.display_order ?? 0) -
          Number(b.sort_order ?? b.display_order ?? 0)
      );

    if (parity === undefined) return list;

    return list.filter((_, i) => i % 2 === parity);
  }, [allBanners, positions, parity]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % banners.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [banners.length, interval]);

  useEffect(() => {
    if (index >= banners.length && banners.length > 0) setIndex(0);
  }, [index, banners.length]);

  if (!banners.length) {
    return <div className="h-full w-full overflow-hidden">{fallback}</div>;
  }

  const banner = banners[index % banners.length];
  const image = getBannerImage(banner);
  const link = getBannerLink(banner);

  const img = (
    <img
      src={image}
      alt={banner.title ?? banner.alt ?? "Banner"}
      className="h-full w-full object-cover"
    />
  );

  let content: ReactNode = img;

  if (link) {
    content = /^https?:\/\//i.test(link) ? (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full"
      >
        {img}
      </a>
    ) : (
      <Link to={link} className="block h-full w-full">
        {img}
      </Link>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
      <div
        key={banner.id ?? index}
        className="market-banner-motion h-full w-full"
      >
        {content}
      </div>

      {arrows && banners.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() =>
              setIndex((c) => (c - 1 + banners.length) % banners.length)
            }
            className="market-arrow left-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Next banner"
            onClick={() => setIndex((c) => (c + 1) % banners.length)}
            className="market-arrow right-1"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="pointer-events-none absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================================================
   FEATURED PRODUCT CARD (small, rotating slot)
========================================================= */

const FeaturedProductCard = ({
  ad,
  compact = false,
}: {
  ad?: Advertisement;
  compact?: boolean;
}) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="market-card market-bento flex h-full min-h-0 items-center justify-center p-4 text-center"
      >
        <div>
          <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />

          <p className="text-xs font-bold uppercase tracking-wider">
            Featured
          </p>

          <p className="mt-1 text-[10px] opacity-70">
            No featured listings yet
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className={`market-card market-bento group flex h-full min-h-0 flex-col overflow-hidden p-1.5 ${
        compact ? "market-product-compact" : ""
      }`}
    >
      <div className="market-image-container flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            className="market-image h-full w-full object-contain"
          />
        ) : (
          <Package className="h-10 w-10 opacity-40" />
        )}
      </div>

      <div className="shrink-0 px-1 pb-1 pt-1.5">
        <div className="mb-1 flex items-center justify-between gap-1">
          <span className="market-badge">Featured</span>

          <span className="text-[8px] font-semibold opacity-60">
            {getCategoryName(ad)}
          </span>
        </div>

        <h3 className="line-clamp-1 text-[10px] font-bold">{ad.title}</h3>

        <p className="text-xs font-extrabold text-primary">
          E{Number(ad.price ?? 0).toLocaleString()}
        </p>

        {ad.location && (
          <p className="truncate text-[8px] opacity-60">{ad.location}</p>
        )}
      </div>
    </Link>
  );
};

/* =========================================================
   LARGE FEATURED OFFER (row 2)
========================================================= */

const LargeFeaturedOffer = ({ ad }: { ad?: Advertisement }) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="market-card market-bento flex h-full min-h-0 items-center justify-center"
      >
        <div className="text-center">
          <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />

          <h3 className="font-bold">Featured Marketplace</h3>

          <p className="mt-1 text-xs opacity-70">
            Featured listings will appear here.
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className="market-card market-bento group grid h-full min-h-0 grid-cols-1 overflow-hidden p-2 sm:grid-cols-[1.25fr_1fr]"
    >
      <div className="market-image-container flex min-h-0 items-center justify-center overflow-hidden p-2">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            className="market-image h-full max-h-[210px] w-full object-contain"
          />
        ) : (
          <Package className="h-14 w-14 opacity-40" />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center p-3">
        <span className="market-badge mb-2 w-fit">Featured</span>

        <h3 className="line-clamp-3 text-sm font-bold leading-tight sm:text-base">
          {ad.title}
        </h3>

        <p className="mt-2 text-lg font-black">
          E{Number(ad.price ?? 0).toLocaleString()}
        </p>

        {ad.location && (
          <p className="mt-1 truncate text-[10px] opacity-60">
            {ad.location}
          </p>
        )}

        <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full border border-white/70 px-3 py-1.5 text-[10px] font-bold transition-all group-hover:bg-white group-hover:text-black">
          View offer

          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

/* =========================================================
   FEATURED MINI CARD (right sidebar)
========================================================= */

const FeaturedMiniCard = ({ ad }: { ad?: Advertisement }) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="market-card market-bento flex h-full min-h-0 items-center justify-center p-2 text-center"
      >
        <div>
          <Package className="mx-auto mb-1 h-6 w-6 opacity-50" />

          <span className="text-[8px] font-bold uppercase">Featured</span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className="market-card market-bento group flex h-full min-h-0 flex-col overflow-hidden p-1.5"
    >
      <div className="market-image-container flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            className="market-image h-full w-full object-contain"
          />
        ) : (
          <Package className="h-7 w-7 opacity-40" />
        )}
      </div>

      <div className="pt-1">
        <span className="market-badge">Featured</span>

        <p className="mt-1 line-clamp-1 text-[8px] font-bold">{ad.title}</p>

        <p className="text-[10px] font-black">
          E{Number(ad.price ?? 0).toLocaleString()}
        </p>
      </div>
    </Link>
  );
};

/* =========================================================
   STANDARD LIST STRIP CARD (row 4)
========================================================= */

const ProductStripCard = ({ ad }: { ad: Advertisement }) => (
  <Link
    to={`/ad/${ad.id}`}
    className="market-card market-bento group flex h-full min-w-0 overflow-hidden p-1.5"
  >
    <div className="flex h-full min-w-0 items-center gap-2">
      <div className="market-image-container flex h-full w-[58px] shrink-0 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            className="market-image h-full w-full object-contain"
          />
        ) : (
          <Wrench className="h-6 w-6 opacity-40" />
        )}
      </div>

      <div className="min-w-0">
        <span className="market-badge">Standard</span>

        <p className="mt-1 line-clamp-1 text-[9px] font-bold">{ad.title}</p>

        <p className="text-[10px] font-black">
          E{Number(ad.price ?? 0).toLocaleString()}
        </p>

        {ad.location && (
          <p className="truncate text-[7px] opacity-60">{ad.location}</p>
        )}
      </div>
    </div>
  </Link>
);

/* =========================================================
   HOME PAGE
========================================================= */

const HomePage = () => {
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [locating, setLocating] = useState(false);

  /* ---------------------------------------------------------
     LOCATION
  --------------------------------------------------------- */

  useEffect(() => {
    const permissionStatus = localStorage.getItem("geo_permission");

    if (!permissionStatus) {
      setShowLocationBanner(true);
    }
  }, []);

  const handleAllowLocation = () => {
    setLocating(true);

    getUserLocation(
      () => {
        setLocating(false);
        setShowLocationBanner(false);
      },
      () => {
        setLocating(false);
        setShowLocationBanner(false);
      }
    );
  };

  /* ---------------------------------------------------------
     DATABASE — ONE QUERY, TIER DECIDES THE DESTINATION
  --------------------------------------------------------- */

  const { data: advertisements = [], isLoading: adsLoading } = useQuery({
    queryKey: ["homepage-advertisements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data ?? []) as Advertisement[];
    },
    staleTime: 30_000,
  });

  const featuredAds = useMemo(
    () => uniqueAds(advertisements.filter(isFeatured)),
    [advertisements]
  );

  const standardAds = useMemo(
    () => uniqueAds(advertisements.filter(isStandard)),
    [advertisements]
  );

  /* Row 4 strip = first 5 standard ads.
     Bottom grid = the REST, so no ID is repeated on the page. */
  const stripAds = useMemo(() => standardAds.slice(0, 5), [standardAds]);

  const bottomStandardAds = useMemo(
    () => standardAds.slice(5, 17),
    [standardAds]
  );

  /* ---------------------------------------------------------
     SHARED FEATURED ROTATION (unique IDs across all slots)
  --------------------------------------------------------- */

  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (featuredAds.length <= 1) return;

    const timer = window.setInterval(() => {
      setTick((current) => current + 1);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [featuredAds.length]);

  const total = featuredAds.length;

  const adForSlot = (slot: number): Advertisement | undefined => {
    /* More slots than ads -> the extra slots stay on their
       placeholder instead of repeating an advertisement. */
    if (slot >= total) return undefined;

    const position = (((tick + slot) % total) + total) % total;

    return featuredAds[position];
  };

  const stepFeatured = (direction: 1 | -1) =>
    setTick((current) => current + direction);

  const carouselAds = [
    adForSlot(SLOT.ROW5_CAROUSEL_A),
    adForSlot(SLOT.ROW5_CAROUSEL_B),
  ];

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <main className="market-page">
      <style>{`

        .market-page {
          min-height: 100vh;

          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          color: #111827;

          background:
            radial-gradient(
              900px 500px at 10% 5%,
              rgba(124, 58, 237, 0.16),
              transparent 70%
            ),
            radial-gradient(
              900px 550px at 90% 15%,
              rgba(37, 99, 235, 0.14),
              transparent 70%
            ),
            radial-gradient(
              900px 600px at 50% 100%,
              rgba(234, 179, 8, 0.12),
              transparent 70%
            ),
            #f7f7fb;

          overflow-x: hidden;
        }

        .market-card {
          position: relative;

          border-radius: 9px;

          border: 1px solid rgba(255, 255, 255, 0.75);

          background:
            linear-gradient(
              120deg,
              rgba(124, 58, 237, 0.92),
              rgba(37, 99, 235, 0.88),
              rgba(234, 179, 8, 0.82),
              rgba(124, 58, 237, 0.90),
              rgba(37, 99, 235, 0.88)
            );

          background-size: 400% 400%;

          animation: marketCloudGradient 14s ease-in-out infinite;

          box-shadow:
            0 10px 30px rgba(31, 41, 55, 0.12),
            0 3px 10px rgba(124, 58, 237, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.65);

          color: white;

          transition:
            transform 300ms ease,
            box-shadow 300ms ease;
        }

        .market-card::before {
          content: "";

          position: absolute;

          inset: 0;

          border-radius: inherit;

          pointer-events: none;

          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(255,255,255,0.22),
              transparent 30%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(255,255,255,0.15),
              transparent 32%
            );

          opacity: 0.75;

          mix-blend-mode: screen;
        }

        .market-card > * {
          position: relative;
          z-index: 1;
        }

        .market-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 18px 45px rgba(31, 41, 55, 0.18),
            0 7px 18px rgba(124, 58, 237, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        @keyframes marketCloudGradient {
          0%   { background-position: 0% 50%; }
          25%  { background-position: 50% 100%; }
          50%  { background-position: 100% 50%; }
          75%  { background-position: 50% 0%; }
          100% { background-position: 0% 50%; }
        }

        .market-image-container {
          border-radius: 6px;

          background:
            radial-gradient(
              circle at 50% 20%,
              rgba(255,255,255,0.98),
              rgba(255,255,255,0.88) 55%,
              rgba(241,245,249,0.78)
            );

          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);

          overflow: hidden;
        }

        .market-image {
          transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .market-card:hover .market-image {
          transform: scale(1.045);
        }

        .market-badge {
          display: inline-flex;

          align-items: center;

          border-radius: 999px;

          padding: 2px 6px;

          font-size: 7px;

          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: 0.08em;

          color: #111827;

          background: linear-gradient(90deg, #facc15, #fde68a);

          box-shadow: 0 2px 8px rgba(234,179,8,0.25);
        }

        /* ---------- CARD / SLOT MOTION ---------- */

        .market-carousel-slot {
          animation: marketCarouselIn 550ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes marketCarouselIn {
          from {
            opacity: 0;
            transform: translateX(20px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* ---------- BANNER MOTION ---------- */

        .market-banner-motion {
          animation: marketBannerIn 650ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes marketBannerIn {
          from {
            opacity: 0;
            transform: translateX(28px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ---------- ARROWS ---------- */

        .market-arrow {
          position: absolute;
          top: 50%;
          z-index: 5;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 26px;
          height: 26px;

          transform: translateY(-50%);

          border-radius: 999px;

          border: 1px solid rgba(17, 24, 39, 0.15);

          background: rgba(255, 255, 255, 0.92);

          color: #111827;

          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .market-arrow:hover {
          background: #ffffff;
        }

        /* =================================================
           EXACT BENTO STRUCTURE  (UNCHANGED)
        ================================================= */

        .market-home-grid {
          display: grid;

          gap: 6px;
        }

        .market-top-grid {
          grid-template-columns:
            190px
            minmax(0, 1fr)
            190px;

          height: 230px;
        }

        .market-vehicle-grid {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          height: 230px;
        }

        .market-middle-grid {
          grid-template-columns:
            minmax(0, 1fr)
            128px;

          height: 230px;
        }

        .market-parts-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1.30fr)
            minmax(0, 1fr)
            minmax(0, 0.98fr)
            minmax(0, 1.05fr)
            minmax(0, 0.62fr);

          gap: 6px;

          height: 72px;
        }

        .market-main-grid {
          display: grid;

          grid-template-columns:
            105px
            175px
            minmax(0, 1fr)
            175px;

          gap: 6px;

          min-height: 230px;
        }

        .market-right-sidebar {
          display: grid;

          grid-template-rows:
            minmax(0, 1fr)
            82px;

          gap: 6px;

          min-width: 0;
          min-height: 0;
        }

        .market-right-featured {
          display: grid;

          grid-template-columns: repeat(2, minmax(0, 1fr));

          gap: 6px;

          min-width: 0;
          min-height: 0;
        }

        .market-featured-listing {
          min-width: 0;
          min-height: 0;

          border-radius: 6px;

          overflow: hidden;
        }

        .market-featured-listing > * {
          height: 100%;
        }

        @media (max-width: 1023px) {

          .market-top-grid {
            grid-template-columns:
              150px
              minmax(0, 1fr)
              150px;

            height: 215px;
          }

          .market-main-grid {
            grid-template-columns:
              95px
              170px
              minmax(0, 1fr)
              170px;
          }

          .market-parts-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));

            overflow-x: auto;
          }
        }

        @media (max-width: 767px) {

          .market-top-grid {
            grid-template-columns: 1fr 1fr;

            height: auto;
          }

          .market-top-grid > :nth-child(2) {
            grid-column: 1 / -1;

            grid-row: 1;

            height: 220px;
          }

          .market-top-grid > :nth-child(1),
          .market-top-grid > :nth-child(3) {
            height: 180px;
          }

          .market-vehicle-grid {
            grid-template-columns: 1fr;

            height: auto;
          }

          .market-vehicle-grid > * {
            height: 220px;
          }

          .market-middle-grid {
            grid-template-columns: 1fr;

            height: auto;
          }

          .market-middle-grid > * {
            height: 220px;
          }

          .market-parts-grid {
            grid-template-columns: repeat(2, minmax(150px, 1fr));

            height: auto;
          }

          .market-parts-grid > * {
            min-height: 76px;
          }

          .market-main-grid {
            grid-template-columns: 1fr 1fr;
          }

          .market-main-grid > :nth-child(1) {
            min-height: 240px;
          }

          .market-main-grid > :nth-child(2) {
            min-height: 240px;
          }

          .market-main-grid > :nth-child(3) {
            grid-column: 1 / -1;

            min-height: 280px;
          }

          .market-main-grid > :nth-child(4) {
            grid-column: 1 / -1;
          }

          .market-right-sidebar {
            min-height: 260px;
          }
        }

        @media (max-width: 480px) {

          .market-top-grid {
            grid-template-columns: 1fr;
          }

          .market-top-grid > :nth-child(2) {
            grid-column: 1;
            grid-row: 1;
          }

          .market-top-grid > :nth-child(1) {
            grid-column: 1;
            grid-row: 2;
          }

          .market-top-grid > :nth-child(3) {
            grid-column: 1;
            grid-row: 3;
          }

          .market-main-grid {
            grid-template-columns: 1fr;
          }

          .market-main-grid > :nth-child(1),
          .market-main-grid > :nth-child(2),
          .market-main-grid > :nth-child(3),
          .market-main-grid > :nth-child(4) {
            grid-column: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          .market-card,
          .market-image,
          .market-carousel-slot,
          .market-banner-motion {
            animation: none !important;

            transition: none !important;
          }
        }

      `}</style>

      <Seo
        title="The Market Hub | Cars, Car Parts, Phones & Accessories in Eswatini"
        description="Buy and sell products across Eswatini on The Market Hub."
        type="website"
      />

      {/* ===================================================
          LOCATION BANNER
      =================================================== */}

      {showLocationBanner && (
        <div className="bg-gradient-to-r from-violet-700 via-blue-700 to-yellow-600 px-4 py-3 text-white shadow-md">
          <div className="container mx-auto flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2 text-center text-sm sm:text-left">
              <MapPin className="h-5 w-5 shrink-0" />

              <span>Enable location access to discover nearby listings.</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleAllowLocation}
                disabled={locating}
                className="rounded-lg text-xs font-semibold"
              >
                {locating && (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                )}
                Allow Location
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowLocationBanner(false);
                  localStorage.setItem("geo_permission", "denied");
                }}
                className="rounded-lg text-xs text-white hover:bg-white/10"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          ROW 1 — SIDEBAR BANNER | HERO (TOP) BANNER | SIDEBAR BANNER
          All three are banners with the slide animation.
          The centre hero reads "Home Page (Top Banner)".
      =================================================== */}

      <section className="container mx-auto px-2 pt-3 sm:px-4">
        <div className="market-home-grid market-top-grid">
          {/* LEFT SIDEBAR BANNER */}
          <div className="market-card overflow-hidden p-0">
            <DbBannerSlot
              positions={SIDEBAR_BANNER_POSITIONS}
              parity={0}
              interval={6500}
              fallback={<SidebarBanner />}
            />
          </div>

          {/* HERO — HOME PAGE (TOP BANNER) */}
          <div className="market-card overflow-hidden p-0">
            <DbBannerSlot
              positions={TOP_BANNER_POSITIONS}
              interval={7500}
              fallback={<BannerSlider />}
            />
          </div>

          {/* RIGHT SIDEBAR BANNER */}
          <div className="market-card overflow-hidden p-0">
            <DbBannerSlot
              positions={SIDEBAR_BANNER_POSITIONS}
              parity={1}
              interval={7000}
              fallback={<SidebarBanner />}
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          ROW 2 — FEATURED | FEATURED   (carousel slide animation)
      =================================================== */}

      <section className="container mx-auto px-2 pt-2 sm:px-4">
        <div className="market-home-grid market-vehicle-grid">
          <SlotMotion
            slot={SLOT.ROW2_LEFT}
            id={adForSlot(SLOT.ROW2_LEFT)?.id}
          >
            <LargeFeaturedOffer ad={adForSlot(SLOT.ROW2_LEFT)} />
          </SlotMotion>

          <SlotMotion
            slot={SLOT.ROW2_RIGHT}
            id={adForSlot(SLOT.ROW2_RIGHT)?.id}
          >
            <LargeFeaturedOffer ad={adForSlot(SLOT.ROW2_RIGHT)} />
          </SlotMotion>
        </div>
      </section>

      {/* ===================================================
          ROW 3 — HOME PAGE MIDDLE PROMO | FEATURED
      =================================================== */}

      <section className="container mx-auto px-2 pt-2 sm:px-4">
        <div className="market-home-grid market-middle-grid">
          <div className="market-card overflow-hidden p-0">
            <DbBannerSlot
              positions={MIDDLE_BANNER_POSITIONS}
              interval={8000}
              arrows
              fallback={<AdBanner position="home_middle" />}
            />
          </div>

          <SlotMotion
            slot={SLOT.ROW3_SMALL}
            id={adForSlot(SLOT.ROW3_SMALL)?.id}
          >
            <FeaturedProductCard ad={adForSlot(SLOT.ROW3_SMALL)} compact />
          </SlotMotion>
        </div>
      </section>

      {/* ===================================================
          ROW 4 — FIVE STANDARD LIST CARDS
      =================================================== */}

      <section className="container mx-auto overflow-hidden px-2 pt-2 sm:px-4">
        {stripAds.length > 0 ? (
          <div className="market-parts-grid">
            {stripAds.map((ad) => (
              <ProductStripCard key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <Link
            to="/marketplace"
            className="market-card flex h-[72px] items-center justify-center text-sm font-bold"
          >
            Browse Marketplace
          </Link>
        )}
      </section>

      {/* ===================================================
          ROW 5 — BUY | FEATURED | FEATURED LISTINGS | SIDEBAR
      =================================================== */}

      <section className="container mx-auto px-2 pb-8 pt-2 sm:px-4">
        <div className="market-home-grid market-main-grid">
          {/* 01 — BUY A CAR / BUY A PHONE */}
          <div className="market-card flex min-h-0 flex-col items-stretch justify-center p-2 text-center">
            <Link
              to="/marketplace"
              className="flex flex-1 items-center justify-center text-xl font-black uppercase leading-[0.95] tracking-[-0.03em]"
            >
              <span>
                BUY
                <br />A
                <br />
                CAR
              </span>
            </Link>

            <div className="my-1 h-px w-full bg-white/60" />

            <Link
              to="/marketplace"
              className="flex flex-1 items-center justify-center text-xl font-black uppercase leading-[0.95] tracking-[-0.03em]"
            >
              <span>
                BUY
                <br />A
                <br />
                PHONE
              </span>
            </Link>
          </div>

          {/* 02 — FEATURED PRODUCT */}
          <SlotMotion
            slot={SLOT.ROW5_PRODUCT}
            id={adForSlot(SLOT.ROW5_PRODUCT)?.id}
          >
            <FeaturedProductCard ad={adForSlot(SLOT.ROW5_PRODUCT)} compact />
          </SlotMotion>

          {/* 03 — FEATURED LISTINGS CAROUSEL (two cards, arrows) */}
          <div className="market-card relative flex min-h-0 min-w-0 flex-col overflow-hidden p-1.5">
            <div className="mb-1 flex shrink-0 items-center justify-between px-1">
              <div>
                <span className="market-badge">Featured</span>

                <h2 className="mt-1 text-xs font-bold">Featured Listings</h2>
              </div>

              <Link
                to="/marketplace"
                className="text-[9px] font-semibold underline"
              >
                View all
              </Link>
            </div>

            <div className="relative min-h-0 flex-1">
              {carouselAds[0] || carouselAds[1] ? (
                <div className="grid h-full min-h-0 grid-cols-2 gap-2">
                  {carouselAds.map((ad, i) =>
                    ad ? (
                      <SlotMotion
                        key={ad.id}
                        slot={SLOT.ROW5_CAROUSEL_A + i}
                        id={ad.id}
                        className="market-featured-listing"
                      >
                        <AdCard ad={ad} />
                      </SlotMotion>
                    ) : (
                      <div key={`empty-${i}`} />
                    )
                  )}
                </div>
              ) : (
                <div className="flex h-full min-h-[170px] items-center justify-center text-center">
                  <div>
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />

                    <p className="text-xs font-semibold">
                      No featured listings yet.
                    </p>

                    <p className="mt-1 text-[10px] opacity-60">
                      Featured ads posted through the marketplace will appear
                      here.
                    </p>
                  </div>
                </div>
              )}

              {total > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous featured listings"
                    onClick={() => stepFeatured(-1)}
                    className="market-arrow -left-0.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next featured listings"
                    onClick={() => stepFeatured(1)}
                    className="market-arrow -right-0.5"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 04 — RIGHT SIDEBAR: two featured + side banner */}
          <div className="market-right-sidebar">
            <div className="market-right-featured">
              <SlotMotion
                slot={SLOT.ROW5_MINI_A}
                id={adForSlot(SLOT.ROW5_MINI_A)?.id}
              >
                <FeaturedMiniCard ad={adForSlot(SLOT.ROW5_MINI_A)} />
              </SlotMotion>

              <SlotMotion
                slot={SLOT.ROW5_MINI_B}
                id={adForSlot(SLOT.ROW5_MINI_B)?.id}
              >
                <FeaturedMiniCard ad={adForSlot(SLOT.ROW5_MINI_B)} />
              </SlotMotion>
            </div>

            <div className="market-card overflow-hidden p-0">
              <DbBannerSlot
                positions={SIDEBAR_BANNER_POSITIONS}
                interval={7600}
                fallback={<SidebarBanner />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          STANDARD LISTINGS (e250) — the ads NOT already shown
          in the row 4 strip, so no ID is repeated.
      =================================================== */}

      <section className="container mx-auto px-2 pb-10 sm:px-4">
        <div className="mb-3 flex items-end justify-between border-b border-black/10 pb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-violet-700">
              Marketplace
            </span>

            <h2 className="text-xl font-black">Standard Listings</h2>
          </div>

          <Link
            to="/marketplace"
            className="text-xs font-bold text-violet-700"
          >
            See all
            <ArrowRight className="inline h-3.5 w-3.5" />
          </Link>
        </div>

        {adsLoading ? (
          <div className="market-card flex min-h-[180px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : bottomStandardAds.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {bottomStandardAds.map((ad) => (
              <div key={ad.id} className="market-card overflow-hidden">
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        ) : standardAds.length === 0 ? (
          <div className="market-card py-12 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 opacity-50" />

            <p className="text-sm font-semibold">No standard listings yet.</p>

            <p className="mt-1 text-xs opacity-70">
              Products posted as Standard will appear here.
            </p>

            <Button asChild className="mt-4 rounded-lg">
              <Link to="/post-ad">Post Your Ad</Link>
            </Button>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default HomePage;