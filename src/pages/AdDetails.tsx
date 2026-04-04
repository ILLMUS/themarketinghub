import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSavedAds } from "@/hooks/useSavedAds";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MapPin, ArrowLeft, Share2, Calendar, Heart } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

const AdDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedAds();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: ad, isLoading } = useQuery({
    queryKey: ["ad", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: similarAds } = useQuery({
    queryKey: ["similar-ads", ad?.category_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("category_id", ad!.category_id)
        .neq("id", ad!.id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!ad,
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 animate-pulse">
        <div className="h-8 bg-muted rounded w-24 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-10 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Ad not found</h2>
        <Button asChild><Link to="/marketplace">Back to Marketplace</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-lg bg-muted overflow-hidden">
            {ad.images && ad.images.length > 0 ? (
              <img src={ad.images[selectedImage]} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
            )}
          </div>
          {ad.images && ad.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {ad.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-colors ${i === selectedImage ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {ad.categories?.name && <Badge variant="secondary">{ad.categories.name}</Badge>}
              {ad.is_featured && <Badge className="gradient-accent border-0">Featured</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{ad.title}</h1>
            <p className="text-3xl font-bold text-primary mt-3">E{ad.price.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {ad.location}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(ad.created_at), "MMM d, yyyy")}</span>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{ad.description}</p>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Seller: {ad.seller_name}</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 gradient-primary border-0">
                <a href={`tel:${ad.phone}`}><Phone className="h-4 w-4 mr-2" /> Call Seller</a>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-success text-success hover:bg-success hover:text-success-foreground">
                <a href={`https://wa.me/${ad.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </a>
              </Button>
            </div>
            {user && user.id !== ad.user_id && (
              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  // Find or create conversation
                  const { data: existing } = await supabase
                    .from("conversations")
                    .select("id")
                    .eq("ad_id", ad.id)
                    .eq("buyer_id", user.id)
                    .maybeSingle();
                  if (existing) {
                    navigate(`/messages?conversation=${existing.id}`);
                  } else {
                    const { data: newConvo, error } = await supabase
                      .from("conversations")
                      .insert({ ad_id: ad.id, buyer_id: user.id, seller_id: ad.user_id })
                      .select("id")
                      .single();
                    if (error) { toast.error("Could not start conversation"); return; }
                    navigate(`/messages?conversation=${newConvo.id}`);
                  }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Message Seller
              </Button>
            )}
            <div className="flex gap-2">
              {user && (
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => toggleSave(ad.id)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved(ad.id) ? "fill-destructive text-destructive" : ""}`} />
                  {isSaved(ad.id) ? "Saved" : "Save"}
                </Button>
              )}
              <Button variant="ghost" className={user ? "flex-1" : "w-full"} onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Listings */}
      {similarAds && similarAds.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Similar Listings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {similarAds.map((ad) => (
              <div key={ad.id}>
                <Link to={`/ad/${ad.id}`} className="group block rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-[4/3] bg-muted overflow-hidden">
                    {ad.images?.[0] ? (
                      <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">{ad.title}</h3>
                    <p className="text-lg font-bold text-primary mt-1">E{ad.price.toLocaleString()}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetailsPage;
