import {
  FileText,
  CheckCircle,
  Eye,
  DollarSign,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function SellerJourney() {
  return (
    <Section>

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Seller Journey
        </h2>

        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Selling on The Market Hub takes only a few simple steps.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <FeatureCard
          icon={FileText}
          title="Create Your Ad"
          description="Add photos, write a description and set your asking price."
        />

        <FeatureCard
          icon={CheckCircle}
          title="Approval"
          description="Our team reviews every listing to keep the marketplace safe and trustworthy."
        />

        <FeatureCard
          icon={Eye}
          title="Get Discovered"
          description="Thousands of buyers can now browse and discover your listing."
        />

        <FeatureCard
          icon={DollarSign}
          title="Make The Sale"
          description="Receive enquiries directly and complete your transaction with confidence."
        />

      </div>

    </Section>
  );
}