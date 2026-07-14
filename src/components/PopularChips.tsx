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
      {/* Dynamic Keyframes for Border Loops, Floating Clouds, and Swipe Text pulses */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-loop {
          animation: spinSlow 15s linear infinite;
        }

        /* Blue and Yellow floating cloud animations */
        @keyframes cloudMoveLeft {
          0% { transform: translate(-20%, -20%) scale(1); }
          50% { transform: translate(30%, 20%) scale(1.1); }
          100% { transform: translate(-20%, -20%) scale(1); }
        }
        @keyframes cloudMoveRight {
          0% { transform: translate(20%, 20%) scale(1.1); }
          50% { transform: translate(-30%, -20%) scale(0.9); }
          100% { transform: translate(20%, 20%) scale(1.1); }
        }
        .animate-cloud-1 {
          animation: cloudMoveLeft 8s ease-in-out infinite;
        }
        .animate-cloud-2 {
          animation: cloudMoveRight 10s ease-in-out infinite;
        }

        /* 5-second fade in / out looping animation for scroll instruction text */
        @keyframes fadePulse {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 0.85; }
        }
        .animate-fade-pulse {
          animation: fadePulse 5s ease-in-out infinite;
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
              
              {/* Inner Solid Card Body */}
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

        {/* Dynamic Nested Subcategory Panel */}
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
        
        {/* Animated Swipe Helper: Only visible on small mobile screens */}
        <div className="block sm:hidden w-full text-center py-1.5 bg-muted/20 border-b border-muted/20">
          <span className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase animate-fade-pulse">
            Swipe to Explore →
          </span>
        </div>

        <div className="container mx-auto">  
          {/* Horizontal custom scrolling grid on mobile (4.5 items view), native grid structure on larger displays */}
          <div className="
            flex 
            overflow-x-auto 
            scrollbar-hide 
            gap-0
            sm:gap-0 
            sm:grid 
            sm:grid-cols-4 
            md:grid-cols-6 
            lg:grid-cols-8 
            xl:grid-cols-10
          ">
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
                    flex-shrink-0
                    /* Mobile: Displays 4 fully (22.2% each), 5th item split exactly in half (11.2%) */
                    w-[22.2vw]
                    sm:w-auto
                    flex
                    flex-col
                    bg-card
                    border-r
                    border-b
                    border-muted/35
                    transition-all
                    duration-300
                    p-0
                  "
                >
                  {/* Clean Visual Image Container - Absolutely NO border radius or spacing */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-none">
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

                    {/* Micro icon container in top-left */}
                    {Icon && (
                      <div className="
                        absolute
                        top-1.5
                        left-1.5
                        bg-black/40
                        backdrop-blur-md
                        p-1
                        transition-transform
                        duration-300
                        group-hover:scale-110
                       border-none
                      ">
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Information block OUTSIDE the image container at all times */}
                  <div className="p-1.5 sm:p-3 flex flex-col justify-between flex-grow gap-1.5">
                    
                    {/* Category Name Wrapper (Semibold, compact wrap at borders, no bold) */}
                    <span className="
                      block 
                      text-[10px]
                      sm:text-xs 
                      font-semibold 
                      text-foreground/90
                      tracking-wide
                      break-words
                      whitespace-normal
                      leading-tight
                      group-hover:text-primary
                      transition-colors
                      duration-300
                    ">
                      {category.name}
                    </span>

                    {/* Badge Block always rendered OUTSIDE image */}
                    <div className="flex items-center mt-auto pt-1">
                      {isSoon ? (
                        /* Liquid dynamic blue and yellow background clouds */
                        <div className="
                          relative
                          overflow-hidden
                          rounded-none
                          px-1.5
                          py-0.5
                          text-[8px]
                          sm:text-[9px]
                          font-semibold
                          tracking-wide
                          uppercase
                          inline-flex
                          items-center
                          gap-0.5
                          border
                          border-blue-400/20
                          text-blue-900
                          dark:text-blue-100
                          bg-blue-950/20
                          w-full
                          justify-center
                        ">
                          {/* Moving Yellow Cloud Layer */}
                          <div className="absolute -inset-2 bg-yellow-400/30 blur-sm rounded-full animate-cloud-1 mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />
                          {/* Moving Blue Cloud Layer */}
                          <div className="absolute -inset-2 bg-blue-500/30 blur-sm rounded-full animate-cloud-2 mix-blend-screen dark:mix-blend-color-dodge pointer-events-none" />
                          
                          {/* Badge Content */}
                          <span className="relative z-10 flex items-center gap-0.5 drop-shadow-sm">
                            <Sparkles className="w-2 h-2 animate-pulse" /> Soon
                          </span>
                        </div>
                      ) : (
                        <div className="
                          rounded-none
                          px-1.5
                          py-0.5
                          text-[8px]
                          sm:text-[9px]
                          font-semibold
                          tracking-wide
                          uppercase
                          inline-flex
                          items-center
                          border
                          bg-emerald-500/10 
                          text-emerald-600 
                          border-emerald-500/20
                          w-full
                          justify-center
                        ">
                          <span>{categoryCount} Items</span>
                        </div>
                      )}
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