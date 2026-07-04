import {
  Store,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function IllustrationCards() {
  return (
    <Section className="bg-secondary/40">

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Everything Happens In One Place
        </h2>

        <p className="mt-3 text-muted-foreground">
          From listing your products to finding your next purchase.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">

        <FeatureCard
          icon={Store}
          title="Post Your Listing"
          description="Create beautiful listings complete with images, prices and detailed descriptions."
        />

        <FeatureCard
          icon={ShoppingBag}
          title="Discover Products"
          description="Browse thousands of listings across vehicles, property, electronics, services and more."
        />

        <FeatureCard
          icon={MessageCircle}
          title="Contact Sellers"
          description="Reach sellers instantly through WhatsApp, phone or email to complete your purchase."
        />

      </div>

    </Section>
  );
}