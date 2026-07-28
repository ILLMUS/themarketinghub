import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, ChevronLeft, ChevronRight, Hand } from "lucide-react";
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
  const [isSwiping, setIsSwiping] = useState(false);

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

  // Trigger simulated swipe animation 2 seconds after mount, then every 10 seconds
  useEffect(() => {
    const triggerSwipe = () => {
      setIsSwiping(true);
      const timer = setTimeout(() => {
        setIsSwiping(false);
      }, 15500);
      return timer;
    };

    const initialDelay = setTimeout(() => {
      triggerSwipe();
      const interval = setInterval(triggerSwipe, 15000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(initialDelay);
  }, []);

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
      {/* Dynamic Keyframes for Border Loops and Simulated Swipe Hand (Right to Left) */}
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-loop {
          animation: spinSlow 1s linear infinite;
        }

        @keyframes handSwipeRightToLeft {
          0% {
            transform: translate(95px, 0px) scale(0.9);
            opacity: 0;
          }
          20% {
            transform: translate(95px, 0px) scale(1);
            opacity: 1;
          }
          70% {
            transform: translate(20px, 0px) scale(0.95);
            opacity: 1;
          }
          100% {
            transform: translate(0px, 0px) scale(0.9);
            opacity: 0;
          }
        }
        .animate-hand-swipe {
          animation: handSwipeRightToLeft 1.5s ease-in-out forwards;
        }
      `}</style>

      {/* ------------------------------------------------ */}
      {/* 1. Scrollable Categories with Smooth Navigation */}
      {/* ------------------------------------------------ */}
      <section className="relative z-50 border-b bg-card/50 backdrop-blur-md">
        <div 
          className="container mx-auto px-4 py-3" 
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
                w-9
                h-9
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
                <Store className="w-4 h-4" />
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
              className="flex gap-2.5 overflow-x-auto scrollbar-hide flex-1 py-1 pr-12 mask-image-horizontal items-center"
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
                      px-3.5
                      py-1.5
                      text-xs
                      font-medium
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                    px-3.5
                    py-2.5
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
        
        <div className="container mx-auto relative">  
          {/* Simulated Swipe Hand Overlay on Mobile (Right to Left) */}
          {isSwiping && (
            <div className="absolute inset-0 z-30 pointer-events-none flex items-start justify-end pr-12 pt-12 sm:hidden">
              <div className="absolute bg-white/90 text-black p-3 rounded-full shadow-2xl drop-shadow-xl animate-hand-swipe flex items-center justify-center">
                <Hand className="w-6 h-6 rotate-[15deg] scale-x-[-1] fill-current" />
              </div>
            </div>
          )}

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

              return (
                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="
                    group
                    flex-shrink-0
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
                  {/* Clean Visual Image Container reduced by 10% */}
                  <div className="relative aspect-[1/0.9] w-full overflow-hidden rounded-none flex items-center justify-center bg-muted/10">
                    <img
                      src={category.image}
                      alt={category.name}
                      loading="lazy"
                      className="
                        w-[90%]
                        h-[90%]
                        object-cover
                        object-center
                        transition-all
                        duration-700
                        ease-out
                        group-hover:scale-110
                        group-hover:rotate-1
                      "
                    />

                    {/* Refined micro icon container in top-left */}
                    {Icon && (
                      <div className="
                        absolute
                        top-2
                        left-2
                        bg-black/50
                        backdrop-blur-md
                        p-1.5
                        rounded-md
                        transition-transform
                        duration-300
                        group-hover:scale-110
                        border-none
                      ">
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Information block with optimized proportional padding and typography spacing */}
                  <div className="p-2 sm:p-3 flex flex-col justify-between flex-grow gap-2">
                    
                    {/* Category Name Wrapper */}
                    <span className="
                      block 
                      text-[11px]
                      sm:text-xs 
                      font-medium 
                      text-foreground/90
                      tracking-tight
                      break-words
                      whitespace-normal
                      leading-tight
                      group-hover:text-primary
                      transition-colors
                      duration-300
                    ">
                      {category.name}
                    </span>
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