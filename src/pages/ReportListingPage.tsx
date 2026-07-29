// src/pages/ReportListingPage.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/seo/SEO";

export default function ReportListingPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ title: "", link: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.reason) {
      toast.error("Please fill in required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reported_listings").insert({
        user_id: user?.id || null,
        listing_title: form.title,
        listing_link: form.link,
        reason: form.reason,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Report submitted successfully. Our admin team will investigate.");
      setForm({ title: "", link: "", reason: "" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container max-w-xl py-12">
      <h1 className="text-3xl font-bold mb-2">Report a Listing</h1>
      <p className="text-muted-foreground mb-6">Help keep The Market Hub safe by reporting fraudulent or prohibited items.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Listing Title *</Label>
          <Input placeholder="e.g. iPhone 13 Pro" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <Label>Ad ID or Link</Label>
          <Input placeholder="Paste URL if available" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
        </div>
        <div>
          <Label>Reason for Reporting *</Label>
          <Textarea placeholder="Describe why this listing violates policy or appears scam-like..." rows={4} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
        <Button type="submit" disabled={submitting} className="w-full gradient-primary border-0">
          {submitting ? "Submitting Report..." : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}