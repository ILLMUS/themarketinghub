import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CategoryBannerProps {
  categoryId?: string; 
}

export const CategoryBanner = ({ categoryId }: CategoryBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["category-header-banners", categoryId],
    queryFn: async () => {
      // 1. If a specific category is selected, try fetching up to 5 banners tied to it
      if (categoryId && categoryId !== "all") {
        const { data: catData, error: catError } = await supabase
          .from("banners")
          .select("*")
          .eq("position", "category_header")
          .eq("category_id", categoryId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!catError && catData && catData.length > 0) {
          return catData;
        }
      }

      // 2. Fallback: If no category-specific banners exist, grab up to 5 general banners
      const { data: generalData, error: genError } = await supabase
        .from("banners")
        .select("*")
        .eq("position", "category_header")
        .is("category_id", null)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (genError) throw genError;
      return generalData || [];
    },
  });

  // Auto-slide every 15 seconds if there are multiple banners
  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 15000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (isLoading || banners.length === 0) return null;

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div className="w-full mb-6 overflow-hidden rounded-none border bg-card shadow-sm">
      <a
        href={currentBanner.target_url || "#"}
        target={currentBanner.target_url?.startsWith("http") ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="block relative aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1] w-full overflow-hidden group"
      >
        {banners.map((banner, index) => (
          <img
            key={banner.id}
            src={banner.image_url}
            alt={banner.title || "Category Banner"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-105 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          />
        ))}
      </a>
    </div>
  );
};