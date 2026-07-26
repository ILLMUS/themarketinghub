import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  ExternalLink, Tag, MessageSquare, MapPin, Share2, 
  Send, Check, Copy, ShieldCheck, Info, Calendar, AlertTriangle, Lock, Loader2, X,
  Maximize2, ArrowLeft, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface AdBannerProps {
  position: "home_top" | "home_middle" | "home_bottom" | "sidebar" | "category_header";
  className?: string;
}

export const AdBanner = ({ position, className = "" }: AdBannerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Autoplay plugin with stopOnInteraction enabled so sliding pauses when a user interacts or clicks a banner
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  const { data: banners, isLoading } = useQuery({
    queryKey: ["ad-banner", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching banners for position ${position}:`, error);
        return [];
      }
      return data || [];
    },
  });

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [activeBannerIndex]);

  if (isLoading || !banners || banners.length === 0) return null;

  const currentBanner = banners[activeBannerIndex] || banners[0];

  const locationName = currentBanner.location_name || "Mbabane, Eswatini";
  const targetUrl = currentBanner.target_url || window.location.href;
  const createdDate = currentBanner.created_at 
    ? new Date(currentBanner.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";
  const refId = `#BNR-${currentBanner.id?.slice(0, 6).toUpperCase()}`;

  const bannerImages = (currentBanner as any).images?.length > 0 
    ? (currentBanner as any).images 
    : currentBanner.image_url ? [currentBanner.image_url] : [];

  const nextImage = () => {
    if (!bannerImages.length) return;
    setDirection(1);
    setSelectedImage((prev) => (prev === bannerImages.length - 1 ? 0 : prev + 1));
  };

  const previousImage = () => {
    if (!bannerImages.length) return;
    setDirection(-1);
    setSelectedImage((prev) => (prev === 0 ? bannerImages.length - 1 : prev - 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentBanner.title || "Promotional Banner",
          url: targetUrl,
        });
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!user) {
      toast.error("Please sign in to message the advertiser.");
      setIsOpen(false);
      navigate("/login");
      return;
    }

    let sellerId = currentBanner.user_id;
    if (!sellerId) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", user.id)
        .limit(1);
      
      if (profiles && profiles.length > 0) {
        sellerId = profiles[0].id;
      } else {
        const { data: fallbackUser } = await supabase
          .from("profiles")
          .select("id")
          .limit(1)
          .maybeSingle();
        
        if (fallbackUser?.id) {
          sellerId = fallbackUser.id;
        } else {
          toast.error("Unable to identify message recipient.");
          return;
        }
      }
    }

    if (sellerId === user.id) {
      const { data: alternativeProfiles } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", user.id)
        .limit(1);

      if (alternativeProfiles && alternativeProfiles.length > 0) {
        sellerId = alternativeProfiles[0].id;
      } else {
        toast.error("You cannot send a message to your own listing.");
        return;
      }
    }

    setIsSending(true);

    try {
      let adId = currentBanner.ad_id;
      if (!adId) {
        const { data: fallbackAd } = await supabase
          .from("advertisements")
          .select("id")
          .limit(1)
          .maybeSingle();

        if (fallbackAd?.id) {
          adId = fallbackAd.id;
        } else {
          toast.error("Missing required advertisement reference ID in database.");
          setIsSending(false);
          return;
        }
      }

      const { data: existingConvo } = await supabase
        .from("conversations")
        .select("id")
        .eq("ad_id", adId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      let conversationId: string;

      if (existingConvo) {
        conversationId = existingConvo.id;
      } else {
        const { data: newConvo, error: convoError } = await supabase
          .from("conversations")
          .insert({
            ad_id: adId,
            buyer_id: user.id,
            seller_id: sellerId,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (convoError) throw convoError;
        conversationId = newConvo.id;
      }

      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: message.trim(),
        read: false,
      });

      if (msgError) throw msgError;

      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });

      setMessage("");
      toast.success("Message sent successfully!");
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className={`w-full ${className}`}>
        <Carousel
          opts={{ loop: true, align: "start" }}
          plugins={[autoplayPlugin.current]}
          className="w-full relative rounded-xl overflow-hidden shadow-sm"
          setApi={(api) => {
            if (!api) return;
            api.on("select", () => {
              setActiveBannerIndex(api.selectedScrollSnap());
            });
          }}
        >
          <CarouselContent>
            {banners.map((banner, index) => {
              const bannerImgs = (banner as any).images?.length > 0 
                ? (banner as any).images 
                : banner.image_url ? [banner.image_url] : [];
              const primaryImg = bannerImgs[0] || banner.image_url;

              return (
                <CarouselItem key={banner.id || index} className="basis-full">
                  <div
                    onClick={() => {
                      autoplayPlugin.current.stop();
                      setActiveBannerIndex(index);
                      setIsOpen(true);
                    }}
                    className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative w-full aspect-[16/9] sm:aspect-[4/1] md:aspect-[5/1] bg-black/95 overflow-hidden flex items-center justify-center">
                      <img
                        src={primaryImg}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110"
                      />
                      <img
                        src={primaryImg}
                        alt={banner.title || "Promotional Banner"}
                        className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />

                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                          <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Featured
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 z-20 flex items-end justify-between gap-2">
                        <div className="space-y-1 max-w-[65%] sm:max-w-xl p-2.5 sm:p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-lg">
                          {banner.title && (
                            <h3 className="text-xs sm:text-lg md:text-xl font-bold text-white line-clamp-1 drop-shadow-sm">
                              {banner.title}
                            </h3>
                          )}
                          {banner.description && (
                            <p className="text-[10px] sm:text-sm text-gray-200 line-clamp-1 font-medium hidden xs:block">
                              {banner.description}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0">
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              autoplayPlugin.current.stop();
                              setActiveBannerIndex(index);
                              setIsOpen(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-white shadow-xl transition-all"
                          >
                            Check it out
                            <ExternalLink className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-white/20 shadow-lg h-7 w-7 sm:h-8 sm:w-8" />
              <CarouselNext className="right-2 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-white/20 shadow-lg h-7 w-7 sm:h-8 sm:w-8" />
            </>
          )}
        </Carousel>
      </div>

      {/* Modal - Features configured 6rem top padding (pt-24) and 2rem bottom padding (pb-8) */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-3xl p-0 overflow-hidden rounded-3xl max-h-[92vh] flex flex-col bg-background border border-border shadow-2xl">
          
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white transition-all shadow-2xl"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Modal Header Showcase: 6rem top padding (pt-24) and 2rem bottom padding (pb-8) applied */}
          <div className="relative w-full bg-black overflow-hidden border-b border-border/60 flex items-center justify-center pt-24 pb-8 px-4 sm:px-8">
            <div className="relative w-full aspect-[16/11] sm:aspect-[16/9] bg-black/95 rounded-2xl overflow-hidden flex items-center justify-center">
              {bannerImages.length > 0 ? (
                <>
                  <img
                    src={bannerImages[selectedImage]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-20 scale-110 pointer-events-none"
                  />
                  
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0.85, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    src={bannerImages[selectedImage]}
                    alt={currentBanner.title || "Featured Promotion"}
                    onClick={() => setPreviewOpen(true)}
                    className="relative z-10 w-full h-full object-contain p-4 cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"
                  />

                  {/* Mobile & Desktop Safe Positioned Full View Button */}
                  <button 
                    onClick={() => setPreviewOpen(true)}
                    type="button"
                    className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-medium text-white shadow-lg transition-all"
                  >
                    <Maximize2 className="h-3 w-3 text-primary" /> Full View
                  </button>

                  {bannerImages.length > 1 && (
                    <span className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] sm:text-[11px] font-bold text-white tracking-wider">
                      {selectedImage + 1} / {bannerImages.length}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-muted-foreground text-xs flex flex-col items-center gap-2">
                  <Tag className="h-8 w-8 opacity-40" />
                  <span>No media attached</span>
                </div>
              )}

              {/* Badges on the Top-Left Side */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-30 flex items-center gap-1 flex-wrap max-w-[70%]">
                <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold uppercase text-accent-foreground shadow-md">
                  <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Featured
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-400" /> Verified
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Thumbnails Bar if multiple sub-images */}
          {bannerImages.length > 1 && (
            <div className="flex gap-2 p-2 bg-card/50 overflow-x-auto border-b border-border/60 scrollbar-none">
              {bannerImages.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 bg-black transition-all ${
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

          {/* Modal Content Tabs */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            
            <div className="flex flex-col gap-1 pb-2 border-b border-border/60">
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                {currentBanner.title || "Featured Promotion"}
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {locationName}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {createdDate}</span>
                <span className="ml-auto font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">{refId}</span>
              </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-4 h-9 sm:h-10 text-xs rounded-xl bg-muted/60 p-1">
                <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
                <TabsTrigger value="contact" className="rounded-lg">Send Message</TabsTrigger>
                <TabsTrigger value="location" className="rounded-lg">Map View</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                    <Info className="h-4 w-4 text-primary" /> Item Highlights & Overview
                  </h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/40 p-4 rounded-2xl border border-border/50 text-xs sm:text-sm whitespace-pre-wrap">
                    {currentBanner.description || "Contact the advertiser directly through in-app chat for full availability, specifications, and details."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl border bg-card/50 text-center space-y-1">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Status</span>
                    <span className="text-xs font-bold text-emerald-500 flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border bg-card/50 text-center space-y-1">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Location</span>
                    <span className="text-xs font-bold line-clamp-1">{locationName}</span>
                  </div>
                  <div className="p-3 rounded-xl border bg-card/50 text-center space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Ref ID</span>
                    <span className="text-xs font-bold text-primary">{refId}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Lock className="h-4 w-4 shrink-0" /> Protected In-App Communication
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    All chats remain safely encrypted within Market Hub. Never share bank passwords or sensitive credentials externally.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Secure In-App Chat</h4>
                      <p className="text-[11px] text-muted-foreground">Start a direct private conversation with the advertiser.</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
                    <img 
                      src={bannerImages[0] || currentBanner.image_url} 
                      alt="" 
                      className="w-12 h-12 rounded-xl object-cover border shrink-0 bg-background shadow-sm" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Target Listing Thread</p>
                      <p className="font-semibold text-xs text-foreground line-clamp-1">{currentBanner.title || "Featured Promotion"}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{refId} • {locationName}</p>
                    </div>
                  </div>

                  <form onSubmit={handleStartConversation} className="space-y-3">
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, is this item still available? I would like to inquire about..."
                      className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border bg-background focus:ring-2 focus:ring-primary/40 outline-none resize-none shadow-sm"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSending || !message.trim()}
                      className="w-full gap-2 gradient-primary border-0 h-11 text-xs sm:text-sm font-semibold shadow-md hover:scale-[1.01] transition-transform"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Send Direct Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0" /> Safety Notice
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Keep payments and communications strictly within the platform to safeguard against fraud.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" /> Location & Pickup Area
                  </h4>
                  <div className="w-full h-52 sm:h-60 rounded-2xl overflow-hidden border border-border/60 bg-muted shadow-sm">
                    <iframe
                      title="Location Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span className="font-medium">Share listing:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleShare} className="h-8 px-3 rounded-full text-xs">
                  <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                </Button>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-8 px-3 rounded-full text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Lightbox Preview Modal */}
      <AnimatePresence>
        {previewOpen && bannerImages.length > 0 && (
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
              type="button"
              className="absolute top-5 right-5 text-white hover:text-primary transition z-50 p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20"
            >
              <X size={24} />
            </button>

            {bannerImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); previousImage(); }}
                type="button"
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
                      src={bannerImages[selectedImage]}
                      alt={currentBanner.title || "Promotion"}
                      className="max-w-full max-h-[85vh] object-contain rounded-2xl select-none"
                    />
                  </TransformComponent>
                </TransformWrapper>
              </motion.div>
            </AnimatePresence>

            {bannerImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                type="button"
                className="absolute right-3 sm:right-6 text-white bg-black/60 backdrop-blur-md rounded-full p-3 hover:bg-primary transition z-50 border border-white/10"
              >
                <ArrowRight size={22} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdBanner;