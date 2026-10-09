import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
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
   TIERS  (EDIT HERE IF YOUR DATABASE TIERS ARE DIFFERENT)

   PREMIUM   -> the "Premium" cards in the wireframe
   FEATURED  -> the "Featured" cards in the wireframe
   STANDARD  -> the normal listings at the bottom
========================================================= */

const PREMIUM_TIERS = ["e500"];
const FEATURED_TIERS = ["e350"];
const STANDARD_TIERS = ["e250"];

/* =========================================================
   SHAPES  (corner radius system)

   Every banner and card has ONE big corner and THREE small
   corners. The size of the radii follows the size of the box:

   size tier   big / small    used by
   ---------   -----------    -------------------------------
   r-xl        60px / 30px    hero banner, middle promo, large
                              featured cards
   r-lg        48px / 24px    sidebar banners, carousel panel
   r-md        36px / 18px    product cards, buy box
   r-sm        28px / 14px    mini cards
   r-strip     30px / 15px    72px-high standard list cards and
                              the small side banner

   Smaller screens shrink the tiers automatically (see CSS).

   corner-tl / corner-tr / corner-br / corner-bl choose WHICH
   corner is the big one.
========================================================= */

const SHAPE = {
  HERO: "r-xl corner-tl",
  MIDDLE: "r-xl corner-tl",
  ROW2_LEFT: "r-xl corner-tr",
  ROW2_RIGHT: "r-xl corner-tl",
  SIDE_LEFT: "r-lg corner-tr",
  SIDE_RIGHT: "r-lg corner-tl",
  SIDE_SMALL: "r-strip corner-tl",
  PRODUCT: "r-md corner-tr",
  STRIP: "r-strip corner-tr",
  BUY: "r-md corner-tr",
  CAROUSEL: "r-md corner-br",
  MINI_LEFT: "r-sm corner-tr",
  MINI_RIGHT: "r-sm corner-tl",
  STANDARD: "r-md corner-tr",
} as const;

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

const isPremium = (ad: Advertisement) =>
  PREMIUM_TIERS.includes(ad.tier ?? "");

const isFeatured = (ad: Advertisement) =>
  FEATURED_TIERS.includes(ad.tier ?? "");

const isStandard = (ad: Advertisement) =>
  STANDARD_TIERS.includes(ad.tier ?? "");

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

/* Warm the browser cache so the next slide never pops in. */
const preload = (src?: string | null) => {
  if (!src || typeof window === "undefined") return;

  const image = new Image();
  image.decoding = "async";
  image.src = src;
};

/* =========================================================
   SMOOTH SLIDE ENGINE

   The OLD approach changed a React `key` on the whole card, so the
   card was destroyed and rebuilt every few seconds (flicker, image
   reload, jank while scrolling).

   The NEW approach:
   - The card FRAME never changes. Its gradient, border and shadow
     stay exactly where they are.
   - Only the CONTENT (image + details) slides: the old content
     slides out to the left while the new content slides in from
     the right, using GPU transforms only.
   - Each carousel owns its own timer, so the page itself never
     re-renders while a carousel plays.
   - Rotation pauses while the person is scrolling or the tab is
     hidden.
========================================================= */

const ROTATION_MS = 5200;
const SLIDE_MS = 650;

let lastScrollAt = 0;
let scrollWatcherOn = false;

const watchScroll = () => {
  if (scrollWatcherOn || typeof window === "undefined") return;

  scrollWatcherOn = true;

  window.addEventListener(
    "scroll",
    () => {
      lastScrollAt = Date.now();
    },
    { passive: true }
  );
};

type Ticker = {
  get: () => number;
  subscribe: (listener: () => void) => () => void;
  step: (direction: 1 | -1) => void;
};

/* A tiny shared clock. Every slot that uses the same ticker moves
   together (so IDs never repeat on the page), but only the slots
   re-render - never the whole home page. */
const createTicker = (ms: number): Ticker => {
  let value = 0;
  let timer: number | undefined;

  const listeners = new Set<() => void>();

  const emit = () => listeners.forEach((listener) => listener());

  return {
    get: () => value,

    subscribe: (listener) => {
      listeners.add(listener);

      if (timer === undefined) {
        watchScroll();

        timer = window.setInterval(() => {
          if (document.hidden) return;
          if (Date.now() - lastScrollAt < 700) return;

          value += 1;
          emit();
        }, ms);
      }

      return () => {
        listeners.delete(listener);

        if (listeners.size === 0 && timer !== undefined) {
          window.clearInterval(timer);
          timer = undefined;
        }
      };
    },

    step: (direction) => {
      value += direction;
      emit();
    },
  };
};

const premiumTicker = createTicker(ROTATION_MS);
const featuredTicker = createTicker(ROTATION_MS);

/* Keeps the CURRENT and the PREVIOUS item so the old one can slide
   out while the new one slides in. */
function useSlideLayers<T>(item: T | undefined, keyOf: (value: T) => string) {
  const itemKey = item === undefined ? "" : keyOf(item);

  const [state, setState] = useState<{
    cur: T | undefined;
    prev: T | undefined;
    n: number;
  }>({ cur: item, prev: undefined, n: 0 });

  useEffect(() => {
    setState((s) => {
      const curKey = s.cur === undefined ? "" : keyOf(s.cur);

      if (curKey === itemKey) {
        return s.cur === item ? s : { ...s, cur: item };
      }

      return { cur: item, prev: s.cur, n: s.n + 1 };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, itemKey]);

  useEffect(() => {
    if (!state.prev) return;

    const timer = window.setTimeout(() => {
      setState((s) => ({ ...s, prev: undefined }));
    }, SLIDE_MS + 500);

    return () => window.clearTimeout(timer);
  }, [state.n, state.prev]);

  return state;
}

/* =========================================================
   SLIDE SLOT
   A permanent card frame + sliding content.

   slot      -> the number that keeps every slot on a different ad
   ticker    -> the shared clock for that group of slots
   intrinsic -> true when the card must take its height from its
                content (row 2 on mobile)
========================================================= */

const SlideSlot = ({
  ads,
  slot,
  ticker,
  frameClassName,
  intrinsic = false,
  children,
}: {
  ads: Advertisement[];
  slot: number;
  ticker: Ticker;
  frameClassName: string;
  intrinsic?: boolean;
  children: (ad?: Advertisement) => ReactNode;
}) => {
  const tick = useSyncExternalStore(ticker.subscribe, ticker.get, ticker.get);

  const total = ads.length;

  /* More slots than ads -> the extra slots stay on their
     placeholder instead of repeating an advertisement. */
  const pick = (offset = 0): Advertisement | undefined => {
    if (slot >= total) return undefined;

    return ads[(((tick + slot + offset) % total) + total) % total];
  };

  const ad = pick();
  const nextAd = pick(1);
  const nextImage = nextAd?.images?.[0];

  useEffect(() => {
    preload(nextImage);
  }, [nextImage]);

  const { cur, prev, n } = useSlideLayers(ad, (a) => a.id);

  const delay = { "--slide-delay": `${slot * 60}ms` } as CSSProperties;

  return (
    <div
      className={`${frameClassName} market-slide-frame h-full min-h-0 min-w-0 overflow-hidden`}
    >
      <div
        className={`market-slide-viewport ${intrinsic ? "" : "is-fill"}`}
      >
        {prev && (
          <div
            key={prev.id}
            className="market-slide-layer is-abs slide-out"
            style={delay}
          >
            {children(prev)}
          </div>
        )}

        <div
          key={cur?.id ?? "empty"}
          className={`market-slide-layer ${intrinsic ? "" : "is-abs"} ${
            n > 0 ? "slide-in" : ""
          }`}
          style={delay}
        >
          {children(cur)}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   DATABASE BANNER SLOT
   Fetches banners from the database, slides them smoothly and
   falls back to the old component if the admin has not published
   a banner for that position.
========================================================= */

const DbBannerSlot = ({
  positions,
  parity,
  interval = 7000,
  arrows = false,
  fit = "cover",
  mobileContain = false,
  fallback,
}: {
  /* "contain" shows the WHOLE uploaded image (top to bottom, nothing
     cropped); "cover" fills the box and may crop. */
  fit?: "cover" | "contain";
  /* When true, the image is switched to "contain" on mobile screens
     (<= 899px) so EVERY part of the uploaded image is visible. A soft
     blurred copy of the same image fills any empty space. */
  mobileContain?: boolean;
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
      if (document.hidden) return;
      if (Date.now() - lastScrollAt < 700) return;

      setIndex((current) => (current + 1) % banners.length);
    }, interval);

    watchScroll();

    return () => window.clearInterval(timer);
  }, [banners.length, interval]);

  useEffect(() => {
    if (index >= banners.length && banners.length > 0) setIndex(0);
  }, [index, banners.length]);

  const banner = banners.length ? banners[index % banners.length] : undefined;

  const nextBanner =
    banners.length > 1 ? banners[(index + 1) % banners.length] : undefined;

  const nextImage = nextBanner ? getBannerImage(nextBanner) : undefined;

  useEffect(() => {
    preload(nextImage);
  }, [nextImage]);

  const { cur, prev, n } = useSlideLayers<BannerRow>(banner, (b) =>
    String(b.id ?? getBannerImage(b))
  );

  if (!banners.length) {
    return <div className="h-full w-full overflow-hidden">{fallback}</div>;
  }

  const renderBanner = (b: BannerRow) => {
    const image = getBannerImage(b);
    const link = getBannerLink(b);

    const img = (
      <img
        src={image}
        alt={b.title ?? b.alt ?? "Banner"}
        decoding="async"
        className={`market-banner-img block h-full w-full object-center ${
          fit === "contain" ? "object-contain" : "object-cover"
        }`}
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
      <>
        {/* Blurred backdrop: only visible on mobile when the image is
            letter-boxed, so the empty space looks intentional. */}
        {mobileContain && (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="market-banner-backdrop"
          />
        )}

        <div className="relative z-[1] h-full w-full">{content}</div>
      </>
    );
  };

  const shown = cur ?? banner;

  return (
    <div
      data-mobile-contain={mobileContain ? "true" : "false"}
      className={`relative h-full w-full overflow-hidden rounded-[inherit] ${
        fit === "contain" ? "bg-white" : ""
      }`}
    >
      {prev && (
        <div
          key={String(prev.id ?? getBannerImage(prev))}
          className="market-slide-layer is-abs slide-out"
        >
          {renderBanner(prev)}
        </div>
      )}

      {shown && (
        <div
          key={String(shown.id ?? getBannerImage(shown))}
          className={`market-slide-layer is-abs ${n > 0 ? "slide-in" : ""}`}
        >
          {renderBanner(shown)}
        </div>
      )}

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
        <div className="pointer-events-none absolute bottom-1.5 left-0 right-0 z-[6] flex justify-center gap-1">
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
   CARD CONTENT
   These are ONLY the inside of a card (image + details). The card
   frame itself lives in <SlideSlot /> and never reloads.
========================================================= */

/* PREMIUM SIDE CARD (row 1, left and right of the hero) */

const PremiumSideContent = ({ ad }: { ad?: Advertisement }) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="flex h-full min-h-0 items-center justify-center p-3 text-center"
      >
        <div>
          <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />

          <p className="text-xs font-bold uppercase tracking-wider">
            Premium
          </p>

          <p className="mt-1 text-[10px] opacity-70">
            No premium listings yet
          </p>
        </div>
      </Link>
    );
  }

  const category = getCategoryName(ad);

  return (
    <Link
      to={`/ad/${ad.id}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden p-1.5"
    >
      <div className="market-image-container flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            decoding="async"
            className="market-image h-full w-full object-contain"
          />
        ) : (
          <Package className="h-10 w-10 opacity-40" />
        )}
      </div>

      <div className="shrink-0 px-1 pb-1 pt-1.5">
        <div className="mb-1 flex items-center justify-between gap-1">
          <span className="market-badge">Premium</span>

          <span className="truncate text-[8px] font-semibold opacity-60">
            {category}
          </span>
        </div>

        <h3 className="line-clamp-1 text-[11px] font-bold">{ad.title}</h3>

        <p className="text-sm font-black">
          E{Number(ad.price ?? 0).toLocaleString()}
        </p>

        {ad.location && (
          <p className="truncate text-[8px] opacity-60">{ad.location}</p>
        )}
      </div>
    </Link>
  );
};

/* SMALL PRODUCT CARD (row 5 premium card) */

const FeaturedProductContent = ({
  ad,
  compact = false,
  label = "Featured",
}: {
  ad?: Advertisement;
  compact?: boolean;
  label?: string;
}) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="flex h-full min-h-0 items-center justify-center p-4 text-center"
      >
        <div>
          <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />

          <p className="text-xs font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="mt-1 text-[10px] opacity-70">
            No {label.toLowerCase()} listings yet
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className={`group flex h-full min-h-0 flex-col overflow-hidden p-1.5 ${
        compact ? "market-product-compact" : ""
      }`}
    >
      <div className="market-image-container flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            decoding="async"
            className="market-image h-full w-full object-contain"
          />
        ) : (
          <Package className="h-10 w-10 opacity-40" />
        )}
      </div>

      <div className="shrink-0 px-1 pb-1 pt-1.5">
        <div className="mb-1 flex items-center justify-between gap-1">
          <span className="market-badge">{label}</span>

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

/* LARGE PREMIUM OFFER (row 2) — APPLE-STYLE CARD
   The image sits in its own panel at the top. ALL the details
   (badge, title, price, location, button) sit OUTSIDE the image,
   underneath it, but still INSIDE the card.

   On tablet / mobile the two cards sit side by side and the
   right-hand card is a mirror of the left one (text on the
   right, button on the left) - see the `mirror` prop. */

const LargeOfferContent = ({
  ad,
  mirror = false,
}: {
  ad?: Advertisement;
  mirror?: boolean;
}) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="flex h-full min-h-0 items-center justify-center"
      >
        <div className="text-center">
          <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />

          <h3 className="font-bold">Premium Marketplace</h3>

          <p className="mt-1 text-xs opacity-70">
            Premium listings will appear here.
          </p>
        </div>
      </Link>
    );
  }

  const category = getCategoryName(ad);

  return (
    <Link
      to={`/ad/${ad.id}`}
      className={`market-apple-card ${
        mirror ? "market-mirror" : ""
      } group flex h-full min-h-0 flex-col overflow-hidden p-2`}
    >
      {/* IMAGE PANEL */}
      <div className="market-image-container market-apple-image flex min-h-0 flex-1 items-center justify-center overflow-hidden p-1.5">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            decoding="async"
            className="market-image h-full w-full object-contain object-center"
          />
        ) : (
          <Package className="h-14 w-14 opacity-40" />
        )}
      </div>

      {/* DETAILS — outside the image, inside the card */}
      <div className="market-apple-details flex shrink-0 items-end justify-between gap-2 px-1.5 pb-1 pt-2.5 sm:gap-3">
        <div className="market-apple-text min-w-0">
          <div className="market-apple-meta mb-1 flex items-center gap-2">
            <span className="market-badge">Premium</span>

            {category && (
              <span className="truncate text-[9px] font-semibold uppercase tracking-wide opacity-70">
                {category}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 text-[11px] font-bold leading-tight sm:text-sm lg:text-base">
            {ad.title}
          </h3>

          <p className="mt-1 text-sm font-black leading-none sm:text-base lg:text-lg">
            E{Number(ad.price ?? 0).toLocaleString()}
          </p>

          {ad.location && (
            <p className="market-apple-location mt-1 flex items-center gap-0.5 text-[9px] opacity-70 sm:text-[10px]">
              <MapPin className="h-2.5 w-2.5 shrink-0" />

              <span className="truncate">{ad.location}</span>
            </p>
          )}
        </div>

        <span className="market-offer-btn inline-flex shrink-0 items-center gap-1 rounded-full border border-white/70 px-3 py-1.5 text-[10px] font-bold transition-all group-hover:bg-white group-hover:text-black">
          <span className="market-offer-label">View offer</span>

          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
};

/* FEATURED MINI CARD (right sidebar) */

const FeaturedMiniContent = ({ ad }: { ad?: Advertisement }) => {
  if (!ad) {
    return (
      <Link
        to="/marketplace"
        className="flex h-full min-h-0 items-center justify-center p-2 text-center"
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
      className="group flex h-full min-h-0 flex-col overflow-hidden p-1.5"
    >
      <div className="market-image-container flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            decoding="async"
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
   LIST STRIP CARD (row 4)
========================================================= */

const ProductStripCard = ({
  ad,
  shape = SHAPE.STRIP,
  label = "Standard",
}: {
  ad: Advertisement;
  shape?: string;
  label?: string;
}) => (
  <Link
    to={`/ad/${ad.id}`}
    className={`market-card market-bento ${shape} group flex h-full min-w-0 overflow-hidden p-1.5`}
  >
    <div className="flex h-full min-w-0 items-center gap-2">
      <div className="market-image-container market-thumb flex h-full w-[58px] shrink-0 items-center justify-center overflow-hidden">
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
        <span className="market-badge">{label}</span>

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
   BUY A CAR / BUY A PHONE  — type and erase animation
   "CAR" is typed and erased, then "PHONE" is typed and erased,
   then it starts again. It owns its own state, so the page never
   re-renders because of it.
========================================================= */

const BuyTyper = () => {
  const [car, setCar] = useState("CAR");
  const [phone, setPhone] = useState("PHONE");
  const [active, setActive] = useState<"car" | "phone" | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      setCar("");
      setPhone("");

      let which: "car" | "phone" = "car";

      while (!cancelled) {
        const full = which === "car" ? "CAR" : "PHONE";
        const set = which === "car" ? setCar : setPhone;

        setActive(which);

        for (let i = 1; i <= full.length; i++) {
          set(full.slice(0, i));
          await sleep(140);
          if (cancelled) return;
        }

        await sleep(1500);
        if (cancelled) return;

        for (let i = full.length - 1; i >= 0; i--) {
          set(full.slice(0, i));
          await sleep(80);
          if (cancelled) return;
        }

        await sleep(250);

        which = which === "car" ? "phone" : "car";
      }
    };

    run();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  const word = (text: string, on: boolean) => (
    <span className="inline-block min-h-[1em]">
      {text || "\u00A0"}

      <span
        aria-hidden="true"
        className={`market-caret ${on ? "is-on" : ""}`}
      />
    </span>
  );

  return (
    <>
      <Link
        to="/marketplace"
        className="flex flex-1 items-center justify-center text-xl font-black uppercase leading-[0.95] tracking-[-0.03em]"
      >
        <span>
          BUY
          <br />A
          <br />
          {word(car, active === "car")}
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
          {word(phone, active === "phone")}
        </span>
      </Link>
    </>
  );
};

/* =========================================================
   SLOT NUMBERS
   Every rotating position owns ONE slot number inside its group.
   A slot shows ads[(tick + slot) % total], so an advertisement ID
   can only appear in ONE place at a time while carousels play.
========================================================= */

const PREMIUM_SLOT = {
  ROW1_LEFT: 0,
  ROW1_RIGHT: 1,
  ROW2_LEFT: 2,
  ROW2_RIGHT: 3,
  ROW5_PREMIUM: 4,
} as const;

const FEATURED_SLOT = {
  CAROUSEL_A: 0,
  CAROUSEL_B: 1,
  MINI_A: 2,
  MINI_B: 3,
} as const;

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

  const premiumAds = useMemo(
    () => uniqueAds(advertisements.filter(isPremium)),
    [advertisements]
  );

  const featuredAds = useMemo(
    () => uniqueAds(advertisements.filter(isFeatured)),
    [advertisements]
  );

  const standardAds = useMemo(
    () => uniqueAds(advertisements.filter(isStandard)),
    [advertisements]
  );

  /* Row 4 strip = first 5 featured ads.
     The rotating featured slots use the REST, so no ID is
     repeated on the page. */
  const stripAds = useMemo(() => featuredAds.slice(0, 5), [featuredAds]);

  const rotatingFeaturedAds = useMemo(
    () => featuredAds.slice(5),
    [featuredAds]
  );

  const bottomStandardAds = useMemo(
    () => standardAds.slice(0, 12),
    [standardAds]
  );

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

        /* =================================================
           SHAPES — ONE BIG CORNER + THREE SMALL CORNERS

           --r-b  = the big corner radius
           --r-s  = the three small corner radii
           --tl / --tr / --br / --bl = the final radius of
           each corner (children use these to stay concentric
           with the card they sit in).
        ================================================= */

        .market-card {
          --r-b: 36px;
          --r-s: 18px;

          --tl: var(--r-s);
          --tr: var(--r-b);
          --br: var(--r-s);
          --bl: var(--r-s);

          position: relative;

          border-radius: var(--tl) var(--tr) var(--br) var(--bl);

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

        /* WHICH corner is the big one */
        .market-card.corner-tl { --tl: var(--r-b); --tr: var(--r-s); --br: var(--r-s); --bl: var(--r-s); }
        .market-card.corner-tr { --tl: var(--r-s); --tr: var(--r-b); --br: var(--r-s); --bl: var(--r-s); }
        .market-card.corner-br { --tl: var(--r-s); --tr: var(--r-s); --br: var(--r-b); --bl: var(--r-s); }
        .market-card.corner-bl { --tl: var(--r-s); --tr: var(--r-s); --br: var(--r-s); --bl: var(--r-b); }

        /* HOW BIG the radii are, by box size */
        .market-card.r-xl    { --r-b: 60px; --r-s: 30px; }
        .market-card.r-lg    { --r-b: 48px; --r-s: 24px; }
        .market-card.r-md    { --r-b: 36px; --r-s: 18px; }
        .market-card.r-sm    { --r-b: 28px; --r-s: 14px; }
        .market-card.r-strip { --r-b: 30px; --r-s: 15px; }

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

        /* Image panels follow the card's own corners (concentric),
           so the inner panel curves exactly like the card. */
        .market-image-container {
          border-radius:
            max(6px, calc(var(--tl, 12px) - 6px))
            max(6px, calc(var(--tr, 12px) - 6px))
            max(6px, calc(var(--br, 12px) - 6px))
            max(6px, calc(var(--bl, 12px) - 6px));

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

        /* Small thumbnail inside the strip cards */
        .market-image-container.market-thumb {
          border-radius: 12px;
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

        /* =================================================
           SMOOTH SLIDE (carousels)

           The card frame stays put. Only the layer inside it
           (image + details) slides, using transforms only so
           it runs on the GPU and never touches page layout.
        ================================================= */

        .market-slide-viewport {
          position: relative;

          width: 100%;
          height: 100%;

          overflow: hidden;

          border-radius: inherit;

          contain: paint;
        }

        .market-slide-viewport.is-fill {
          position: absolute;
          inset: 0;

          height: auto;
        }

        .market-slide-layer {
          width: 100%;
          height: 100%;

          will-change: transform;

          backface-visibility: hidden;
        }

        .market-slide-layer.is-abs {
          position: absolute;
          inset: 0;
        }

        .market-slide-layer.slide-in {
          animation: marketSlideIn ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--slide-delay, 0ms);
        }

        .market-slide-layer.slide-out {
          animation: marketSlideOut ${SLIDE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: var(--slide-delay, 0ms);
          pointer-events: none;
        }

        @keyframes marketSlideIn {
          from { transform: translate3d(100%, 0, 0); }
          to   { transform: translate3d(0, 0, 0); }
        }

        @keyframes marketSlideOut {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-100%, 0, 0); }
        }

        /* Blurred backdrop is hidden on desktop and only used on
           mobile when a banner is letter-boxed. */
        .market-banner-backdrop {
          display: none;
        }

        /* ---------- TYPE & ERASE CURSOR ---------- */

        .market-caret {
          display: inline-block;

          width: 2px;
          height: 0.8em;

          margin-left: 2px;

          vertical-align: baseline;

          background: currentColor;

          opacity: 0;
        }

        .market-caret.is-on {
          opacity: 1;

          animation: marketCaretBlink 900ms steps(1) infinite;
        }

        @keyframes marketCaretBlink {
          0%, 49%  { opacity: 1; }
          50%, 100% { opacity: 0; }
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
           EXACT BENTO STRUCTURE (DESKTOP)
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

          height: 250px;
        }

        /* Admin-uploaded sidebar banners: always show the complete image. */
        .market-sidebar-banner {
          min-width: 0;
          min-height: 0;
          background: rgba(255, 255, 255, 0.96);
        }

        .market-sidebar-banner > div {
          width: 100%;
          height: 100%;
        }

        .market-sidebar-banner img {
          display: block;
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain !important;
          object-position: center center;
        }

        /* Row 2: two large Apple-style cards (image on top, details below) */
        .market-vehicle-grid {
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          height: 310px;
        }

        .market-apple-card {
          min-width: 0;
        }

        /* Top corners follow the card, bottom corners stay soft. */
        .market-apple-image {
          background: #ffffff;

          border-radius:
            max(10px, calc(var(--tl, 12px) - 8px))
            max(10px, calc(var(--tr, 12px) - 8px))
            max(14px, calc(var(--r-s, 18px) - 6px))
            max(14px, calc(var(--r-s, 18px) - 6px));
        }

        .market-apple-details {
          color: #ffffff;
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

        /* Cards inside the featured carousel panel */
        .market-featured-listing {
          min-width: 0;
          min-height: 0;

          border-radius: max(8px, calc(var(--r-s, 18px) - 4px));

          overflow: hidden;
        }

        .market-featured-listing .market-slide-layer > * {
          height: 100%;
        }

        /* =================================================
           LARGE TABLETS
        ================================================= */

        @media (max-width: 1023px) {

          .market-top-grid {
            grid-template-columns:
              150px
              minmax(0, 1fr)
              150px;

            height: 230px;
          }

          .market-vehicle-grid {
            height: 320px;
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

        /* =================================================
           SMALLER TABLETS + MOBILE  (<= 899px)
           Layout copied from the wireframe:

             [      HERO / TOP BANNER      ]
             [ SIDE BANNER ][ SIDE BANNER ]
             [ FEATURED    ][    FEATURED ]   <- right one mirrored
        ================================================= */

        @media (max-width: 899px) {

          /* ---------- ROW 1 ---------- */

          .market-top-grid {
            grid-template-columns: 1fr 1fr;

            height: auto;
          }

          .market-top-grid > :nth-child(2) {
            grid-column: 1 / -1;

            grid-row: 1;

            height: auto;

            aspect-ratio: 16 / 9;
          }

          .market-top-grid > :nth-child(1),
          .market-top-grid > :nth-child(3) {
            grid-row: 2;

            height: auto;
            min-height: 0;

            aspect-ratio: 4 / 3;
          }

          .market-sidebar-banner {
            height: auto;
            min-height: 0;
          }

          /* Banner frames: the banner fills the frame exactly */
          .market-card.market-banner-frame > * {
            position: absolute;
            inset: 0;
          }

          [data-mobile-contain="true"] .market-banner-img {
            object-fit: contain !important;
            object-position: center center !important;
          }

          [data-mobile-contain="true"] .market-banner-backdrop {
            display: block;

            position: absolute;
            inset: 0;
            z-index: 0;

            width: 100%;
            height: 100%;

            object-fit: cover;

            filter: blur(18px) saturate(1.1);

            transform: scale(1.25);

            opacity: 0.75;

            pointer-events: none;
          }

          /* ---------- ROW 2: TWO CARDS SIDE BY SIDE ---------- */

          .market-vehicle-grid {
            grid-template-columns: 1fr 1fr;

            height: auto;
          }

          .market-vehicle-grid > * {
            height: auto !important;
            min-height: 0 !important;
          }

          .market-vehicle-grid .market-apple-card {
            height: auto !important;

            padding: 6px;
          }

          .market-vehicle-grid .market-apple-image {
            flex: none;

            width: 100%;

            /* Bigger = taller image panel, smaller = shorter. */
            aspect-ratio: 4 / 3;

            min-height: 0;

            padding: 4px;
          }

          .market-vehicle-grid .market-apple-image .market-image {
            width: 100%;
            height: 100%;
            max-height: none !important;
            object-fit: contain;
            object-position: center center;
          }

          .market-apple-details {
            padding-top: 8px;
          }

          /* The "View offer" pill becomes a round arrow button */
          .market-offer-label {
            display: none;
          }

          .market-offer-btn {
            width: 28px;
            height: 28px;

            padding: 0;

            justify-content: center;
          }

          /* Right-hand card = mirror of the left-hand card */
          .market-mirror .market-apple-details {
            flex-direction: row-reverse;

            text-align: right;
          }

          .market-mirror .market-apple-meta {
            flex-direction: row-reverse;
          }

          .market-mirror .market-apple-location {
            flex-direction: row-reverse;
          }

          .market-mirror .market-offer-btn {
            transform: scaleX(-1);
          }

          /* Radii shrink a little with the smaller boxes */
          .market-card.r-xl { --r-b: 52px; --r-s: 26px; }
          .market-card.r-lg { --r-b: 46px; --r-s: 23px; }
        }

        /* =================================================
           MOBILE  (<= 767px)
        ================================================= */

        @media (max-width: 767px) {

          /* ---------- MOBILE: MIDDLE PROMO BANNER ---------- */

          .market-middle-grid {
            grid-template-columns: 1fr;

            height: auto;
          }

          .market-middle-grid > :nth-child(1) {
            height: auto;

            aspect-ratio: 2 / 1;
          }

          .market-middle-grid > :nth-child(2) {
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

        /* =================================================
           PHONES  (<= 599px)
           The two banner cards become squares like the wireframe
           and the radii tighten for the narrower boxes.
        ================================================= */

        @media (max-width: 599px) {

          .market-top-grid > :nth-child(1),
          .market-top-grid > :nth-child(3) {
            aspect-ratio: 1 / 1;
          }

          .market-card.r-xl { --r-b: 44px; --r-s: 22px; }
          .market-card.r-lg { --r-b: 40px; --r-s: 20px; }
          .market-card.r-md { --r-b: 30px; --r-s: 15px; }
          .market-card.r-sm { --r-b: 24px; --r-s: 12px; }
        }

        @media (max-width: 480px) {

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
          .market-slide-layer,
          .market-caret {
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
          ROW 1 — PREMIUM | HERO (TOP) BANNER | PREMIUM
          Premium side cards: carousel slide, premium ads only.
          Hero: carousel slide, top banner only.
          Desktop: three across.
          Tablet / mobile: hero on top, the two premium cards
          side by side underneath (wireframe layout).
      =================================================== */}

      <section className="container mx-auto px-2 pt-3 sm:px-4">
        <div className="market-home-grid market-top-grid">
          {/* LEFT PREMIUM CARD */}
          <SlideSlot
            ads={premiumAds}
            slot={PREMIUM_SLOT.ROW1_LEFT}
            ticker={premiumTicker}
            frameClassName={`market-card market-bento ${SHAPE.SIDE_LEFT}`}
          >
            {(ad) => <PremiumSideContent ad={ad} />}
          </SlideSlot>

          {/* HERO — HOME PAGE (TOP BANNER) */}
          <div
            className={`market-card market-banner-frame ${SHAPE.HERO} overflow-hidden p-0`}
          >
            <DbBannerSlot
              positions={TOP_BANNER_POSITIONS}
              interval={7500}
              mobileContain
              fallback={<BannerSlider />}
            />
          </div>

          {/* RIGHT PREMIUM CARD */}
          <SlideSlot
            ads={premiumAds}
            slot={PREMIUM_SLOT.ROW1_RIGHT}
            ticker={premiumTicker}
            frameClassName={`market-card market-bento ${SHAPE.SIDE_RIGHT}`}
          >
            {(ad) => <PremiumSideContent ad={ad} />}
          </SlideSlot>
        </div>
      </section>

      {/* ===================================================
          ROW 2 — PREMIUM | PREMIUM   (carousel slide animation)
          Apple-style cards: image on top, details below it.
          The right-hand card is a mirror of the left on tablet
          and mobile.
      =================================================== */}

      <section className="container mx-auto px-2 pt-2 sm:px-4">
        <div className="market-home-grid market-vehicle-grid">
          <SlideSlot
            ads={premiumAds}
            slot={PREMIUM_SLOT.ROW2_LEFT}
            ticker={premiumTicker}
            intrinsic
            frameClassName={`market-card market-bento ${SHAPE.ROW2_LEFT}`}
          >
            {(ad) => <LargeOfferContent ad={ad} />}
          </SlideSlot>

          <SlideSlot
            ads={premiumAds}
            slot={PREMIUM_SLOT.ROW2_RIGHT}
            ticker={premiumTicker}
            intrinsic
            frameClassName={`market-card market-bento ${SHAPE.ROW2_RIGHT}`}
          >
            {(ad) => <LargeOfferContent ad={ad} mirror />}
          </SlideSlot>
        </div>
      </section>

      {/* ===================================================
          ROW 3 — HOME PAGE MIDDLE PROMO | SIDE BANNER
          The middle promo shows the WHOLE image on mobile screens.
          Both have their own carousel slide.
      =================================================== */}

      <section className="container mx-auto px-2 pt-2 sm:px-4">
        <div className="market-home-grid market-middle-grid">
          <div
            className={`market-card market-banner-frame ${SHAPE.MIDDLE} overflow-hidden p-0`}
          >
            <DbBannerSlot
              positions={MIDDLE_BANNER_POSITIONS}
              interval={8000}
              arrows
              mobileContain
              fallback={<AdBanner position="home_middle" />}
            />
          </div>

          <div
            className={`market-card market-banner-frame market-sidebar-banner ${SHAPE.SIDE_RIGHT} overflow-hidden p-0`}
          >
            <DbBannerSlot
              positions={SIDEBAR_BANNER_POSITIONS}
              parity={0}
              fit="contain"
              interval={6500}
              fallback={<SidebarBanner />}
            />
          </div>
        </div>
      </section>

      {/* ===================================================
          ROW 4 — FIVE FEATURED LIST CARDS
      =================================================== */}

      <section className="container mx-auto overflow-hidden px-2 pt-2 sm:px-4">
        {stripAds.length > 0 ? (
          <div className="market-parts-grid">
            {stripAds.map((ad) => (
              <ProductStripCard
                key={ad.id}
                ad={ad}
                shape={SHAPE.STRIP}
                label="Featured"
              />
            ))}
          </div>
        ) : (
          <Link
            to="/marketplace"
            className={`market-card ${SHAPE.STRIP} flex h-[72px] items-center justify-center text-sm font-bold`}
          >
            Browse Marketplace
          </Link>
        )}
      </section>

      {/* ===================================================
          ROW 5 — BUY | PREMIUM | FEATURED LISTINGS | FEATURED + SIDE BANNER
      =================================================== */}

      <section className="container mx-auto px-2 pb-8 pt-2 sm:px-4">
        <div className="market-home-grid market-main-grid">
          {/* 01 — BUY A CAR / BUY A PHONE  (type & erase animation) */}
          <div
            className={`market-card ${SHAPE.BUY} flex min-h-0 flex-col items-stretch justify-center p-2 text-center`}
          >
            <BuyTyper />
          </div>

          {/* 02 — PREMIUM PRODUCT */}
          <SlideSlot
            ads={premiumAds}
            slot={PREMIUM_SLOT.ROW5_PREMIUM}
            ticker={premiumTicker}
            frameClassName={`market-card market-bento ${SHAPE.PRODUCT}`}
          >
            {(ad) => (
              <FeaturedProductContent ad={ad} compact label="Premium" />
            )}
          </SlideSlot>

          {/* 03 — FEATURED LISTINGS CAROUSEL (two cards, arrows) */}
          <div
            className={`market-card ${SHAPE.CAROUSEL} relative flex min-h-0 min-w-0 flex-col overflow-hidden p-1.5`}
          >
            <div className="mb-1 flex shrink-0 items-center justify-between px-1.5 pt-0.5">
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
              {rotatingFeaturedAds.length > 0 ? (
                <div className="grid h-full min-h-0 grid-cols-2 gap-2">
                  <SlideSlot
                    ads={rotatingFeaturedAds}
                    slot={FEATURED_SLOT.CAROUSEL_A}
                    ticker={featuredTicker}
                    frameClassName="market-featured-listing"
                  >
                    {(ad) => (ad ? <AdCard ad={ad} /> : null)}
                  </SlideSlot>

                  <SlideSlot
                    ads={rotatingFeaturedAds}
                    slot={FEATURED_SLOT.CAROUSEL_B}
                    ticker={featuredTicker}
                    frameClassName="market-featured-listing"
                  >
                    {(ad) => (ad ? <AdCard ad={ad} /> : null)}
                  </SlideSlot>
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

              {rotatingFeaturedAds.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous featured listings"
                    onClick={() => featuredTicker.step(-1)}
                    className="market-arrow -left-0.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    aria-label="Next featured listings"
                    onClick={() => featuredTicker.step(1)}
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
              <SlideSlot
                ads={rotatingFeaturedAds}
                slot={FEATURED_SLOT.MINI_A}
                ticker={featuredTicker}
                frameClassName={`market-card market-bento ${SHAPE.MINI_LEFT}`}
              >
                {(ad) => <FeaturedMiniContent ad={ad} />}
              </SlideSlot>

              <SlideSlot
                ads={rotatingFeaturedAds}
                slot={FEATURED_SLOT.MINI_B}
                ticker={featuredTicker}
                frameClassName={`market-card market-bento ${SHAPE.MINI_RIGHT}`}
              >
                {(ad) => <FeaturedMiniContent ad={ad} />}
              </SlideSlot>
            </div>

            <div
              className={`market-card market-sidebar-banner ${SHAPE.SIDE_SMALL} overflow-hidden p-0`}
            >
              <DbBannerSlot
                positions={SIDEBAR_BANNER_POSITIONS}
                parity={1}
                interval={7600}
                fit="contain"
                fallback={<SidebarBanner />}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          STANDARD LISTINGS (e250)
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
          <div
            className={`market-card ${SHAPE.STANDARD} flex min-h-[180px] items-center justify-center`}
          >
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
        ) : bottomStandardAds.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {bottomStandardAds.map((ad) => (
              <div
                key={ad.id}
                className={`market-card ${SHAPE.STANDARD} overflow-hidden`}
              >
                <AdCard ad={ad} />
              </div>
            ))}
          </div>
        ) : standardAds.length === 0 ? (
          <div className={`market-card ${SHAPE.STANDARD} py-12 text-center`}>
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