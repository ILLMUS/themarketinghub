import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  DollarSign,
  FileText,
  MessageCircle,
  Search,
  ShieldCheck,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HowItWorks() {
  const navigate = useNavigate();
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",

  mainEntity: [
    {
      "@type": "Question",
      name: "Is it free to post an advertisement?",

      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Individuals can post advertisements for free.",
      },
    },

    {
      "@type": "Question",
      name: "How do buyers contact me?",

      acceptedAnswer: {
        "@type": "Answer",
        text: "Buyers contact sellers directly using WhatsApp or phone.",
      },
    },

    {
      "@type": "Question",
      name: "Are advertisements reviewed?",

      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every advertisement is reviewed before publication.",
      },
    },

    {
      "@type": "Question",
      name: "Can businesses advertise?",

      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Businesses can advertise products and services across Eswatini.",
      },
    },
  ],
};
  /* ------------------------------------------------------------------ */
  /* DATA */
  /* ------------------------------------------------------------------ */

  const sellerSteps = [
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
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",

  name: "How to Buy and Sell on The Market Hub",

  description:
    "Learn how to advertise your products and services and connect with buyers across Eswatini using The Market Hub.",

  image: "https://themarkethubsz.com/og-image.jpg",

  totalTime: "PT5M",

  step: [
    {
      "@type": "HowToStep",
      name: "Create Your Advertisement",
      text: "Create a listing by adding photos, a description, price and contact details.",
    },
    {
      "@type": "HowToStep",
      name: "Advertisement Review",
      text: "Our team reviews every advertisement before it is published.",
    },
    {
      "@type": "HowToStep",
      name: "Receive Buyer Enquiries",
      text: "Interested buyers contact you directly through WhatsApp or phone.",
    },
    {
      "@type": "HowToStep",
      name: "Complete the Sale",
      text: "Arrange payment and delivery directly with the buyer.",
    },
  ],
};
  return (
    
    <main>

      {/* ------------------------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------------------------ */}

      <section className="border-b bg-gradient-to-b from-background to-secondary/30">
        <div className="container py-20">
          <div className="mx-auto max-w-3xl text-center">

            <h1 className="text-4xl md:text-5xl font-extrabold">
              How The Market Hub Works
            </h1>

            <p className="mt-6 text-lg text-muted-foreground">
              Buying and selling in Eswatini has never been easier.
              Whether you're an individual or a business,
              The Market Hub helps you advertise your products
              and connect with genuine buyers.
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

      {/* ------------------------------------------------------------------ */}
{/* ILLUSTRATION CARDS */}
{/* ------------------------------------------------------------------ */}

<section className="container py-20">

  <div className="text-center mb-12">

    <h2 className="text-3xl font-bold">
      Everything You Need In One Marketplace
    </h2>

    <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
      Whether you're buying your next vehicle, advertising your business,
      or searching for property, The Market Hub connects buyers and sellers
      across Eswatini.
    </p>

  </div>

  <div className="grid gap-8 md:grid-cols-3">

    {/* Card 1 */}

    <div
      className="
        group
        rounded-3xl
        border
        bg-card
        p-8
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-primary/40
        hover:shadow-xl
      "
    >

      <div className="mb-6 text-5xl">
        📦
      </div>

      <h3 className="text-xl font-bold">
        Sell Almost Anything
      </h3>

      <p className="mt-3 text-sm text-muted-foreground leading-6">
        Vehicles, property, electronics, furniture, jobs, services,
        fashion and much more.
      </p>

    </div>

    {/* Card 2 */}

    <div
      className="
        group
        rounded-3xl
        border
        bg-card
        p-8
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-primary/40
        hover:shadow-xl
      "
    >

      <div className="mb-6 text-5xl">
        📍
      </div>

      <h3 className="text-xl font-bold">
        Reach Buyers Nationwide
      </h3>

      <p className="mt-3 text-sm text-muted-foreground leading-6">
        Advertise to customers across Mbabane, Manzini,
        Siteki, Big Bend, Nhlangano,
        Piggs Peak and the rest of Eswatini.
      </p>

    </div>

    {/* Card 3 */}

    <div
      className="
        group
        rounded-3xl
        border
        bg-card
        p-8
        transition-all
        duration-300
        hover:-translate-y-2
        hover:border-primary/40
        hover:shadow-xl
      "
    >

      <div className="mb-6 text-5xl">
        🛡️
      </div>

      <h3 className="text-xl font-bold">
        Buy & Sell With Confidence
      </h3>

      <p className="mt-3 text-sm text-muted-foreground leading-6">
        Every advertisement is reviewed before publication,
        helping create a trusted marketplace for everyone.
      </p>

    </div>

  </div>

</section>

      {/* Coming next */}

      {/* ------------------------------------------------------------------ */}
      {/* SELLER JOURNEY */}
      {/* ------------------------------------------------------------------ */}

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

          {sellerSteps.map((step, index) => {
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

                {index !== sellerSteps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-12 hidden lg:block h-6 w-6 text-primary/40" />
                )}

              </div>
            );
          })}

        </div>

      </section>

      {/* ------------------------------------------------------------------ */}
      {/* BUYER JOURNEY */}
      {/* ------------------------------------------------------------------ */}

      {/* Coming next */}

      {/* ------------------------------------------------------------------ */}
      {/* BENEFITS */}
      {/* ------------------------------------------------------------------ */}

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

      {/* ------------------------------------------------------------------ */}
      {/* SELLER TIPS */}
      {/* ------------------------------------------------------------------ */}

      {/* Coming next */}

      {/* ------------------------------------------------------------------ */}
      {/* BUYER TIPS */}
      {/* ------------------------------------------------------------------ */}

 {/* ------------------------------------------------------------------ */}
{/* FAQ */}
{/* ------------------------------------------------------------------ */}

<section className="bg-secondary/40">
  <div className="container py-20">

    <div className="mx-auto max-w-4xl">

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Frequently Asked Questions
        </h2>

        <p className="mt-3 text-muted-foreground">
          Everything you need to know before buying or selling on The Market Hub.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full rounded-2xl border bg-card px-6"
      >

        <AccordionItem value="item-1">
          <AccordionTrigger>
            Is it free to post an advertisement?
          </AccordionTrigger>

          <AccordionContent>
            Yes. Individuals can post advertisements for free. Premium
            advertising options may be introduced in the future for businesses
            and featured listings.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger>
            How do buyers contact me?
          </AccordionTrigger>

          <AccordionContent>
            Buyers contact you directly using the phone number or WhatsApp
            number you provide when creating your advertisement.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger>
            Are advertisements reviewed before they appear?
          </AccordionTrigger>

          <AccordionContent>
            Yes. Every listing is reviewed before being published to help keep
            The Market Hub safe, professional and trustworthy.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger>
            How long does my advertisement stay online?
          </AccordionTrigger>

          <AccordionContent>
            Listings remain active until their expiry date. You can always post
            a new advertisement or renew an existing one once it expires.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger>
            Can businesses advertise on The Market Hub?
          </AccordionTrigger>

          <AccordionContent>
            Absolutely. Businesses can advertise products and services,
            helping them reach customers throughout Eswatini.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-6">
          <AccordionTrigger>
            Is The Market Hub available throughout Eswatini?
          </AccordionTrigger>

          <AccordionContent>
            Yes. The Market Hub is built for the entire country,
            allowing buyers and sellers from every region of Eswatini
            to connect.
          </AccordionContent>
        </AccordionItem>

      </Accordion>

    </div>

  </div>
</section>

      {/* Coming next */}

      {/* ------------------------------------------------------------------ */}
      {/* CTA */}
      {/* ------------------------------------------------------------------ */}

      <section className="container py-20">

        <div className="rounded-3xl border bg-card p-10 text-center shadow-sm">

          <h2 className="text-3xl font-bold">
            Ready to Start Selling?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join Eswatini's growing online marketplace today.
            Post your advertisement in minutes and start connecting with buyers across the country.
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

      {/* ------------------------------------------------------------------ */}
      {/* SEO */}
      {/* ------------------------------------------------------------------ */}

      {/* SEO Component + JSON-LD will go here */}

    </main>
  );
}