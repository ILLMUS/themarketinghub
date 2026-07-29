import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Eye, Star, Filter, ArrowUpDown } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AdTier = Database["public"]["Enums"]["ad_tier"];

const tierBadgeStyles: Record<AdTier, string> = {
  e500: "bg-accent/20 text-accent-foreground border-accent/40",
  e350: "bg-primary/15 text-primary border-primary/30",
  e250: "bg-muted text-muted-foreground border-border",
};

export const LatestListings = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Fetch categories for filtering
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch latest approved listings
  const { data: listings, isLoading } = useQuery({
    queryKey: ["latest-listings", selectedCategory, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved");

      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price-high") {
        query = query.order("price", { ascending: false });
      }

      const { data, error } = await query.limit(24);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container px-4 py-8 md:py-12 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-primary" /> Latest Listings
          </h1>
          <p className="text-sm text-muted-foreground">
            Explore the newest verified items, vehicles, properties, and services posted on the platform.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-9 w-[160px] text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 w-[140px] text-xs">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border rounded-xl h-72 bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((ad: any) => {
            const imageUrl = ad.images?.[0] || "/placeholder.svg";
            return (
              <div
                key={ad.id}
                onClick={() => navigate(`/ad/${ad.id}`)}
                className="group border rounded-xl overflow-hidden bg-card hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <img
                      src={imageUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      {ad.is_featured && (
                        <Badge variant="default" className="bg-accent text-accent-foreground text-[10px] px-2 py-0.5 shadow-sm">
                          <Star className="h-3 w-3 fill-current mr-1" /> Featured
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[10px] px-2 py-0.5 backdrop-blur-md bg-background/80 ${tierBadgeStyles[ad.tier as AdTier]}`}>
                        {ad.tier.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                      {ad.categories?.name || "General"}
                    </span>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {ad.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {ad.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-3">
                  <div className="text-base font-bold text-foreground">
                    E{ad.price?.toLocaleString()}
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs text-muted-foreground group-hover:text-primary group-hover:bg-primary/10">
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed rounded-xl p-12 text-center space-y-3">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="font-semibold text-base">No listings found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are currently no active listings matching your filter criteria. Check back later or clear your filters.
          </p>
          <Button size="sm" variant="outline" onClick={() => { setSelectedCategory("all"); setSortBy("newest"); }}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default LatestListings;