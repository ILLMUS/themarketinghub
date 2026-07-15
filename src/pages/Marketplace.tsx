import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdCard } from "@/components/AdCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { Seo } from "@/hooks/useSeo";

const LOCATIONS = ["All Locations", "Mbabane", "Manzini", "Siteki", "Big Bend", "Nhlangano", "Matsapha", "Piggs Peak"];

// Explicit translation mapping to bridge navigation links directly to your exact database IDs
const CATEGORY_MAP: Record<string, string> = {
  "property": "30326520-bd9e-48b6-b93e-47cc5fe38001",  // Real Estate
  "vehicles": "c8c81287-c0f4-42e1-b10b-cc522ad31a79",  // Vehicles
  "pets": "6f52eb48-337b-4e66-85c6-d54c0607f43e",      // Livestock
  "sale": "all"                                       // For Sale falls back to view all items
};

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const subcategoryParam = searchParams.get("subcategory");
  const searchParam = searchParams.get("search");

  const [search, setSearch] = useState(searchParam || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam || "all");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");

  // Sync state cleanly when URL modifications take effect
  useEffect(() => {
    if (categoryParam) {
      const lowerParam = categoryParam.toLowerCase();
      // If it matches one of our short keywords, use the mapped UUID. Otherwise, use it directly (if it's already a UUID).
      setSelectedCategory(CATEGORY_MAP[lowerParam] || categoryParam);
    } else {
      setSelectedCategory("all");
    }
    if (subcategoryParam) setSelectedSubcategory(subcategoryParam);
  }, [categoryParam, subcategoryParam]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: ads, isLoading } = useQuery({
    queryKey: ["marketplace-ads", search, selectedCategory, selectedSubcategory, selectedLocation],
    queryFn: async () => {
      let query = supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      // Clean condition check ensuring strict true UUID comparison logic execution
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("category_id" as any, selectedCategory);
      }

      if (selectedSubcategory && selectedSubcategory !== "all") {
        query = query.eq("subcategory" as any, selectedSubcategory);
      }

      if (selectedLocation && selectedLocation !== "All Locations") {
        query = query.ilike("location" as any, `%${selectedLocation}%`);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const activeCategory = categories?.find((c: any) => c.id === selectedCategory);
  const locationLabel = selectedLocation !== "All Locations" ? ` in ${selectedLocation}` : " in Eswatini";

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedSubcategory("all"); 
    if (val === "all") {
      searchParams.delete("category");
    } else {
      // Find original map clean string reference if possible to save a clean name to the URL parameter
      const reversedSlug = Object.keys(CATEGORY_MAP).find(key => CATEGORY_MAP[key] === val);
      searchParams.set("category", reversedSlug || val);
    }
    searchParams.delete("subcategory");
    setSearchParams(searchParams);
  };

  return (
    <div className="container py-8">
      <Seo
        title={activeCategory ? `${activeCategory.name}${locationLabel} | Market Hub` : "Marketplace | Market Hub"}
        description="Browse current listings across local markets."
        url={window.location.origin}
      />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {activeCategory ? `${activeCategory.name}${locationLabel}` : "Marketplace"}
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-32 animate-pulse bg-muted rounded-xl" />
      ) : ads && ads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((ad: any) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border rounded-2xl border-dashed">
          <SlidersHorizontal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No listings found</h3>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;