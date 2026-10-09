import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Maximize2, User, Lock, Navigation, Star, Share2, Store,
  UserCheck, MoreHorizontal, Copy, Check, Send, ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareButtons } from "@/components/ShareButtons";
import { format } from "date-fns";
import { toast } from "sonner";

/* =========================================================
   CONFIG  (EDIT HERE IF YOUR DATABASE / ROUTES USE OTHER NAMES)

   RATINGS_TABLE  -> table that stores store ratings
                     (seller_id, rater_id, rating 1-5). SQL is in
                     store_ratings.sql
   MESSAGES_TABLE -> table that stores chat messages
                     (id, conversation_id, sender_id, content,
                      created_at)
   storePath      -> the page that shows a seller's store
========================================================= */

const RATINGS_TABLE = "store_ratings";
const MESSAGES_TABLE = "messages";

const storePath = (userId: string) => `/store/${userId}`;

/* Popups above the image: one at a time, each stays for 4 seconds,
   the next one follows straight away. */
const POPUP_MS = 4000;

/* Icon rail geometry (used to point each popup at its icon) */
const RAIL_SIZE = 36;
const RAIL_GAP = 8;
const RAIL_EDGE = 12;

/* =========================================================
   TYPES
========================================================= */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdRow = any;

type ModalKey = "rate" | "share" | "location" | "chat";

type ChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

type RatingSummary = {
  avg: number;
  count: number;
  mine: number;
};

const RAIL: {
  key: ModalKey;
  label: string;
  icon: typeof Star;
}[] = [
  { key: "rate", label: "Rate this store", icon: Star },
  { key: "share", label: "Share this listing", icon: Share2 },
  { key: "location", label: "View location and pickup", icon: MapPin },
  { key: "chat", label: "Message the seller", icon: MessageCircle },
];

/* =========================================================
   HELPERS
========================================================= */

// Haversine formula to calculate distance in kilometers between two lat/lng coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)}m away` : `${km.toFixed(1)}km away`;

const isFeaturedAd = (a: AdRow) =>
  Boolean(a?.is_featured) || ["e500", "e350"].includes(a?.tier ?? "");

const copyText = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return format(d, "MMM d, yyyy");
};

/* =========================================================
   STAR ROW  (supports halves, e.g. 2.5 stars)
========================================================= */

const StarRow = ({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center gap-0.5 ${className}`}
    aria-label={`${value.toFixed(1)} out of 5`}
  >
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = Math.max(0, Math.min(1, value - i));

      return (
        <span
          key={i}
          className="relative inline-block shrink-0"
          style={{ width: size, height: size }}
        >
          <Star
            size={size}
            className="absolute inset-0 text-muted-foreground/40"
          />

          <span
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fill * 100}%` }}
          >
            <Star
              size={size}
              className="shrink-0 fill-amber-400 text-amber-400"
            />
          </span>
        </span>
      );
    })}
  </span>
);

/* =========================================================
   MODAL SHELL
   Opens over the page, so the person never leaves the listing.
========================================================= */

const Modal = ({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.96 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ModalHeader = ({
  title,
  icon,
  onClose,
}: {
  title: string;
  icon: ReactNode;
  onClose: () => void;
}) => (
  <div className="flex items-center justify-between gap-2">
    <h3 className="flex items-center gap-2 text-sm font-bold sm:text-base">
      {icon}
      {title}
    </h3>

    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-muted/60 transition hover:bg-muted"
    >
      <X className="h-4 w-4" />
    </button>
  </div>
);

const modalCard =
  "rounded-[2rem] rounded-tr-[3rem] border border-border/80 bg-card p-4 shadow-2xl sm:p-5";

/* =========================================================
   RATE MODAL  (quick rating, without leaving the page)
========================================================= */

const RATING_WORDS = ["Poor", "Fair", "Good", "Very good", "Excellent"];

const RateModal = ({
  sellerName,
  summary,
  onSubmit,
  onClose,
}: {
  sellerName: string;
  summary?: RatingSummary;
  onSubmit: (value: number) => Promise<boolean>;
  onClose: () => void;
}) => {
  const [value, setValue] = useState(summary?.mine ?? 0);
  const [hover, setHover] = useState(0);
  const [saving, setSaving] = useState(false);

  const shown = hover || value;

  const submit = async () => {
    if (!value || saving) return;

    setSaving(true);
    const ok = await onSubmit(value);
    setSaving(false);

    if (ok) onClose();
  };

  return (
    <div className={`${modalCard} space-y-4`}>
      <ModalHeader
        title="Rate this store"
        icon={<Star className="h-4 w-4 text-amber-500" />}
        onClose={onClose}
      />

      <p className="text-xs text-muted-foreground">
        How was your experience with{" "}
        <span className="font-semibold text-foreground">{sellerName}</span>?
      </p>

      <div className="flex flex-col items-center gap-2 py-1">
        <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setValue(n)}
              className="rounded-full p-0.5 transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`h-9 w-9 transition-colors ${
                  n <= shown
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>

        <span className="h-4 text-xs font-semibold text-muted-foreground">
          {shown ? RATING_WORDS[shown - 1] : "Tap a star"}
        </span>
      </div>

      {summary && summary.count > 0 && (
        <div className="flex items-center justify-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
          <StarRow value={summary.avg} size={14} />
          <span>
            {summary.avg.toFixed(1)} · {summary.count}{" "}
            {summary.count === 1 ? "rating" : "ratings"}
          </span>
        </div>
      )}

      <Button
        onClick={submit}
        disabled={!value || saving}
        className="gradient-primary h-11 w-full rounded-xl border-0 text-sm font-semibold"
      >
        {summary?.mine ? "Update rating" : "Submit rating"}
      </Button>
    </div>
  );
};

/* =========================================================
   LOCATION MODAL  (view location + copy pinned location)
========================================================= */

const LocationModal = ({
  ad,
  distanceKm,
  mapEmbedUrl,
  pinUrl,
  onClose,
}: {
  ad: AdRow;
  distanceKm: number | null;
  mapEmbedUrl: string;
  pinUrl: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(pinUrl);

    if (!ok) {
      toast.error("Could not copy the location.");
      return;
    }

    setCopied(true);
    toast.success("Pinned location copied.");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${modalCard} space-y-3`}>
      <ModalHeader
        title="Location & Pickup"
        icon={<MapPin className="h-4 w-4 text-primary" />}
        onClose={onClose}
      />

      <div className="flex flex-wrap items-center gap-2">
        {distanceKm !== null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            <Navigation className="h-3 w-3" />
            {formatDistance(distanceKm)}
          </span>
        )}

        <span className="rounded-full bg-muted/80 px-3 py-1 text-xs font-semibold">
          {ad.location}
        </span>
      </div>

      <div className="h-52 w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          src={mapEmbedUrl}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleCopy}
          variant="outline"
          className="h-10 rounded-xl text-xs font-semibold"
        >
          {copied ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
          ) : (
            <Copy className="mr-1.5 h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy location"}
        </Button>

        <Button
          asChild
          className="gradient-primary h-10 rounded-xl border-0 text-xs font-semibold"
        >
          <a href={pinUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open in Maps
          </a>
        </Button>
      </div>
    </div>
  );
};

/* =========================================================
   SHARE MODAL  (social platforms or copy to share)
========================================================= */

const ShareModal = ({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyText(url);

    if (!ok) {
      toast.error("Could not copy the link.");
      return;
    }

    setCopied(true);
    toast.success("Link copied.");
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${modalCard} space-y-4`}>
      <ModalHeader
        title="Share this deal"
        icon={<Share2 className="h-4 w-4 text-primary" />}
        onClose={onClose}
      />

      <ShareButtons url={url} title={title} />

      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 p-1.5 pl-3">
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {url}
        </span>

        <Button
          size="sm"
          onClick={handleCopy}
          className="h-8 shrink-0 rounded-xl text-xs font-semibold"
        >
          {copied ? (
            <Check className="mr-1 h-3.5 w-3.5" />
          ) : (
            <Copy className="mr-1 h-3.5 w-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
};

/* =========================================================
   CHAT MODAL  (quick in-app chat between buyer and seller)
========================================================= */

const ChatModal = ({
  ad,
  userId,
  onClose,
  onOpenFull,
}: {
  ad: AdRow;
  userId: string;
  onClose: () => void;
  onOpenFull: (conversationId: string | null) => void;
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  /* Load the existing conversation (if there is one) */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .eq("ad_id", ad.id)
          .eq("buyer_id", userId)
          .maybeSingle();

        if (cancelled || !existing) return;

        setConversationId(existing.id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from(MESSAGES_TABLE)
          .select("*")
          .eq("conversation_id", existing.id)
          .order("created_at", { ascending: true })
          .limit(200);

        if (!cancelled) setMessages((data ?? []) as ChatMessage[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ad.id, userId]);

  /* Live updates */
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`quick-chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: MESSAGES_TABLE,
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;

          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  /* Keep the newest message in view (inside the chat only) */
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages.length, loading]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);

    try {
      let convId = conversationId;

      if (!convId) {
        const { data: convo, error: convoError } = await supabase
          .from("conversations")
          .insert({ ad_id: ad.id, buyer_id: userId, seller_id: ad.user_id })
          .select("id")
          .single();

        if (convoError) throw convoError;

        convId = convo.id;
        setConversationId(convo.id);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(MESSAGES_TABLE)
        .insert({ conversation_id: convId, sender_id: userId, content })
        .select("*")
        .single();

      if (error) throw error;

      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data as ChatMessage]
      );
      setText("");
    } catch {
      toast.error("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-[2rem] rounded-tr-[3rem] border border-border/80 bg-card shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-3">
        <button
          type="button"
          aria-label="Back to listing"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 flex-col items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>

          <span className="mt-0.5 max-w-[160px] truncate text-xs font-bold leading-tight">
            {ad.seller_name}
          </span>

          <span className="text-[10px] leading-tight text-muted-foreground">
            Verified Member
          </span>
        </div>

        <button
          type="button"
          aria-label="Open full chat"
          onClick={() => onOpenFull(conversationId)}
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {loading ? (
          <p className="pt-8 text-center text-xs text-muted-foreground">
            Loading chat...
          </p>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <MessageCircle className="h-8 w-8 text-muted-foreground/40" />

            <p className="text-xs text-muted-foreground">
              Say hello to {ad.seller_name}.
              <br />
              Ask about "{ad.title}".
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === userId;
            const newDay =
              i === 0 ||
              new Date(messages[i - 1].created_at).toDateString() !==
                new Date(m.created_at).toDateString();

            return (
              <div key={m.id}>
                {newDay && (
                  <p className="py-1 text-center text-[10px] text-muted-foreground">
                    {dayLabel(m.created_at)}
                  </p>
                )}

                <div
                  className={`flex items-end gap-1.5 ${
                    mine ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border/70 bg-muted">
                    <User className="h-3 w-3" />
                  </div>

                  <div
                    className={`max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-snug ${
                      mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {m.content}
                    </p>

                    <p
                      className={`mt-1 text-[9px] ${
                        mine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {format(new Date(m.created_at), "hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-border/60 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message..."
          className="h-10 min-w-0 flex-1 rounded-full border border-border/70 bg-muted/40 px-4 text-xs outline-none focus:border-primary/50"
        />

        <Button
          size="icon"
          aria-label="Send message"
          onClick={send}
          disabled={!text.trim() || sending}
          className="gradient-primary h-10 w-10 shrink-0 rounded-full border-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/* =========================================================
   PAGE
========================================================= */

const AdDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedAds();

  const [selectedImage, setSelectedImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [popupIdx, setPopupIdx] = useState(0);
  const [descOpen, setDescOpen] = useState(false);

  // Buyer location state fetched from localStorage
  const [buyerCoords, setBuyerCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const lat = localStorage.getItem("user_lat");
    const lng = localStorage.getItem("user_lng");
    if (lat && lng) {
      setBuyerCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  }, []);

  /* ---------------------------------------------------------
     DATA
  --------------------------------------------------------- */

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

  // Calculate precise distance if both buyer and seller coordinates exist
  const distanceKm = useMemo(() => {
    if (!buyerCoords || ad?.lat == null || ad?.lng == null) return null;
    return calculateDistance(buyerCoords.lat, buyerCoords.lng, ad.lat, ad.lng);
  }, [buyerCoords, ad]);

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

  /* The seller's other listings (the row of small cards) */
  const { data: sellerAds } = useQuery({
    queryKey: ["seller-ads", ad?.user_id, ad?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*, categories(name)")
        .eq("status", "approved")
        .eq("user_id", ad!.user_id)
        .neq("id", ad!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!ad?.user_id,
  });

  /* Store rating (average, count and this person's own rating) */
  const { data: rating } = useQuery({
    queryKey: ["store-rating", ad?.user_id, user?.id ?? null],
    queryFn: async (): Promise<RatingSummary> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from(RATINGS_TABLE)
        .select("rating, rater_id")
        .eq("seller_id", ad!.user_id);

      if (error) throw error;

      const rows = (data ?? []) as { rating: number; rater_id: string }[];
      const count = rows.length;
      const avg = count
        ? rows.reduce((sum, r) => sum + Number(r.rating), 0) / count
        : 0;
      const mine = user
        ? Number(rows.find((r) => r.rater_id === user.id)?.rating ?? 0)
        : 0;

      return { avg, count, mine };
    },
    enabled: !!ad?.user_id,
    retry: 0,
  });

  /* ---------------------------------------------------------
     IMAGE GALLERY + LIGHTBOX
  --------------------------------------------------------- */

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, ad]);

  /* ---------------------------------------------------------
     MODALS: Escape closes, page behind does not scroll
  --------------------------------------------------------- */

  useEffect(() => {
    if (!modal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal]);

  /* ---------------------------------------------------------
     AUTO POPUPS
     One popup at a time, 4 seconds each, no gap between them.
     They pause while a modal or the full-screen viewer is open.
  --------------------------------------------------------- */

  const popupsPaused = modal !== null || previewOpen;

  useEffect(() => {
    if (popupsPaused) return;

    const timer = window.setInterval(() => {
      setPopupIdx((current) => (current + 1) % RAIL.length);
    }, POPUP_MS);

    return () => window.clearInterval(timer);
  }, [popupsPaused]);

  /* ---------------------------------------------------------
     ACTIONS
  --------------------------------------------------------- */

  const openModal = (key: ModalKey) => {
    if (!ad) return;

    if (key === "chat") {
      if (!user) {
        toast.error("Please sign in to message the seller securely.");
        navigate("/auth");
        return;
      }

      if (user.id === ad.user_id) {
        toast.info("This is your own listing.");
        return;
      }
    }

    setModal(key);
  };

  const submitRating = async (value: number) => {
    if (!ad) return false;

    if (!user) {
      toast.error("Please sign in to rate this store.");
      navigate("/auth");
      return false;
    }

    if (user.id === ad.user_id) {
      toast.info("You can't rate your own store.");
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from(RATINGS_TABLE)
      .upsert(
        { seller_id: ad.user_id, rater_id: user.id, rating: value },
        { onConflict: "seller_id,rater_id" }
      );

    if (error) {
      toast.error("Could not save your rating. Please try again.");
      return false;
    }

    await queryClient.invalidateQueries({ queryKey: ["store-rating"] });
    toast.success("Thanks for rating this store!");

    return true;
  };

  /* ---------------------------------------------------------
     LOADING / NOT FOUND
  --------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="container py-8 max-w-6xl px-4 animate-pulse">
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
        <Button asChild className="rounded-full"><Link to="/marketplace">Explore Marketplace</Link></Button>
      </div>
    );
  }

  const seoTitle = `${ad.title} – E${ad.price.toLocaleString()} in ${ad.location} | Market Hub`;
  const seoDesc = (ad.description || "").replace(/\s+/g, " ").trim().slice(0, 160);
  const seoImage = adOg(ad.id);
  const canonical = `${window.location.origin}/ad/${ad.id}`;

  // Build precise Google Maps source URL using lat/lng if available, fallback to text location
  const mapEmbedUrl = ad.lat && ad.lng
    ? `https://maps.google.com/maps?q=${ad.lat},${ad.lng}&t=&z=14&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(ad.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  // The pinned location people can copy / open
  const pinUrl = ad.lat && ad.lng
    ? `https://www.google.com/maps?q=${ad.lat},${ad.lng}`
    : `https://www.google.com/maps?q=${encodeURIComponent(ad.location)}`;

  const shareTitle = `${ad.title} – E${ad.price.toLocaleString()} in ${ad.location}`;

  const longDescription = (ad.description ?? "").length > 220;
  const featured = isFeaturedAd(ad);

  /* ---------------------------------------------------------
     POPUP CONTENT (what each popup says)
  --------------------------------------------------------- */

  const renderPopup = (index: number) => {
    const key = RAIL[index].key;

    if (key === "rate") {
      return (
        <>
          <span className="text-[11px] font-extrabold uppercase leading-tight tracking-wide">
            Rate my
            <br />
            store
          </span>

          {rating && rating.count > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
              <Star className="h-3 w-3 fill-amber-400" />
              {rating.avg.toFixed(1)}
            </span>
          )}
        </>
      );
    }

    if (key === "share") {
      return (
        <span className="flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-black text-white">
            f
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-[9px] font-black text-white">
            IG
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-white">
            WA
          </span>

          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground">
            <Share2 className="h-3 w-3" />
          </span>
        </span>
      );
    }

    if (key === "location") {
      return (
        <span className="flex flex-col items-start gap-0.5">
          <span className="max-w-[120px] truncate rounded bg-emerald-500 px-1.5 py-px text-[10px] font-bold leading-tight text-white">
            {distanceKm !== null ? formatDistance(distanceKm) : ad.location}
          </span>

          <span className="text-[11px] font-extrabold leading-tight">
            Views & Pickup
          </span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 text-[11px] font-extrabold leading-tight">
        <MessageCircle className="h-3.5 w-3.5 text-primary" />
        Inbox me
      </span>
    );
  };

  const popupRight =
    RAIL_EDGE + (RAIL.length - 1 - popupIdx) * (RAIL_SIZE + RAIL_GAP);

  return (
    <div className="container py-4 sm:py-8 max-w-6xl px-3 sm:px-6 pb-28 sm:pb-12">
      <Seo title={seoTitle} description={seoDesc} image={seoImage} url={canonical} type="product" />

      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <Button variant="outline" size="sm" asChild className="rounded-full backdrop-blur-md bg-background/80 hover:bg-muted border-border/80 shadow-sm text-xs sm:text-sm">
          <Link to="/marketplace"><ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Marketplace</Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-4 md:gap-8 items-start">

        {/* =================================================
            LEFT: PRODUCT IMAGE + ICON RAIL + STORE RATING
        ================================================= */}
        <div className="md:col-span-7 space-y-3">

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
                  <span className="absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-bold text-white tracking-wider">
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

            {/* Save (heart) */}
            {user && (
              <button
                type="button"
                aria-label={isSaved(ad.id) ? "Remove from saved" : "Save listing"}
                onClick={() => toggleSave(ad.id)}
                className={`absolute left-3 top-3 z-30 flex items-center justify-center rounded-full border backdrop-blur-md transition-all ${
                  isSaved(ad.id)
                    ? "border-rose-500/40 bg-rose-500/20 text-rose-500"
                    : "border-white/20 bg-black/55 text-white hover:bg-black/75"
                }`}
                style={{ width: RAIL_SIZE, height: RAIL_SIZE }}
              >
                <Heart className={`h-4 w-4 ${isSaved(ad.id) ? "fill-rose-500" : ""}`} />
              </button>
            )}

            {/* ICON RAIL: rate | share | location | chat */}
            <div
              className="absolute z-30 flex"
              style={{ top: RAIL_EDGE, right: RAIL_EDGE, gap: RAIL_GAP }}
            >
              {RAIL.map((item, i) => {
                const Icon = item.icon;
                const active = !popupsPaused && popupIdx === i;
                const rated = item.key === "rate" && (rating?.mine ?? 0) > 0;

                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-label={item.label}
                    onClick={() => openModal(item.key)}
                    className={`flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 ${
                      active
                        ? "scale-110 border-primary bg-primary text-primary-foreground shadow-lg"
                        : "border-white/20 bg-black/55 text-white hover:bg-black/75"
                    }`}
                    style={{ width: RAIL_SIZE, height: RAIL_SIZE }}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        rated ? "fill-amber-400 text-amber-400" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* AUTO POPUP: one at a time, 4 seconds each */}
            <AnimatePresence mode="wait">
              {!popupsPaused && (
                <motion.button
                  key={popupIdx}
                  type="button"
                  aria-label={RAIL[popupIdx].label}
                  onClick={() => openModal(RAIL[popupIdx].key)}
                  initial={{ opacity: 0, y: -8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute z-30 flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-foreground shadow-xl backdrop-blur-md"
                  style={{
                    top: RAIL_EDGE + RAIL_SIZE + 10,
                    right: popupRight,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 h-2.5 w-2.5 rotate-45 border-l border-t border-border bg-background"
                    style={{ right: RAIL_SIZE / 2 - 5 }}
                  />

                  {renderPopup(popupIdx)}
                </motion.button>
              )}
            </AnimatePresence>
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

          {/* STORE RATING ROW */}
          <button
            type="button"
            onClick={() => openModal("rate")}
            className="flex w-full items-center gap-2 border-y border-border/70 px-1 py-2 text-left transition hover:bg-muted/40"
            aria-label="Rate this store"
          >
            <StarRow value={rating?.avg ?? 0} size={18} />

            <span className="text-xs text-muted-foreground">Store rating</span>

            <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
              {rating && rating.count > 0
                ? `${rating.avg.toFixed(1)} (${rating.count})`
                : "No ratings yet"}
            </span>
          </button>
        </div>

        {/* =================================================
            RIGHT: DETAILS CARD + PROTECTED COMMUNICATION
        ================================================= */}
        <div className="md:col-span-5 space-y-4 md:sticky md:top-6">

          {/* DETAILS CARD */}
          <div className="rounded-[2rem] rounded-tr-[3rem] border border-border/80 bg-card/80 p-4 shadow-sm backdrop-blur-md sm:p-5 space-y-4">

            {/* Category + LIVE NOW */}
            <div className="flex items-center gap-2 flex-wrap">
              {ad.categories?.name && (
                <Badge variant="secondary" className="rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider border border-border/50">
                  {ad.categories.name}
                </Badge>
              )}

              {featured && (
                <Badge className="gradient-accent border-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Featured
                </Badge>
              )}

              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Now
              </span>
            </div>

            {/* Title + description */}
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                {ad.title}
              </h1>

              {ad.description && (
                <div>
                  <p
                    className={`whitespace-pre-wrap text-xs font-normal leading-relaxed text-muted-foreground sm:text-sm ${
                      longDescription && !descOpen ? "line-clamp-5" : ""
                    }`}
                  >
                    {ad.description}
                  </p>

                  {longDescription && (
                    <button
                      type="button"
                      onClick={() => setDescOpen((open) => !open)}
                      className="mt-1 text-xs font-semibold text-primary hover:underline"
                    >
                      {descOpen ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
                E{ad.price.toLocaleString()}
              </span>

              <span className="text-xs font-bold text-muted-foreground">SZL</span>
            </div>

            {/* Location + date + verified icon */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{ad.location}</span>
              </span>

              <span className="flex shrink-0 items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(ad.created_at), "MMM d, yyyy")}
              </span>

              <span className="h-px flex-1 bg-border" />

              <UserCheck
                className="h-5 w-5 shrink-0 text-emerald-500"
                aria-label="Verified seller"
              />
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold leading-tight">
                  {ad.seller_name}
                </h4>

                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Verified Member
                </p>
              </div>
            </div>

            {/* Seller's other listings */}
            {sellerAds && sellerAds.length > 0 && (
              <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
                {sellerAds.map((item: AdRow) => (
                  <Link
                    key={item.id}
                    to={`/ad/${item.id}`}
                    className="group block w-[132px] shrink-0 snap-start overflow-hidden rounded-tl-3xl rounded-tr-lg rounded-b-lg border border-border/80 bg-card transition hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-black/90">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5 p-2">
                      <div className="flex flex-wrap items-center gap-1">
                        {isFeaturedAd(item) && (
                          <span className="rounded-full bg-amber-300 px-1.5 py-px text-[7px] font-black uppercase tracking-wider text-black">
                            Featured
                          </span>
                        )}

                        {item.categories?.name && (
                          <span className="truncate rounded-full bg-muted px-1.5 py-px text-[7px] font-extrabold uppercase tracking-wider">
                            {item.categories.name}
                          </span>
                        )}
                      </div>

                      <p className="line-clamp-1 text-[10px] font-bold">
                        {item.title}
                      </p>

                      <p className="truncate text-[9px] text-muted-foreground">
                        {item.location}
                      </p>

                      <p className="text-[11px] font-black text-primary">
                        E{item.price.toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* View My Store */}
            <Link
              to={storePath(ad.user_id)}
              className="inline-flex items-center gap-1.5 text-xs font-bold hover:text-primary"
            >
              <Store className="h-4 w-4" />
              View My Store
            </Link>
          </div>

          {/* PROTECTED COMMUNICATION */}
          <div className="space-y-1.5 rounded-[2rem] rounded-bl-[3rem] border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <Lock className="h-4 w-4 shrink-0" /> Protected Communication
            </div>

            <p className="text-[11px] leading-snug text-muted-foreground">
              To prevent scams, phishing, and unwanted calls, all communications are safely handled within Market Hub chat. Never share sensitive bank details or passwords.
            </p>
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

      {/* =====================================================
          MODALS (the person never leaves the page)
      ===================================================== */}

      <Modal open={modal === "rate"} onClose={() => setModal(null)} label="Rate this store">
        <RateModal
          sellerName={ad.seller_name}
          summary={rating}
          onSubmit={submitRating}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal === "location"} onClose={() => setModal(null)} label="Location and pickup">
        <LocationModal
          ad={ad}
          distanceKm={distanceKm}
          mapEmbedUrl={mapEmbedUrl}
          pinUrl={pinUrl}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal === "share"} onClose={() => setModal(null)} label="Share this listing">
        <ShareModal
          url={canonical}
          title={shareTitle}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal open={modal === "chat"} onClose={() => setModal(null)} label="Chat with the seller">
        {user && (
          <ChatModal
            ad={ad}
            userId={user.id}
            onClose={() => setModal(null)}
            onOpenFull={(conversationId) => {
              setModal(null);
              navigate(
                conversationId
                  ? `/messages?conversation=${conversationId}`
                  : "/messages"
              );
            }}
          />
        )}
      </Modal>

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