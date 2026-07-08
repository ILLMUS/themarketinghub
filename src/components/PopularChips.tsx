import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { marketplaceCategories } from "@/data/marketplaceCategories";
import { Grid2X2 } from "lucide-react";
import { Store } from "lucide-react";
interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string |null;
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
const hoveredCategory = marketplaceCategories.find(
  (category) => category.id === activeCategory
);
  return (

    <>
{/* ------------------------------------------------ */}
{/* Scrollable Categories */}
{/* ------------------------------------------------ */}

<section className="relative border-b bg-card">

  <div className="container py-5" onMouseLeave={() => setActiveCategory(null)}>

    <div className="flex items-center gap-3">

  {/* View All Categories Button */}

<Link
  to="/categories"
  aria-label="Browse Marketplace Categories"
  title="Browse Marketplace Categories"
  className="
    flex-shrink-0
    flex
    items-center
    justify-center
    w-11
    h-11
    rounded-full
    bg-primary/30
    text-blue-700
    transition-all
    duration-300
    hover:bg-primary/90
    hover:scale-105
    hover:shadow-lg
  "
>
  <Store className="w-5 h-5" />
</Link>

  {/* Scrollable Categories */}

  <div className="flex gap-3 overflow-x-auto scrollbar-hide flex-1">

    {chips.map((cat) => (

      <Link
        key={cat.id}
        to={`/marketplace?category=${cat.id}`}
          onMouseEnter={() => setActiveCategory(cat.id)}
          className="
          flex-shrink-0
          whitespace-nowrap
          rounded-full
          border
          border-gray-300
          bg-white
          px-5
          py-2
          text-sm
          font-medium
          text-gray-800
          transition-all
          duration-300
          hover:bg-primary
          hover:border-primary
          hover:text-white
        "
      >
        {cat.name}
      </Link>

    ))}

  </div>

</div>
{hoveredCategory && (

  <div
  className="
    absolute
    top-full
    left-0
    w-full
    bg-white
    border-b
    shadow-xl
    z-[999]
  "
>

    <div className="container py-4">

      <div className="flex flex-wrap gap-3">

        {hoveredCategory.subcategories.map((sub) => (

          <Link
            key={sub.id}
            to={`/marketplace?category=${hoveredCategory.id}&subcategory=${sub.id}`}
            className="
              rounded-full
              border
              border-gray-200
              bg-gray-50
              px-4
              py-2
              text-sm
              text-gray-700
              transition-all
              duration-200
              hover:bg-primary
              hover:text-white
              hover:border-primary
            "
          >
            {sub.name}
          </Link>

        ))}

      </div>

    </div>

  </div>

)}
  </div>

</section>



      {/* ------------------------------------------------ */}
      {/* Browse Categories */}
      {/* ------------------------------------------------ */}

      <section className="py-0 bg-background">

        <div className="container">

          <div className="mb-10">

            <h2 className="text-3xl text-black font-bold">
              Browse Categories
            </h2>

            <p className="text-muted-foreground mt-2">
              Discover thousands of products and services across Eswatini.
            </p>

          </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
            {marketplaceCategories.map((category) => {

              const Icon = category.icon;

              return (

                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="
                    group
                    rounded-2xl
                    overflow-hidden
                    border
                    bg-card
                    shadow-sm
                    hover:shadow-2xl
                    hover:-translate-y-2
                    transition-all
                    duration-300
                  "
                >

                  {/* IMAGE */}

                  <div
                    className="
                      relative
                      aspect-square
                      overflow-hidden
                    "
                  >

                    <img
                      src={category.image}
                      alt={category.name}
                      className="
                          w-full
                          h-full
                          object-cover
                          object-center
                          transition-transform
                          duration-500
                          group-hover:scale-105
                          "
                    />

                    {/* Gradient */}

                    <div className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/80
                      via-black/20
                      to-transparent
                    " />

                    {/* Icon */}

                    {Icon && (

                      <div className="
                        absolute
                        top-4
                        left-4
                        rounded-full
                        bg-white/20
                        backdrop-blur-md
                        p-3
                      ">

                        <Icon
                          className="h-6 w-6 text-white"
                        />

                      </div>

                    )}

                    {/* Listing Count Placeholder */}

                    <div
  className="
    absolute
    bottom-1
    right-1
    sm:bottom-2
    sm:right-2

    rounded-full
    bg-primary
    text-white

    text-[7px]
    sm:text-[8px]
    md:text-[9px]
    lg:text-[8px]
    xl:text-[7px]

    font-semibold
    leading-none
    whitespace-nowrap

    px-1
    sm:px-1.5
    md:px-2

    py-0.5
    shadow-md
  "
>
  Coming Soon
</div>

                  </div>

                  {/* CONTENT */}

                  


                  <div
                  className="
                    absolute
                    bottom-4
                    left-4
                    z-20
                  "
                >



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