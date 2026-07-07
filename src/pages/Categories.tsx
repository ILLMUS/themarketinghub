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

          const Icon = category.icon;

          return (

          <Link
  key={category.id}
  to={`/marketplace?category=${category.id}`}
  className="
    rounded-2xl
    border
    bg-card
    shadow-sm
    hover:shadow-lg
    transition-all
    duration-300
    p-5
  "
>

  {/* Header */}

  <div className="flex items-center gap-4">

    <img
      src={category.image}
      alt={category.name}
      className="
        h-20
        w-20
        rounded-xl
        object-cover
        flex-shrink-0
      "
    />

    <div>

      <h3 className="text-xl font-bold text-foreground">

        {category.name}

      </h3>

    </div>

  </div>

  {/* Divider */}

  <div className="my-5 border-t" />

  {/* Subcategories */}

  <div className="space-y-2">

    {category.subcategories.map((sub) => (

      <p
        key={sub.id}
        className="
          text-sm
          text-muted-foreground
        "
      >

        • {sub.name}

      </p>

    ))}

  </div>

</Link>

          );

        })}

      </div>

    </div>
  );
};

export default CategoriesPage;