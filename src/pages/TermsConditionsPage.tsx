// src/pages/TermsConditionsPage.tsx
import SEO from "@/components/seo/SEO";

export default function TermsConditionsPage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      <p className="text-xs text-muted-foreground">Last updated: July 29, 2026</p>

      <section className="space-y-3 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">1. Account Responsibilities</h2>
        <p>Users must be 18 or older and maintain secure credentials.</p>

        <h2 className="text-xl font-semibold text-foreground">2. Listings & Payments</h2>
        <p>Paid tiers (Spotlight E500, Boosted E350, Standard E250) are non-refundable once approved and published for 30 days.</p>

        <h2 className="text-xl font-semibold text-foreground">3. Disclaimer</h2>
        <p>The Market Hub acts as a classifieds conduit and is not a direct party to transactions between users.</p>
      </section>
    </div>
  );
}