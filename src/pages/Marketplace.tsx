import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CategoryBanner } from "@/components/CategoryBanner";
import { SidebarBanner } from "@/components/SidebarBanner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, MapPin, Store, Package, ShoppingCart, Heart, Crown, Star } from "lucide-react";
import * as SeoModule from "@/hooks/useSeo";

// Safe fallback for Seo hook/component
const Seo = (SeoModule as any).Seo || (SeoModule as any).default || (() => null);

const LOCATIONS = ["All Locations", "Mbabane", "Manzini", "Siteki", "Big Bend", "Nhlangano", "Matsapha", "Piggs Peak"];

/* Same tiers as the home page (Index.tsx) */
const PREMIUM_TIERS = ["e500"];
const FEATURED_TIERS = ["e350"];

/* Same shape system as the home page: ONE big corner + THREE small corners */
const SHAPE = {
  LEFT: "r-md corner-tr",
  RIGHT: "r-md corner-tl",
  FILTER: "r-strip corner-tr",
  BANNER: "r-xl corner-tl",
  SIDE: "r-lg corner-tl",
} as const;

const getCategoryName = (ad: any) =>
  Array.isArray(ad.categories) ? ad.categories[0]?.name ?? "" : ad.categories?.name ?? "";

const tierLabel = (ad: any) =>
  PREMIUM_TIERS.includes(ad.tier ?? "") ? "Premium" : FEATURED_TIERS.includes(ad.tier ?? "") ? "Featured" : "Standard";

const tierRank = (ad: any) => (tierLabel(ad) === "Premium" ? 0 : tierLabel(ad) === "Featured" ? 1 : 2);

/* =========================================================
   MARKETPLACE CARD (laid out like the mockup)

   - IMAGE PANEL on top with the tier BANNER (Premium / Featured)
     across the top of the panel
   - DETAILS underneath, ALL INSIDE the card:
       pill + category, title, price, location | cart + heart
   - `mirror` flips the right-hand card on mobile / tablet
========================================================= */
const MarketCard = ({ ad, shape, mirror }: { ad: any; shape: string; mirror: boolean }) => {
  const [liked, setLiked] = useState(false);
  const category = getCategoryName(ad);
  const label = tierLabel(ad);
  const showBanner = label !== "Standard";

  return (
    <article
      className={`market-card market-bento ${shape} group flex min-w-0 flex-col overflow-hidden p-2 ${
        mirror ? "market-mirror" : ""
      }`}
    >
      {/* IMAGE PANEL + TIER BANNER */}
      <Link
        to={`/ad/${ad.id}`}
        className="market-image-container market-apple-image relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden p-1.5"
        style={showBanner ? { paddingTop: 24 } : undefined}
      >
        {showBanner && (
          <span className={`market-banner market-banner-${label.toLowerCase()}`}>
            {label === "Premium" ? (
              <Crown className="h-2.5 w-2.5 shrink-0" />
            ) : (
              <Star className="h-2.5 w-2.5 shrink-0 fill-current" />
            )}
            {label}
          </span>
        )}

        {ad.images?.[0] ? (
          <img
            src={ad.images[0]}
            alt={ad.title}
            loading="lazy"
            decoding="async"
            className="market-image h-full w-full object-contain object-center"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </Link>

      {/* DETAILS: inside the card, under the image */}
      <div className="market-apple-details flex min-w-0 shrink-0 items-end justify-between gap-1.5 px-1.5 pb-1 pt-2.5">
        <Link to={`/ad/${ad.id}`} className="market-apple-text min-w-0 flex-1 overflow-hidden">
          <div className="market-apple-meta mb-1 flex min-w-0 items-center gap-1.5 overflow-hidden">
            <span className="market-badge shrink-0">{label}</span>
            {category && (
              <span className="min-w-0 truncate text-[9px] font-semibold uppercase tracking-wide opacity-70">
                {category}
              </span>
            )}
          </div>

          <h3 className="line-clamp-2 break-words text-[11px] font-bold leading-tight sm:text-sm">{ad.title}</h3>

          <p className="mt-1 truncate text-sm font-black leading-none sm:text-base">
            E{Number(ad.price ?? 0).toLocaleString()}
          </p>

          {ad.location && (
            <p className="market-apple-location mt-1 flex min-w-0 items-center gap-0.5 text-[9px] opacity-70 sm:text-[10px]">
              <MapPin className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{ad.location}</span>
            </p>
          )}
        </Link>

        <div className="market-actions flex shrink-0 items-center gap-1">
          <button type="button" aria-label="Add to cart" className="market-round-btn">
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Save listing"
            aria-pressed={liked}
            onClick={() => setLiked((v) => !v)}
            className={`market-round-btn ${liked ? "is-liked" : ""}`}
          >
            <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
};

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const searchParam = searchParams.get("search");

  const [search, setSearch] = useState(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam || "all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // Your top nav drives search through ?search=...
  useEffect(() => {
    setSearch(searchParam || "");
  }, [searchParam]);

  // 1. Fetch categories from Supabase
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // 2. Dynamically fetch subcategories based on the active category
  const { data: subcategories } = useQuery({
    queryKey: ["subcategories", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory || selectedCategory === "all") return [];
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category_id", selectedCategory)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCategory && selectedCategory !== "all",
  });

  // Resolve category slug or ID from URL
  useEffect(() => {
    if (categoryParam && categories) {
      const lowerParam = categoryParam.toLowerCase();
      const matchedCategory = categories.find((c: any) => c.slug === lowerParam || c.id === categoryParam);
      setSelectedCategory(matchedCategory ? matchedCategory.id : "all");
    } else if (!categoryParam) {
      setSelectedCategory("all");
    }

    if (subcategoryParam) setSelectedSubcategory(subcategoryParam);
  }, [categoryParam, subcategoryParam, categories]);

  // 3. Fetch active listings from Supabase
  const { data: ads, isLoading } = useQuery({
    queryKey: ["marketplace-ads", search, selectedCategory, selectedSubcategory, selectedLocation],
    queryFn: async () => {
      let query = supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id" as any, selectedCategory);
      }
      if (selectedSubcategory && selectedSubcategory !== "all") {
        query = query.eq("subcategory" as any, selectedSubcategory);
      }
      if (selectedLocation && selectedLocation !== "All Locations") {
        query = query.ilike("location" as any, `%${selectedLocation}%`);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Premium first, then Featured, then Standard (newest first inside each group)
  const sortedAds = useMemo(
    () => (ads ? [...ads].sort((a: any, b: any) => tierRank(a) - tierRank(b)) : []),
    [ads]
  );

  const activeCategory = categories?.find((c: any) => c.id === selectedCategory);
  const locationLabel = selectedLocation !== "All Locations" ? ` in ${selectedLocation}` : " in Eswatini";

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedSubcategory("all");
    if (val === "all") {
      searchParams.delete("category");
    } else {
      const chosen = categories?.find((c: any) => c.id === val);
      searchParams.set("category", chosen?.slug || val);
    }
    searchParams.delete("subcategory");
    setSearchParams(searchParams);
  };

  const handleSubcategoryChange = (val: string) => {
    setSelectedSubcategory(val);
    if (val === "all") {
      searchParams.delete("subcategory");
    } else {
      searchParams.set("subcategory", val);
    }
    setSearchParams(searchParams);
  };

  const filterTrigger =
    "h-9 border-0 bg-transparent px-1 text-white shadow-none focus:ring-0 focus:ring-offset-0 [&>span]:truncate [&>svg]:text-white";

  return (
    <main className="market-page pb-28 md:pb-10">
      {Seo && (
        <Seo
          title={activeCategory ? `${activeCategory.name}${locationLabel} | Market Hub` : "Marketplace | Market Hub"}
          description="Browse current listings across local markets."
          url={window.location.origin}
        />
      )}

      <div className="container mx-auto max-w-7xl px-2 py-5 sm:px-4">
        {/* Location + category pill, page title */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className={`market-card ${SHAPE.FILTER} flex items-center gap-1 px-3 py-1`}>
            <MapPin className="h-4 w-4 shrink-0" />
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className={`${filterTrigger} w-[116px]`}>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="mx-1 h-6 w-px bg-white/60" />

            <Store className="h-4 w-4 shrink-0" />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className={`${filterTrigger} w-[128px]`}>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {subcategories && subcategories.length > 0 && (
              <>
                <span className="mx-1 h-6 w-px bg-white/60" />
                <Select value={selectedSubcategory} onValueChange={handleSubcategoryChange}>
                  <SelectTrigger className={`${filterTrigger} w-[130px]`}>
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.slug || sub.name}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <h1 className="ml-auto text-2xl font-light tracking-wide text-gray-900 sm:text-3xl">
            {activeCategory ? `${activeCategory.name}${locationLabel}` : "Marketplace"}
          </h1>
        </div>

        {/* Category Top Banner */}
        <div className={`market-card ${SHAPE.BANNER} mb-5 overflow-hidden p-0`}>
          <CategoryBanner categorySlug={activeCategory?.slug} />
        </div>

        {/* Listings + sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-64 animate-pulse bg-white/70 ${i % 2 ? "rounded-[36px_18px_18px_18px]" : "rounded-[18px_36px_18px_18px]"}`}
                  />
                ))}
              </div>
            ) : sortedAds.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
                {sortedAds.map((ad: any, i: number) => (
                  <MarketCard
                    key={ad.id}
                    ad={ad}
                    shape={i % 2 === 0 ? SHAPE.LEFT : SHAPE.RIGHT}
                    mirror={i % 2 === 1}
                  />
                ))}
              </div>
            ) : (
              <div className={`market-card r-md corner-tr py-16 text-center`}>
                <SlidersHorizontal className="mx-auto mb-4 h-12 w-12 opacity-60" />
                <h3 className="mb-2 text-lg font-semibold">No listings found</h3>
                <p className="text-sm opacity-80">Try adjusting your category, subcategory, or search filters.</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className={`market-card ${SHAPE.SIDE} overflow-hidden p-0`}>
              <SidebarBanner />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .market-page {
          min-height: 100vh;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #111827;
          background:
            radial-gradient(900px 500px at 10% 5%, rgba(124, 58, 237, 0.16), transparent 70%),
            radial-gradient(900px 550px at 90% 15%, rgba(37, 99, 235, 0.14), transparent 70%),
            radial-gradient(900px 600px at 50% 100%, rgba(234, 179, 8, 0.12), transparent 70%),
            #f7f7fb;
          overflow-x: hidden;
        }

        /* SHAPES — one big corner + three small corners */
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
          background: linear-gradient(120deg,
            rgba(124, 58, 237, 0.92),
            rgba(37, 99, 235, 0.88),
            rgba(234, 179, 8, 0.82),
            rgba(124, 58, 237, 0.90),
            rgba(37, 99, 235, 0.88));
          background-size: 400% 400%;
          animation: marketCloudGradient 14s ease-in-out infinite;
          box-shadow:
            0 10px 30px rgba(31, 41, 55, 0.12),
            0 3px 10px rgba(124, 58, 237, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.65);
          color: white;
          transition: transform 300ms ease, box-shadow 300ms ease;
        }
        .market-card.corner-tl { --tl: var(--r-b); --tr: var(--r-s); --br: var(--r-s); --bl: var(--r-s); }
        .market-card.corner-tr { --tl: var(--r-s); --tr: var(--r-b); --br: var(--r-s); --bl: var(--r-s); }
        .market-card.r-xl    { --r-b: 60px; --r-s: 30px; }
        .market-card.r-lg    { --r-b: 48px; --r-s: 24px; }
        .market-card.r-md    { --r-b: 36px; --r-s: 18px; }
        .market-card.r-strip { --r-b: 30px; --r-s: 15px; }

        .market-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.22), transparent 30%),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 32%);
          opacity: 0.75;
          mix-blend-mode: screen;
        }
        .market-card > * { position: relative; z-index: 1; }
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

        /* Image panel follows the card's own corners (concentric) */
        .market-image-container {
          border-radius:
            max(6px, calc(var(--tl, 12px) - 6px))
            max(6px, calc(var(--tr, 12px) - 6px))
            max(6px, calc(var(--br, 12px) - 6px))
            max(6px, calc(var(--bl, 12px) - 6px));
          overflow: hidden;
        }
        .market-apple-image {
          background: #ffffff;
          box-shadow: inset 0 0 0 1px rgba(255,255,255,0.7);
          border-radius:
            max(10px, calc(var(--tl, 12px) - 8px))
            max(10px, calc(var(--tr, 12px) - 8px))
            max(14px, calc(var(--r-s, 18px) - 6px))
            max(14px, calc(var(--r-s, 18px) - 6px));
        }
        .market-image { transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1); }
        .market-card:hover .market-image { transform: scale(1.045); }

        /* TIER BANNER: strip across the top of the image panel.
           The panel clips it to the card's concentric corners. */
        .market-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 20px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          pointer-events: none;
        }
        .market-banner-premium {
          color: #111827;
          background: linear-gradient(90deg, #facc15, #fde68a, #facc15);
          box-shadow: 0 2px 8px rgba(234, 179, 8, 0.35);
        }
        .market-banner-featured {
          color: #ffffff;
          background: linear-gradient(90deg, rgba(124, 58, 237, 0.96), rgba(37, 99, 235, 0.94));
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
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

        .market-apple-details { color: #ffffff; }

        /* Round outline buttons (cart / heart) — same outline style as the home "View offer" pill */
        .market-round-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.7);
          color: #ffffff;
          background: transparent;
          transition: background 200ms ease, color 200ms ease, transform 200ms ease;
        }
        .market-round-btn:hover { background: #ffffff; color: #111827; transform: scale(1.08); }
        .market-round-btn.is-liked { background: #facc15; border-color: #facc15; color: #111827; }

        /* Small phones: slightly smaller buttons so the text always fits inside the card */
        @media (max-width: 479px) {
          .market-round-btn { width: 24px; height: 24px; }
          .market-banner { height: 18px; font-size: 7px; }
        }

        /* Right-hand card = mirror of the left-hand card (mobile / tablet, 2 columns) */
        @media (max-width: 1023px) {
          .market-mirror .market-apple-details { flex-direction: row-reverse; text-align: right; }
          .market-mirror .market-apple-meta { flex-direction: row-reverse; }
          .market-mirror .market-apple-location { flex-direction: row-reverse; }
          .market-mirror .market-actions { flex-direction: row-reverse; }
        }

        @media (max-width: 767px) {
          .market-card.r-xl { --r-b: 44px; --r-s: 22px; }
          .market-card.r-lg { --r-b: 40px; --r-s: 20px; }
          .market-card.r-md { --r-b: 30px; --r-s: 15px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .market-card { animation: none; }
          .market-card:hover { transform: none; }
        }
      `}</style>
    </main>
  );
};

export default MarketplacePage;