import {
  ShieldCheck,
  Users,
  BadgeDollarSign,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function Benefits() {
  return (
    <Section>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Why Use The Market Hub?
        </h2>

        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          We make buying and selling simple, secure and accessible for
          everyone across Eswatini.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <FeatureCard
          icon={ShieldCheck}
          title="Trusted Marketplace"
          description="Every listing is reviewed before publication to maintain quality and reduce fraudulent advertisements."
        />

        <FeatureCard
          icon={Users}
          title="Reach Thousands"
          description="Connect with buyers and sellers from every region of Eswatini on one growing platform."
        />

        <FeatureCard
          icon={BadgeDollarSign}
          title="Affordable Advertising"
          description="Promote your products or services without the high costs of traditional advertising."
        />

      </div>
    </Section>
  );
}