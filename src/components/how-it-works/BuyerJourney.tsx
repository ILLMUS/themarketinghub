import {
  Search,
  Eye,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import Section from "./Section";
import FeatureCard from "./FeatureCard";

export default function BuyerJourney() {
  return (
    <Section className="bg-secondary/40">

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Buyer Journey
        </h2>

        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Finding what you need on The Market Hub is quick, simple and completely free.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <FeatureCard
          icon={Search}
          title="Browse Listings"
          description="Search thousands of products and services across Eswatini using categories, locations and keywords."
        />

        <FeatureCard
          icon={Eye}
          title="View Details"
          description="Open listings to explore photos, pricing, descriptions and seller information."
        />

        <FeatureCard
          icon={MessageCircle}
          title="Contact Seller"
          description="Reach sellers directly through WhatsApp, phone call or email to ask questions or negotiate."
        />

        <FeatureCard
          icon={ShoppingBag}
          title="Complete Your Purchase"
          description="Meet with the seller, inspect the item and safely complete your transaction."
        />

      </div>

    </Section>
  );
}