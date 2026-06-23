import { Link } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { useSavedAds } from "@/hooks/useSavedAds";
import { useAuth } from "@/hooks/useAuth";

interface AdCardProps {
  ad: Tables<"advertisements"> & { categories?: { name: string } | null };
}

export function AdCard({ ad }: AdCardProps) {
  const firstImage = ad.images?.[0];
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedAds();

  return (
    <div className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
      {user && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSave(ad.id); }}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-card/80 backdrop-blur hover:bg-card transition-colors"
          title={isSaved(ad.id) ? "Unsave" : "Save"}
        >
          <Heart className={`h-4 w-4 ${isSaved(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
      )}
      <Link to={`/ad/${ad.id}`} className="block">
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {ad.title}
          </h3>
          <p className="text-lg font-bold text-primary">
            E{ad.price.toLocaleString()}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {ad.location}
            </span>
            {ad.categories?.name && (
              <span className="bg-secondary px-2 py-0.5 rounded-full">
                {ad.categories.name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
