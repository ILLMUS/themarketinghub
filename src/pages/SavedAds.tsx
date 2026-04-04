import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSavedAds } from "@/hooks/useSavedAds";
import { AdCard } from "@/components/AdCard";
import { Loader2, Heart } from "lucide-react";

const SavedAdsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { savedAdIds } = useSavedAds();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const { data: ads, isLoading } = useQuery({
    queryKey: ["saved-ads-full", savedAdIds],
    queryFn: async () => {
      if (!savedAdIds.length) return [];
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .in("id", savedAdIds);
      if (error) throw error;
      return data;
    },
    enabled: !!user && savedAdIds.length > 0,
  });

  if (authLoading || isLoading) {
    return <div className="container py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Saved Ads</h1>
      <p className="text-muted-foreground mb-8">Your bookmarked listings</p>

      {ads && ads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((ad) => <AdCard key={ad.id} ad={ad} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No saved ads yet</h3>
          <p className="text-muted-foreground">Browse the marketplace and save ads you like</p>
        </div>
      )}
    </div>
  );
};

export default SavedAdsPage;
