// src/pages/SellingGuidePage.tsx
import SEO from "@/components/seo/SEO";

export default function SellingGuidePage() {
  return (
    <div className="container max-w-3xl py-12 space-y-6">
      <h1 className="text-3xl font-bold">Selling Guide</h1>
      <p className="text-muted-foreground">Maximize your sales and attract serious buyers quickly.</p>
      <ul className="list-disc list-inside space-y-3 text-muted-foreground">
        <li><strong>Take Clear Photos:</strong> Shoot clear, well-lit pictures from multiple angles. High-quality images sell items faster.</li>
        <li><strong>Write Detailed Descriptions:</strong> Be honest about item condition, specs, and reasons for selling.</li>
        <li><strong>Upgrade Your Plan:</strong> Choose a <em>Spotlight</em> or <em>Boosted</em> tier to pin your ad to high-traffic homepage sections.</li>
      </ul>
    </div>
  );
}