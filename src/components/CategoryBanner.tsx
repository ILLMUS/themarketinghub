import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryBannerProps {
  categoryId?: string; 
}

export const CategoryBanner = ({ categoryId }: CategoryBannerProps) => {
  const { data: banner, isLoading } = useQuery({
    queryKey: ["category-header-banner", categoryId],
    queryFn: async () => {
      // 1. If a specific category is selected, try fetching a banner tied to it
      if (categoryId && categoryId !== "all") {
        const { data: catData, error: catError } = await supabase
          .from("banners")
          .select("*")
          .eq("position", "category_header")
          .eq("category_id", categoryId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1);

        if (!catError && catData && catData.length > 0) {
          return catData[0];
        }
      }

      // 2. Fallback: If no category-specific banner exists (or "all" is selected), 
      // grab a general category header banner where category_id is null/empty
      const { data: generalData, error: genError } = await supabase
        .from("banners")
        .select("*")
        .eq("position", "category_header")
        .is("category_id", null)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (genError) throw genError;
      return generalData && generalData.length > 0 ? generalData[0] : null;
    },
  });

  if (isLoading || !banner) return null;

  return (
    <div className="w-full mb-6 overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
      <a
        href={banner.target_url || "#"}
        target={banner.target_url?.startsWith("http") ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="block relative aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1] w-full overflow-hidden group"
      >
        <img
          src={banner.image_url}
          alt={banner.title || "Category Banner"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {banner.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <h3 className="text-white font-semibold text-sm md:text-lg tracking-tight drop-shadow-md">
              {banner.title}
            </h3>
          </div>
        )}
      </a>
    </div>
  );
};