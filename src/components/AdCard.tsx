import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface AdCardProps {
  ad: Tables<"advertisements"> & { categories?: { name: string } | null };
}

export function AdCard({ ad }: AdCardProps) {
  const firstImage = ad.images?.[0];

  return (
    <Link
      to={`/ad/${ad.id}`}
      className="group block rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
    >
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
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {ad.title}
          </h3>
        </div>
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
  );
}
