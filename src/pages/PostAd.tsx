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
import { Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import SEO from "@/components/seo/SEO";

const LOCATIONS = ["Mbabane", "Manzini", "Siteki", "Big Bend", "Nhlangano", "Matsapha", "Piggs Peak"];

type Tier = "e500" | "e350" | "e250";
const TIERS: { id: Tier; price: number; name: string; perks: string[]; highlight?: boolean }[] = [
  {
    id: "e500",
    price: 500,
    name: "Spotlight",
    perks: ["Featured in the homepage hero", "Premium placement below the hero", "Maximum visibility"],
    highlight: true,
  },
  {
    id: "e350",
    price: 350,
    name: "Boosted",
    perks: ["Featured strip on the homepage", "Shown above 'How It Works'", "Higher visibility than standard"],
  },
  {
    id: "e250",
    price: 250,
    name: "Standard",
    perks: ["Listed in the Latest Listings section", "Shown across the marketplace", "30-day listing"],
  },
];

const PostAdPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTier, setSubmittedTier] = useState<Tier>("e250");
  const [tierSelected, setTierSelected] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    category_id: "",
    price: "",
    description: "",
    seller_name: "",
    phone: "",
    email: user?.email || "",
    location: "",
    tier: "e250" as Tier,
  });

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
      <div className="container max-w-5xl py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Choose Your Listing Plan</h1>
          <p className="text-muted-foreground">Pick a plan to get started — you'll fill in your ad details next.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((t) => (
            <button
              type="button"
              key={t.id}
              onClick={() => {
                setForm((f) => ({ ...f, tier: t.id }));
                setTierSelected(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`text-left rounded-xl border-2 p-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                t.highlight ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">{t.name}</span>
                {t.highlight && (
                  <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded">BEST VALUE</span>
                )}
              </div>
              <div className="text-4xl font-extrabold mt-2">E{t.price}</div>
              <p className="text-xs text-muted-foreground mt-1">One-time · 30-day listing</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /><span>{p}</span></li>
                ))}
              </ul>
              <div className="mt-6 inline-flex items-center justify-center w-full rounded-md bg-primary text-primary-foreground h-10 font-medium">
                Select {t.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category_id || !form.price || !form.description || !form.seller_name || !form.phone || !form.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      // Upload images
      const imageUrls: string[] = [];
      for (const file of images) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("ad-images").upload(path, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from("ad-images").getPublicUrl(path);
        imageUrls.push(publicUrl);
      }

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
        images: imageUrls,
        status: "pending_payment",
        tier: form.tier,
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
            Your advertisement request has been received and is awaiting payment confirmation.
          </p>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Selected Plan</p>
            <p className="text-2xl font-bold text-primary">E{tierInfo.price} — {tierInfo.name}</p>
          </div>
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
          <p className="text-sm text-muted-foreground">
            Once payment is verified, your advertisement will be approved and published on the platform.
          </p>
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

        {/* Images */}
        <div className="space-y-2">
          <Label>Images (up to 5)</Label>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-destructive rounded-full p-0.5">
                  <X className="h-3 w-3 text-destructive-foreground" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-xs mt-1">Upload</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
        </div>

        <Button type="submit" size="lg" disabled={submitting} className="w-full gradient-primary border-0">
          {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : "Submit Advertisement"}
        </Button>
      </form>
    </div>
  );
};

export default PostAdPage;
