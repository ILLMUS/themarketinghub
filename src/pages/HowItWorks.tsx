import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  FileText,
  DollarSign,
  Search,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: FileText,
      title: "Create Your Listing",
      description:
        "Fill in your product or service details, upload quality photos and publish your advertisement in just a few minutes.",
    },
    {
      icon: CheckCircle,
      title: "Advertisement Review",
      description:
        "Our team reviews every listing to ensure quality, safety and a trusted marketplace for everyone.",
    },
    {
      icon: DollarSign,
      title: "Receive Buyers",
      description:
        "Interested buyers contact you directly through WhatsApp or phone and you complete the sale.",
    },
  ];

  const benefits = [
    {
      icon: Search,
      title: "Reach Thousands",
      description:
        "Your advertisements become visible to customers across Eswatini.",
    },
    {
      icon: ShieldCheck,
      title: "Safe Marketplace",
      description:
        "Every advertisement is reviewed before becoming publicly visible.",
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description:
        "Buyers contact you directly through WhatsApp, phone or email.",
    },
  ];

  return (
    <main>

      {/* Hero */}

      <section className="border-b bg-gradient-to-b from-background to-secondary/30">
        <div className="container py-20">

          <div className="mx-auto max-w-3xl text-center">

            <h1 className="text-4xl md:text-5xl font-extrabold">
              How The Market Hub Works
            </h1>

            <p className="mt-6 text-lg text-muted-foreground">
              Buying and selling in Eswatini has never been easier.
              Whether you're an individual or a business, The Market Hub
              helps you advertise your products and connect with genuine buyers.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <Button
                className="gradient-primary border-0"
                onClick={() => navigate("/post-ad")}
              >
                Start Selling
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/marketplace")}
              >
                Browse Marketplace
              </Button>

            </div>

          </div>

        </div>
      </section>

      {/* Steps */}

      <section className="container py-20">

        <div className="text-center">

          <h2 className="text-3xl font-bold">
            Sell in Three Simple Steps
          </h2>

          <p className="mt-3 text-muted-foreground">
            From posting your advertisement to completing your sale.
          </p>

        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="
                  relative
                  group
                  rounded-2xl
                  border
                  bg-card
                  p-8
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-primary/40
                  hover:shadow-xl
                "
              >

                <div
                  className="
                    mb-6
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary/10
                    transition-all
                    duration-300
                    group-hover:scale-110
                    group-hover:rotate-6
                  "
                >
                  <Icon className="h-8 w-8 text-primary" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Step {index + 1}
                </span>

                <h3 className="mt-2 text-xl font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-12 hidden h-6 w-6 text-primary/40 lg:block" />
                )}

              </div>
            );
          })}

        </div>

      </section>

      {/* Benefits */}

      <section className="bg-secondary/40">

        <div className="container py-20">

          <div className="text-center">

            <h2 className="text-3xl font-bold">
              Why Sell With The Market Hub?
            </h2>

            <p className="mt-3 text-muted-foreground">
              Built specifically for businesses and individuals across Eswatini.
            </p>

          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">

            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    group
                    rounded-2xl
                    bg-card
                    p-8
                    text-center
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                  "
                >

                  <div
                    className="
                      mx-auto
                      mb-5
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-primary/10
                      transition-all
                      duration-300
                      group-hover:scale-110
                      group-hover:rotate-6
                    "
                  >
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-lg font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* CTA */}

      <section className="container py-20">

        <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">

          <h2 className="text-3xl font-bold">
            Ready to Start Selling?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join Eswatini's growing online marketplace today.
            Post your advertisement in minutes and start connecting
            with buyers across the country.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Button
              className="gradient-primary border-0"
              onClick={() => navigate("/post-ad")}
            >
              Post Your Advertisement
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/marketplace")}
            >
              Browse Listings
            </Button>

          </div>

        </div>

      </section>

    </main>
  );
}