import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { marketplaceCategories } from "@/data/marketplaceCategories";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface PopularChipsProps {
  categories: Category[] | undefined;
  chipIconMap: Record<string, React.ElementType>;
}

export function PopularChips({
  categories,
  chipIconMap,
}: PopularChipsProps) {
  const chips = categories?.slice(0, 9) ?? [];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const hoveredCategory = marketplaceCategories.find(
    (category) => category.id === activeCategory
  );

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 5);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      checkScroll();
    }
    return () => el?.removeEventListener("scroll", checkScroll);
  }, [chips]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Injecting CSS Keyframes dynamically for the 15s fading glow border loop */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-loop {
          animation: spinSlow 15s linear infinite;
        }
      `}</style>

      {/* ------------------------------------------------ */}
      {/* 1. Scrollable Categories with Smooth Navigation */}
      {/* ------------------------------------------------ */}
      <section className="relative z-50 border-b bg-card/50 backdrop-blur-md">
        <div 
          className="container mx-auto px-4 py-4" 
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="flex items-center gap-3 relative">
            
            {/* Animating Store Icon Wrapper */}
            <Link
              to="/categories"
              aria-label="Browse Marketplace Categories"
              title="Browse All Categories"
              className="
                relative
                flex-shrink-0
                flex
                items-center
                justify-center
                w-10
                h-10
                rounded-full
                bg-background
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-md
                overflow-hidden
                p-[2px]
              "
            >
              {/* Spinning/Fading Border Track */}
              <div className="absolute inset-0 z-0">
                <div className="
                  absolute 
                  -inset-[50%] 
                  bg-[conic-gradient(from_0deg,#3b82f6_0%,#eab308_50%,#3b82f6_100%)] 
                  opacity-80 
                  blur-[1px]
                  animate-border-loop
                " />
              </div>
              
              {/* Inner Solid Card Body to mask the background and act as the true button background */}
              <div className="
                relative 
                z-10 
                flex 
                items-center 
                justify-center 
                w-full 
                h-full 
                rounded-full 
                bg-card 
                text-primary 
                hover:bg-primary/5
                transition-colors
              ">
                <Store className="w-4.5 h-4.5" />
              </div>
            </Link>

            {/* Left Edge Fade & Scroll Control */}
            {showLeftArrow && (
              <div className="absolute left-12 z-20 flex items-center h-full pointer-events-none">
                <div className="absolute left-0 w-8 h-full bg-gradient-to-r from-card to-transparent" />
                <button
                  onClick={() => scroll("left")}
                  className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full border bg-background shadow-md hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Scrollable Chips viewport */}
            <div 
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 py-1 pr-12 mask-image-horizontal"
            >
              {chips.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <Link
                    key={cat.id}
                    to={`/marketplace?category=${cat.id}`}
                    onMouseEnter={() => setActiveCategory(cat.id)}
                    className={`
                      flex-shrink-0
                      whitespace-nowrap
                      rounded-full
                      border
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      transition-all
                      duration-200
                      ${isActive 
                        ? "bg-primary border-primary text-white scale-[1.02] shadow-sm" 
                        : "border-muted/80 bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground hover:bg-muted/30"
                      }
                    `}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Edge Fade & Scroll Control */}
            {showRightArrow && (
              <div className="absolute right-0 z-20 flex items-center h-full pointer-events-none">
                <div className="absolute right-0 w-12 h-full bg-gradient-to-l from-card to-transparent" />
                <button
                  onClick={() => scroll("right")}
                  className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full border bg-background shadow-md hover:scale-110 active:scale-95 transition-all text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Nested Subcategory Panel (Highest z-index overlay & 4-Column Directory Layout) */}
        <div 
          onMouseEnter={() => hoveredCategory && setActiveCategory(hoveredCategory.id)}
          onMouseLeave={() => setActiveCategory(null)}
          className={`
            absolute
            top-full
            left-0
            w-full
            bg-background/95
            backdrop-blur-md
            border-b
            shadow-xl
            z-[100]
            transition-all
            duration-300
            ease-out
            origin-top
            ${hoveredCategory 
              ? "opacity-100 scale-y-100 translate-y-0 visible" 
              : "opacity-0 scale-y-95 -translate-y-2 invisible pointer-events-none"
            }
          `}
        >
          <div className="container mx-auto px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {hoveredCategory?.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/marketplace?category=${hoveredCategory.id}&subcategory=${sub.id}`}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-lg
                    border
                    border-muted/30
                    bg-muted/10
                    px-4
                    py-3
                    text-xs
                    font-medium
                    text-foreground/80
                    transition-all
                    duration-200
                    hover:bg-primary/5
                    hover:text-primary
                    hover:border-primary/40
                    hover:translate-x-1
                  "
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* 2. Seamless Grid: Premium Architectural Interface */}
      {/* ------------------------------------------------ */}
      <section className="py-0 bg-background border-b border-muted/30 relative z-10">
        <div className="container mx-auto">  
          <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-0">
            {marketplaceCategories.map((category) => {
              const Icon = category.icon;
              const categoryCount = category.count; 
              const isSoon = !categoryCount || categoryCount === 0;

              return (
                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="
                    group
                    relative
                    rounded-none
                    overflow-hidden
                    border-r
                    border-b
                    border-muted/30
                    bg-card
                    transition-all
                    duration-300
                    flex
                    flex-col
                    aspect-square
                  "
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="
                        w-full
                        h-full
                        object-cover
                        object-center
                        transition-all
                        duration-700
                        ease-out
                        group-hover:scale-110
                        group-hover:rotate-1
                      "
                    />

                    <div className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/95
                      via-black/30
                      to-black/10
                      opacity-100
                      group-hover:opacity-90
                      transition-all
                      duration-500
                    " />

                    {Icon && (
                      <div className="
                        absolute
                        top-3
                        left-3
                        rounded-lg
                        bg-white/10
                        backdrop-blur-md
                        p-2
                        transition-transform
                        duration-300
                        group-hover:scale-110
                      ">
                        <Icon className="h-4.5 w-4.5 text-white" />
                      </div>
                    )}

                    <div className={`
                      absolute
                      top-3
                      right-3
                      rounded-full
                      px-2
                      py-0.5
                      text-[8px]
                      font-bold
                      tracking-wide
                      uppercase
                      shadow-md
                      backdrop-blur-md
                      transition-all
                      duration-300
                      ${isSoon 
                        ? "bg-amber-500/90 text-amber-950 border border-amber-400/20" 
                        : "bg-emerald-500/90 text-emerald-950 border border-emerald-400/20"
                      }
                    `}>
                      {isSoon ? (
                        <span className="flex items-center gap-0.5">
                          <Sparkles className="w-2 h-2" /> Soon
                        </span>
                      ) : (
                        `${categoryCount}`
                      )}
                    </div>

                    <div className="
                      absolute
                      bottom-0
                      left-0
                      w-full
                      p-3
                      z-20
                      flex
                      flex-col
                      justify-end
                    ">
                      <span className="
                        block 
                        text-[11px] 
                        sm:text-xs 
                        font-bold 
                        text-white
                        tracking-wide
                        truncate
                        group-hover:text-primary
                        transition-colors
                        duration-300
                      ">
                        {category.name}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}