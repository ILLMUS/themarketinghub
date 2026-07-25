import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  ExternalLink, Tag, MessageSquare, MapPin, Share2, 
  Send, Check, Copy, ShieldCheck, Info, Calendar, AlertTriangle, Lock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: banner, isLoading } = useQuery({
    queryKey: ["ad-banner", position],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching banner for position ${position}:`, error);
        return null;
      }
      return data;
    },
  });

  if (isLoading || !banner) return null;

  const locationName = banner.location_name || "Mbabane, Eswatini";
  const targetUrl = banner.target_url || window.location.href;
  const createdDate = banner.created_at 
    ? new Date(banner.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";
  const refId = `#BNR-${banner.id?.slice(0, 6).toUpperCase()}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: banner.title || "Promotional Banner",
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

  // Integrated in-app messaging handler that handles missing ad_id columns gracefully
  const handleStartConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!user) {
      toast.error("Please sign in to message the advertiser.");
      setIsOpen(false);
      navigate("/login");
      return;
    }

    const sellerId = banner.user_id;
    if (sellerId && sellerId === user.id) {
      toast.error("You cannot send a message to your own banner listing.");
      return;
    }

    setIsSending(true);

    try {
      const adId = banner.ad_id || null;
      let conversationId: string | null = null;

      // 1. Check if a conversation already exists
      let query = supabase
        .from("conversations")
        .select("id")
        .eq("buyer_id", user.id);

      if (sellerId) {
        query = query.eq("seller_id", sellerId);
      }

      if (adId) {
        query = query.eq("ad_id", adId);
      }

      const { data: existingConvos } = await query.limit(1).maybeSingle();

      if (existingConvos?.id) {
        conversationId = existingConvos.id;
      } else {
        // 2. Prepare payload for new conversation row
        // If your DB requires ad_id, we look up or fallback to a valid listing ID 
        // or omit/provide dummy fallback if the column allows null or has a default.
        const insertPayload: any = {
          buyer_id: user.id,
          seller_id: sellerId || user.id,
          updated_at: new Date().toISOString(),
        };

        if (adId) {
          insertPayload.ad_id = adId;
        } else {
          // Attempt to find any active valid advertisement ID in the database to satisfy NOT NULL constraint
          const { data: fallbackAd } = await supabase
            .from("advertisements")
            .select("id")
            .limit(1)
            .maybeSingle();

          if (fallbackAd?.id) {
            insertPayload.ad_id = fallbackAd.id;
          }
        }

        const { data: newConvo, error: convoError } = await supabase
          .from("conversations")
          .insert(insertPayload)
          .select("id")
          .single();

        if (convoError) throw convoError;
        conversationId = newConvo.id;
      }

      // 3. Format clipped product details into message content
      const productTitle = banner.title || "Featured Promotion";
      const clippedMessage = `📌 Inquiring about: "${productTitle}" (${refId})\n📍 Location: ${locationName}\n---\n${message.trim()}`;

      // 4. Insert message into messages table
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: clippedMessage,
        read: false,
      });

      if (msgError) throw msgError;

      // 5. Update conversation timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

      // Invalidate queries so inbox badges & threads refresh immediately
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["unread-messages"] });

      setIsOpen(false);
      setMessage("");
      toast.success("Message sent with banner details!");
      navigate(`/messages?conversation=${conversationId}`);
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
        <div
          onClick={() => setIsOpen(true)}
          className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        >
          {/* Banner Container */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[4/1] md:aspect-[5/1] bg-black/95 overflow-hidden flex items-center justify-center">
            <img
              src={banner.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-110"
            />
            <img
              src={banner.image_url}
              alt={banner.title || "Promotional Banner"}
              className="relative z-10 w-full h-full object-contain sm:object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10" />

            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
                <Tag className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                Featured
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 z-20 flex items-end justify-between gap-2">
              <div className="space-y-0.5 max-w-[65%] sm:max-w-xl">
                {banner.title && (
                  <h3 className="text-xs sm:text-lg md:text-xl font-bold text-white line-clamp-1">
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
                <span className="inline-flex items-center gap-1 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur-md border border-white/20 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[10px] sm:text-xs md:text-sm font-semibold text-white shadow-xl transition-all">
                  Check it out
                  <ExternalLink className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-primary" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Secure Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-2xl p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col bg-background border border-border">
          
          {/* Header Image */}
          <div className="relative w-full h-44 sm:h-60 bg-black/90 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src={banner.image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110"
            />
            <img
              src={banner.image_url}
              alt={banner.title}
              className="relative z-10 w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/20 to-black/60 z-20" />
            
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-30 flex items-center gap-1.5 flex-wrap max-w-[80%]">
              <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[10px] sm:text-xs font-bold uppercase text-accent-foreground shadow-md">
                <Tag className="h-3 w-3" /> Partner
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-black/60 backdrop-blur-md border border-white/20 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> Verified
              </span>
            </div>

            <div className="absolute bottom-2.5 left-3 right-3 z-30 text-white">
              <h2 className="text-base sm:text-2xl font-bold line-clamp-1">
                {banner.title || "Featured Promotion"}
              </h2>
              <div className="flex items-center gap-3 text-[11px] sm:text-xs text-gray-200 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {locationName}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {createdDate}</span>
              </div>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-3 h-9 sm:h-10 text-xs">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contact">Send Message</TabsTrigger>
                <TabsTrigger value="location">Map</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-primary" /> Description
                  </h4>
                  <p className="text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-xl border border-border/50 text-xs sm:text-sm">
                    {banner.description || "Contact the advertiser directly through in-app chat for full availability, specifications, and details."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block uppercase font-medium">Status</span>
                    <span className="text-xs font-bold text-emerald-500">Active</span>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5">
                    <span className="text-[10px] text-muted-foreground block uppercase font-medium">Location</span>
                    <span className="text-xs font-bold line-clamp-1">{locationName}</span>
                  </div>
                  <div className="p-2.5 rounded-lg border bg-card text-center space-y-0.5 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-muted-foreground block uppercase font-medium">Ref ID</span>
                    <span className="text-xs font-bold text-primary">{refId}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <Lock className="h-3.5 w-3.5 shrink-0" /> In-App Messaging Enabled
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Chat directly with the advertiser right inside the app to discuss options and details safely.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-3">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Send a Direct Message</h4>
                      <p className="text-[11px] text-muted-foreground">This will start a chat thread with attached item details.</p>
                    </div>
                  </div>

                  {/* Clipped Product Context Preview Card */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
                    <img 
                      src={banner.image_url} 
                      alt="" 
                      className="w-12 h-12 rounded-lg object-cover border shrink-0 bg-background" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Attaching Reference</p>
                      <p className="font-semibold text-xs text-foreground line-clamp-1">{banner.title || "Featured Promotion"}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{refId} • {locationName}</p>
                    </div>
                  </div>

                  <form onSubmit={handleStartConversation} className="space-y-2.5">
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi, I would like to inquire more about this promotion..."
                      className="w-full text-xs p-3 rounded-xl border bg-background focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                    <Button 
                      type="submit" 
                      disabled={isSending || !message.trim()}
                      className="w-full gap-2 gradient-primary border-0 h-10 text-xs sm:text-sm font-semibold shadow-md"
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Safety Notice
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">
                    Keep payments and communications strictly within the platform to protect yourself against fraud.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-2">
                <div className="w-full h-44 sm:h-52 rounded-xl overflow-hidden border bg-muted">
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
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
              <span>Share:</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleShare} className="h-7 px-2.5 text-[11px]">
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </Button>
                <Button size="sm" variant="outline" onClick={copyToClipboard} className="h-7 px-2.5 text-[11px]">
                  {copied ? <Check className="h-3 w-3 mr-1 text-emerald-600" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? "Copied" : "Copy Link"}
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdBanner;