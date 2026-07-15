import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { marketplaceCategories } from "@/data/marketplaceCategories";
import { Button } from "@/components/ui/button";

export function MarketplaceCategoryPage() {
  // Grab the parameter from the URL path (/categories/pets -> categoryId = "pets")
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // Find the match config matching your local file structure
  const currentCategoryConfig = marketplaceCategories.find(
    (cat) => cat.id === categoryId
  );

  // Fetch only advertisements matching this specific category ID
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ["listings-category", categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("status", "approved")
        // Assumes your database column values map cleanly to your file IDs ('vehicles', 'pets', etc.)
        .eq("category_id", categoryId) 
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!categoryId, // Only fire when path is active
  });

  if (!currentCategoryConfig) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-xl font-bold">Category not found</h2>
        <Button onClick={() => navigate("/")} className="mt-4">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header Banner Info */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-8 bg-black/40 flex items-center px-8 shadow-sm">
        <img 
          src={currentCategoryConfig.image} 
          alt={currentCategoryConfig.name}
          className="absolute inset-0 w-full h-full object-cover -z-10 mix-blend-overlay"
        />
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {currentCategoryConfig.name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Subcategories Sidebar Filter List */}
        <div className="space-y-2 bg-card border rounded-xl p-4 h-fit shadow-sm">
          <h3 className="font-semibold text-sm border-b pb-2 mb-3">Subcategories</h3>
          {currentCategoryConfig.subcategories.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                // Optional: handle subcategory granular filter query strings here
                // e.g., navigate(`/categories/${categoryId}?sub=${sub.id}`)
              }}
              className="block w-full text-left py-1.5 px-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
            >
              {sub.name}
            </button>
          ))}
        </div>

        {/* Filtered Dynamic Items Grid Display */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive text-sm">Failed to load active advertisements.</p>
          ) : listings?.length === 0 ? (
            <div className="text-center py-12 border rounded-xl border-dashed">
              <p className="text-muted-foreground">No active listings found under {currentCategoryConfig.name}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {listings?.map((ad) => (
                <div 
                  key={ad.id} 
                  onClick={() => navigate(`/ad/${ad.id}`)}
                  className="group bg-card border rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-40 bg-muted overflow-hidden relative">
                    {ad.images?.[0] && (
                      <img 
                        src={ad.images[0]} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-sm truncate">{ad.title}</h4>
                    <p className="text-primary font-bold text-base mt-1">R {ad.price}</p>
                    <p className="text-xs text-muted-foreground mt-2 truncate">{ad.location}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}