import { Link } from "react-router-dom";
import { marketplaceCategories } from "@/data/marketplaceCategories";
import { Seo } from "@/hooks/useSeo";

const CategoriesPage = () => {
  return (
    <div className="container py-8">
      <Seo
        title="All Categories – Browse Listings in Eswatini | Market Hub"
        description="Explore every category on Market Hub: vehicles, property, electronics, jobs, services and more. Find what you need across Eswatini."
        url={`${window.location.origin}/categories`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Marketplace Categories",
          url: `${window.location.origin}/categories`,
          hasPart: marketplaceCategories.map((category) => ({
            "@type": "CollectionPage",
            name: category.name,
            url: `${window.location.origin}/marketplace?category=${category.id}`,
          })),
        }}
      />

      <h1 className="text-3xl font-bold mb-2">Categories</h1>

      <p className="text-muted-foreground mb-8">
        Browse all categories on The Market Hub.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceCategories.map((category) => {
          return (
            <div
              key={category.id}
              className="
                rounded-2xl
                border
                bg-card
                shadow-sm
                hover:shadow-lg
                transition-all
                duration-300
                p-5
                flex
                flex-col
              "
            >
              {/* Main Category Header Link */}
              <Link 
                to={`/marketplace?category=${category.id}`}
                className="flex items-center gap-4 group"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="
                    h-20
                    w-20
                    rounded-xl
                    object-cover
                    flex-shrink-0
                    transition-transform
                    group-hover:scale-[1.03]
                  "
                />
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>

              {/* Divider */}
              <div className="my-5 border-t" />

              {/* Subcategories List Links */}
              <div className="space-y-2 flex-1">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/marketplace?category=${category.id}&subcategory=${sub.id}`}
                    className="
                      block
                      text-sm
                      text-muted-foreground
                      hover:text-primary
                      hover:underline
                      transition-colors
                      py-0.5
                    "
                  >
                    • {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;