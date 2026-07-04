import {
  ShieldCheck,
  BadgeCheck,
  MessageCircle,
  Wallet,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function BuyerTips() {
  return (
    <Section className="bg-secondary/40">

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Buyer Tips
        </h2>

        <p className="mt-3 text-muted-foreground">
          Stay safe and make informed purchases every time.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <FeatureCard
          icon={ShieldCheck}
          title="Inspect Before Buying"
          description="Whenever possible, meet the seller and inspect the item before making payment."
        />

        <FeatureCard
          icon={BadgeCheck}
          title="Compare Listings"
          description="Review multiple adverts to compare pricing, condition and value before deciding."
        />

        <FeatureCard
          icon={MessageCircle}
          title="Ask Questions"
          description="Don't hesitate to contact the seller for additional photos or product information."
        />

        <FeatureCard
          icon={Wallet}
          title="Pay Securely"
          description="Only complete payment once you're satisfied with the item and comfortable with the transaction."
        />

      </div>

    </Section>
  );
}