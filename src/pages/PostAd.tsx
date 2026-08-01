import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, CheckCircle, Loader2, Zap, Crown, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import {
  analyzePhoto,
  PhotoAnalysis,
} from "../utils/photoAnalyzer";

import { PhotoScoreCard } from "../components/PhotoScoreCard";
import SEO from "@/components/seo/SEO";

// Coordinates mapping for Eswatini regional hubs
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "Mbabane": { lat: -26.3167, lng: 31.1333 },
  "Manzini": { lat: -26.4833, lng: 31.3667 },
  "Siteki": { lat: -26.4561, lng: 31.9511 },
  "Big Bend": { lat: -26.8167, lng: 31.9333 },
  "Nhlangano": { lat: -27.1167, lng: 31.2000 },
  "Matsapha": { lat: -26.5000, lng: 31.3167 },
  "Piggs Peak": { lat: -25.9653, lng: 31.2536 }
};

const LOCATIONS = Object.keys(LOCATION_COORDS);

type Tier = "free" | "e50" | "e100" | "e500";
const TIERS: { 
  id: Tier; 
  price: number; 
  name: string; 
  subtitle: string;
  description: string;
  durationDays: number;
  perks: string[]; 
  highlight?: boolean;
  buttonText: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "free",
    price: 0,
    name: "Standard Listing",
    subtitle: "Forever Free",
    description: "The traditional way to get seen.",
    durationDays: 15,
    perks: [
      "Standard marketplace visibility",
      "Up to 5 high-resolution photos",
      "Direct buyer-to-seller chat messaging",
      "Share your listing across our social media channels",
      "Active for 15 days"
    ],
    buttonText: "List For Free",
    icon: <ShieldCheck className="h-5 w-5 text-muted-foreground" />,
  },
  {
    id: "e50",
    price: 50,
    name: "Featured",
    subtitle: "One-Time Boost",
    description: "Outshine the crowd and move your item faster.",
    durationDays: 30,
    perks: [
      "3× More Visibility with higher search placement",
      "Featured badge on your listing",
      "Up to 5 high-resolution photos",
      "Share your listing across our social media channels",
      "Active for 30 days"
    ],
    buttonText: "Supercharge My Ad (E50)",
    icon: <Zap className="h-5 w-5 text-primary" />,
  },
  {
    id: "e100",
    price: 100,
    name: "Premium",
    subtitle: "Maximum Impact",
    description: "Built for serious sellers who want maximum exposure.",
    durationDays: 45,
    perks: [
      "Guaranteed Top-of-Feed Placement",
      "Up to 5 high-resolution photos",
      "Premium badge on your listing",
      "1 day post social media promotion boost",
      "Share your listing across our social media channels",
      "Active for 45 days"
    ],
    buttonText: "Go Premium (E100)",
    icon: <Crown className="h-5 w-5 text-primary" />,
  },
  {
    id: "e500",
    price: 500,
    name: "Homepage Spotlight Banner",
    subtitle: "7-Day Facebook Campaign",
    description: "Own the homepage. Dominate the marketplace.",
    durationDays: 7,
    perks: [
      "Premium homepage banner placement",
      "Direct click-through to your listing or website",
      "Professionally designed promotional banner",
      "Image enhancement and optimization", 
      "Featured across the entire website",
      "7-day Facebook promotional campaign",
      "Maximum visibility for high-value products and services",
      "Share your listing across our social media channels",
      "Active for 60 days"
    ],
    highlight: true,
    buttonText: "Claim The Spotlight (E500)",
    icon: <Rocket className="h-5 w-5 text-accent-foreground" />,
  },
];

// Helper to safely map frontend tiers to allowed database enums ('e250' | 'e350' | 'e500')
const mapTierToDatabaseEnum = (frontendTier: Tier): "e250" | "e350" | "e500" => {
  switch (frontendTier) {
    case "free":
    case "e50":
      return "e250";
    case "e100":
      return "e350";
    case "e500":
      return "e500";
    default:
      return "e250";
  }
};

const PostAdPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTier, setSubmittedTier] = useState<Tier>("free");
  const [tierSelected, setTierSelected] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysis[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category_id: "",
    price: "",
    description: "",
    seller_name: "",
    phone: "",
    email: user?.email || "",
    location: "",
    tier: "free" as Tier,
  });
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in to post an advertisement</h2>
        <Button onClick={() => navigate("/login")} className="gradient-primary border-0">Sign In</Button>
      </div>
    );
  }

  if (!tierSelected) {
    return (
      <div className="container max-w-7xl py-12 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            Flexible Plans
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4 mb-4">
            Choose Your Listing Plan
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Pick a plan to get started — you'll fill in your ad details next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {TIERS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => {
                setForm((f) => ({ ...f, tier: t.id }));
                setTierSelected(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-left rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group relative bg-card ${
                t.highlight 
                  ? "border-primary/80 ring-2 ring-primary/20 shadow-lg bg-gradient-to-b from-primary/[0.03] to-transparent" 
                  : "border-border/80 hover:border-primary/50"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-muted/60 group-hover:bg-primary/10 transition-colors">
                    {t.icon}
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    {t.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-bold tracking-tight mb-1">{t.name}</h3>
                <p className="text-xs text-muted-foreground min-h-[2rem] mb-6">{t.description}</p>

                <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-border/60">
                  <span className="text-4xl md:text-5xl font-black tracking-tight">E{t.price}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/70">Includes</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {t.perks.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={`w-full rounded-xl py-3 px-4 text-center font-semibold text-sm transition-all shadow-sm ${
                t.highlight 
                  ? "gradient-primary text-white shadow-primary/25" 
                  : "bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground"
              }`}>
                {t.buttonText}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (images.length + selectedFiles.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setOptimizing(true);

    try {
      const compressedFiles: File[] = [];
      const newPreviews: string[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        const compressed = await imageCompression(file, {
          maxSizeMB: 0.7,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
          onProgress: (progress) => {
            setOptimizationProgress(progress);
          },
        });

        compressedFiles.push(compressed);
        const analysis = await analyzePhoto(compressed);
        setPhotoAnalysis((prev) => [...prev, analysis]);
        newPreviews.push(URL.createObjectURL(compressed));

        const saved = (((file.size - compressed.size) / file.size) * 100).toFixed(0);
        toast.success(`${file.name} — Saved ${saved}%`);
      }

      setImages((prev) => [...prev, ...compressedFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to optimize image");
    } finally {
      setOptimizing(false);
      setOptimizationProgress(0);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setPhotoAnalysis((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category_id || !form.price || !form.description || !form.seller_name || !form.phone || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("ad-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }

      // If user selected the E500 tier, route to banners table for manual admin review
      if (form.tier === "e500") {
        const { error: bannerError } = await supabase.from("banners").insert({
          title: form.title,
          image_url: imageUrls[0] || "",
          target_url: "#",
          position: "home_top",
          is_active: false, // Requires manual admin publication after payment approval
        });

        if (bannerError) throw bannerError;
        setSubmittedTier(form.tier);
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      // Calculate expiration date automatically based on the selected tier's duration
      const selectedTierObj = TIERS.find((t) => t.id === form.tier)!;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + selectedTierObj.durationDays);

      // For Free, E50, and E100 tiers, map database fields safely
      const coords = LOCATION_COORDS[form.location] || { lat: -26.3167, lng: 31.1333 };
      const dbTier = mapTierToDatabaseEnum(form.tier);

      const adStatus = "pending_payment";

      const { error } = await supabase.from("advertisements").insert({
        user_id: user.id,
        title: form.title,
        category_id: form.category_id,
        price: parseFloat(form.price),
        description: form.description,
        seller_name: form.seller_name,
        phone: form.phone,
        email: form.email,
        location: form.location,
        lat: coords.lat,
        lng: coords.lng,
        images: imageUrls,
        status: adStatus,
        tier: dbTier,
        expires_at: expiresAt.toISOString(), // Automatically tracks expiration for frontend/backend visibility filtering
      });

      if (error) throw error;
      setSubmittedTier(form.tier);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit advertisement");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const tierInfo = TIERS.find((t) => t.id === submittedTier)!;
    return (
      <div className="container max-w-lg py-20 text-center animate-fade-in">
        <div className="rounded-full bg-success/10 p-4 w-fit mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Advertisement Submitted!</h2>
        <div className="bg-card border rounded-lg p-6 text-left space-y-4">
          <p className="text-muted-foreground">
            {submittedTier === "free"
              ? "Your free advertisement has been submitted successfully and is awaiting review."
              : submittedTier === "e500"
              ? "Your E500 spotlight banner request has been received and is awaiting payment confirmation. Once approved, the admin will manually post it to the banners section."
              : "Your advertisement request has been received and is awaiting payment confirmation."}
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Plan</p>
            <p className="text-2xl font-bold text-primary">E{tierInfo.price} — {tierInfo.name}</p>
          </div>
          {submittedTier !== "free" && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="font-semibold mb-2">To activate your listing:</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Pay <strong>E{tierInfo.price}</strong> for your {tierInfo.name} listing</li>
                <li>Send proof of payment via:</li>
              </ol>
              <div className="mt-3 space-y-1 text-sm">
                <p><strong>WhatsApp:</strong> 76373859</p>
                <p><strong>Email:</strong> themarkethub51@gmail.com</p>
              </div>
            </div>
          )}
        </div>
        <Button className="mt-6 gradient-primary border-0" onClick={() => navigate("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">Post an Advertisement</h1>
        <Button variant="ghost" size="sm" onClick={() => setTierSelected(false)}>← Change plan</Button>
      </div>
      <p className="text-muted-foreground mb-6">
        Selected plan: <strong className="text-primary">E{TIERS.find(t => t.id === form.tier)!.price} — {TIERS.find(t => t.id === form.tier)!.name}</strong>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" placeholder="e.g. Samsung Galaxy S24 Ultra" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (SZL) *</Label>
            <Input id="price" type="number" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea id="description" placeholder="Describe your product or service..." rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seller_name">Seller/Business Name *</Label>
            <Input id="seller_name" placeholder="Your name or business" value={form.seller_name} onChange={(e) => setForm({ ...form, seller_name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Location *</Label>
            <Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}>
              <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" placeholder="+268 7637 3859" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>

        {/* Images Upload Section */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Upload Photos</Label>

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const files = Array.from(e.dataTransfer.files);
              if (images.length + files.length > 5) {
                toast.error("Maximum 5 images allowed");
                return;
              }
              setImages((prev) => [...prev, ...files]);
              files.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setPreviews((prev) => [...prev, ev.target?.result as string]);
                };
                reader.readAsDataURL(file);
              });
            }}
            className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all duration-300 ${
              dragActive ? "border-primary bg-primary/20 scale-[1.02]" : "border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10"
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center">
              {optimizing ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-bold">Optimizing Images...</h3>
                  <div className="w-full max-w-xs mt-5">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${optimizationProgress}%` }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-5 rounded-full bg-primary/10 p-5 group-hover:scale-110 transition-all">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">Drag & Drop Photos Here</h3>
                  <p className="mt-2 text-sm text-muted-foreground">or click to browse your device</p>
                  <span className="mt-4 rounded-full bg-primary px-3 py-1 text-xs text-white">
                    {images.length}/5 Photos
                  </span>
                </>
              )}
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="group relative overflow-hidden rounded-xl border shadow-sm">
                  <img src={src} alt="" className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {photoAnalysis[i] && (
                    <div className="absolute bottom-2 left-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${photoAnalysis[i].color}`}>
                        {photoAnalysis[i].label}
                      </span>
                    </div>
                  )}
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-white">
                      Cover
                    </span>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full gradient-primary border-0">
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Advertisement"}
        </Button>
      </form>
    </div>
  );
};

export default PostAdPage;