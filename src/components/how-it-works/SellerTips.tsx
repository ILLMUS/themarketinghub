import {
  Camera,
  BadgeDollarSign,
  FileText,
  Sparkles,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function SellerTips() {
  return (
    <Section>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Seller Tips
        </h2>

        <p className="mt-3 text-muted-foreground">
          Simple improvements that help your listing attract more buyers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <FeatureCard
          icon={Camera}
          title="Use Clear Photos"
          description="Upload multiple high-quality photos from different angles to build buyer confidence."
        />

        <FeatureCard
          icon={FileText}
          title="Write Great Descriptions"
          description="Include specifications, condition, dimensions and anything buyers need to know."
        />

        <FeatureCard
          icon={BadgeDollarSign}
          title="Price Fairly"
          description="Competitive pricing attracts more enquiries and increases your chances of selling faster."
        />

        <FeatureCard
          icon={Sparkles}
          title="Keep Listings Updated"
          description="Refresh your adverts regularly and remove items that have already been sold."
        />

      </div>

    </Section>
  );
}