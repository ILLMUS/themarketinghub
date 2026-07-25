import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSavedAds } from "@/hooks/useSavedAds";
import { Seo } from "@/hooks/useSeo";
import { adOg } from "@/lib/ogImage";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { 
  MessageCircle, MapPin, ArrowLeft, ArrowRight, 
  Calendar, Heart, X, ShieldCheck, AlertTriangle, Tag,
  Sparkles, Maximize2, User, Lock
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareButtons } from "@/components/ShareButtons";
import { format } from "date-fns";
import { toast } from "sonner";

const AdDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedAds();
  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const nextImage = () => {
    if (!ad?.images) return;
    setDirection(1);
    setSelectedImage((prev) => (prev === ad.images.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    if (!ad?.images) return;
    setDirection(-1);
    setSelectedImage((prev) => (prev === 0 ? ad.images.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!previewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": setPreviewOpen(false); break;
        case "ArrowLeft": previousImage(); break;
        case "ArrowRight": nextImage(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewOpen]);

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

  // Handler for starting/continuing secure in-app conversations
  const handleStartConversation = async () => {
    if (!user) {
      toast.error("Please sign in to message the seller securely.");
      navigate("/auth");
      return;
    }

    if (user.id === ad.user_id) {
      toast.info("This is your own listing.");
      return;
    }

    try {
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
          
        if (error) throw error;
        navigate(`/messages?conversation=${newConvo.id}`);
      }
    } catch {
      toast.error("Could not initiate a secure chat. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-7xl px-4 animate-pulse">
        <div className="h-9 bg-muted rounded-xl w-28 mb-6" />
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 aspect-[4/3] bg-muted rounded-3xl" />
          <div className="md:col-span-5 space-y-4">
            <div className="h-10 bg-muted rounded-xl w-3/4" />
            <div className="h-12 bg-muted rounded-2xl w-1/2" />
            <div className="h-40 bg-muted rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container py-24 text-center px-4">
        <div className="inline-flex p-4 rounded-full bg-muted/50 mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">This item may have been removed or is no longer available.</p>
        <Button asChild rounded-full><Link to="/marketplace">Explore Marketplace</Link></Button>
      </div>
    );
  }

  const seoTitle = `${ad.title} – E${ad.price.toLocaleString()} in ${ad.location} | Market Hub`;
  const seoDesc = (ad.description || "").replace(/\s+/g, " ").trim().slice(0, 160);
  const seoImage = adOg(ad.id);
  const canonical = `${window.location.origin}/ad/${ad.id}`;

  return (
    <div className="container py-4 sm:py-8 max-w-7xl px-3 sm:px-6 pb-24 sm:pb-12">
      <Seo title={seoTitle} description={seoDesc} image={seoImage} url={canonical} type="product" />
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Button variant="outline" size="sm" asChild className="rounded-full backdrop-blur-md bg-background/80 hover:bg-muted border-border/80 shadow-sm text-xs sm:text-sm">
          <Link to="/marketplace"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Marketplace</Link>
        </Button>
        <div className="flex items-center gap-2">
          {user && (
            <Button 
              variant="outline" 
              size="icon" 
              className={`rounded-full h-9 w-9 border-border/80 transition-all ${isSaved(ad.id) ? "bg-rose-500/10 border-rose-500/30 text-rose-500" : ""}`}
              onClick={() => toggleSave(ad.id)}
            >
              <Heart className={`h-4 w-4 ${isSaved(ad.id) ? "fill-rose-500 text-rose-500" : ""}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section Grid */}
      <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* Left Column: Gallery & Extended Media */}
        <div className="md:col-span-7 space-y-5">
          
          {/* Main Visual Frame */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-3xl bg-black/90 overflow-hidden border border-border/60 shadow-xl group flex items-center justify-center">
            {ad.images && ad.images.length > 0 ? (
              <>
                <img
                  src={ad.images[selectedImage]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-50 scale-110 pointer-events-none"
                />
                
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0.85, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={ad.images[selectedImage]}
                  alt={ad.title}
                  onClick={() => setPreviewOpen(true)}
                  className="relative z-10 max-w-full max-h-full object-contain cursor-zoom-in transition-transform duration-500 group-hover:scale-[1.02]"
                />

                <button 
                  onClick={() => setPreviewOpen(true)}
                  className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-lg transition-all"
                >
                  <Maximize2 className="h-3 w-3 text-primary" /> Full View
                </button>

                {ad.images.length > 1 && (
                  <span className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white tracking-wider">
                    {selectedImage + 1} / {ad.images.length}
                  </span>
                )}
              </>
            ) : (
              <div className="text-muted-foreground text-xs flex flex-col items-center gap-2">
                <Tag className="h-8 w-8 opacity-40" />
                <span>No media attached</span>
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Bar */}
          {ad.images && ad.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {ad.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 bg-black/80 transition-all ${
                    i === selectedImage 
                      ? "border-primary ring-2 ring-primary/30 scale-95 shadow-md" 
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Detailed Item Overview Card */}
          <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-5 sm:p-6 space-y-3.5 shadow-sm">
            <h3 className="font-bold text-base sm:text-lg text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Item Highlights & Overview
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-normal">
              {ad.description}
            </p>
          </div>

          {/* Interactive Location Block */}
          <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-5 sm:p-6 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Location & Pickup
              </h3>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted/80">{ad.location}</span>
            </div>
            <div className="w-full h-44 sm:h-52 rounded-2xl overflow-hidden border border-border/60 bg-muted">
              <iframe
                title="Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(ad.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Verified Seller & Secure Chat */}
        <div className="md:col-span-5 space-y-5">
          <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm sticky top-6">
            
            {/* Header Badge Row */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {ad.categories?.name && (
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium border border-border/50">
                    {ad.categories.name}
                  </Badge>
                )}
                {ad.is_featured && (
                  <Badge className="gradient-accent border-0 rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                    Featured Item
                  </Badge>
                )}
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{ad.title}</h1>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">E{ad.price.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground font-medium">SZL</span>
              </div>
            </div>

            {/* Quick Metadata Bar */}
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-y border-border/60 py-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">{ad.location}</span>
              </div>
              <div className="flex items-center gap-1.5 justify-end">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{format(new Date(ad.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>

            {/* Secure Seller Card */}
            <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight">{ad.seller_name}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Verified Member</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-xs font-semibold border border-emerald-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>

              {/* Exclusive Secure In-App Messaging Button */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button 
                  className="w-full gradient-primary border-0 h-11 rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:scale-[1.01] transition-transform"
                  onClick={handleStartConversation}
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Message Seller In-App
                </Button>
              </div>
            </div>

            {/* Platform Security Notice */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Lock className="h-4 w-4 shrink-0" /> Protected Communication
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                To prevent scams, phishing, and unwanted calls, all communications are safely handled within Market Hub chat. Never share sensitive bank details or passwords.
              </p>
            </div>

            {/* Social Share Section */}
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-2.5 font-medium">Share this deal</p>
              <ShareButtons url={canonical} title={`${ad.title} – E${ad.price.toLocaleString()} in ${ad.location}`} />
            </div>

          </div>
        </div>
      </div>

      {/* Similar Listings Carousel Grid */}
      {similarAds && similarAds.length > 0 && (
        <div className="mt-12 sm:mt-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Similar Items You Might Like</h2>
            <Link to="/marketplace" className="text-xs font-semibold text-primary hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {similarAds.map((adItem) => (
              <div key={adItem.id}>
                <Link to={`/ad/${adItem.id}`} className="group block rounded-2xl border border-border/80 bg-card overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300">
                  <div className="aspect-[4/3] bg-black/90 overflow-hidden relative">
                    {adItem.images?.[0] ? (
                      <img src={adItem.images[0]} alt={adItem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2">{adItem.title}</h3>
                    <p className="text-sm sm:text-base font-extrabold text-primary mt-1.5">E{adItem.price.toLocaleString()}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Deck - Enforces Secure Chat */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-background/80 backdrop-blur-xl border-t border-border/80 md:hidden flex items-center gap-2 shadow-2xl">
        <Button onClick={handleStartConversation} className="w-full gradient-primary border-0 h-11 rounded-xl text-xs font-bold">
          <MessageCircle className="h-4 w-4 mr-2" /> Message Seller
        </Button>
      </div>

      {/* Lightbox Interactive Modal */}
      <AnimatePresence>
        {previewOpen && ad.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2"
            onClick={() => setPreviewOpen(false)}
          >
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-5 right-5 text-white hover:text-primary transition z-50 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20"
            >
              <X size={24} />
            </button>

            {ad.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); previousImage(); }}
                className="absolute left-3 sm:left-6 text-white bg-black/60 backdrop-blur-md rounded-full p-3 hover:bg-primary transition z-50 border border-white/10"
              >
                <ArrowLeft size={22} />
              </button>
            )}

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={selectedImage}
                custom={direction}
                initial={(direction: number) => ({ x: direction > 0 ? 200 : -200, opacity: 0 })}
                animate={{ x: 0, opacity: 1 }}
                exit={(direction: number) => ({ x: direction > 0 ? -200 : 200, opacity: 0 })}
                transition={{ duration: 0.25 }}
                className="w-full h-full max-w-[95vw] max-h-[85vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <TransformWrapper>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                    <img
                      src={ad.images[selectedImage]}
                      alt={ad.title}
                      className="max-w-full max-h-[85vh] object-contain rounded-2xl select-none"
                    />
                  </TransformComponent>
                </TransformWrapper>
              </motion.div>
            </AnimatePresence>

            {ad.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-3 sm:right-6 text-white bg-black/60 backdrop-blur-md rounded-full p-3 hover:bg-primary transition z-50 border border-white/10"
              >
                <ArrowRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdDetailsPage;