import { useState } from "react";
import { Link } from "react-router-dom";
import { Tag } from "lucide-react";
import { marketplaceCategories } from "@/data/marketplaceCategories";

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

    <div className="flex gap-3 overflow-x-auto scrollbar-hide">

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

            <h2 className="text-3xl font-bold">
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
    bottom-2 md:bottom-3 lg:bottom-4
    right-2 md:right-3 lg:right-4

    rounded-full
    bg-primary

    px-2 py-1
    md:px-3 md:py-1

    text-[9px]
    sm:text-[10px]
    md:text-xs

    font-semibold
    text-white

    shadow-lg
    whitespace-nowrap
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

  <h3
    className="
      text-base
      font-semibold
      text-black
      drop-shadow-lg
      mb-16
    "
  >
    {category.name}
  </h3>

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