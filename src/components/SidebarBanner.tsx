import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SidebarBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["sidebar-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", "sidebar")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  // Auto-slide every 15 seconds if there are multiple sidebar banners
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
        className="block relative aspect-[3/4] sm:aspect-[9/16] w-full overflow-hidden group"
      >
        {banners.map((banner, index) => (
          <img
            key={banner.id}
            src={banner.image_url}
            alt={banner.title || "Sidebar Banner"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 group-hover:scale-105 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          />
        ))}
      </a>
    </div>
  );
};