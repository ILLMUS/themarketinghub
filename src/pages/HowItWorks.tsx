import {SEO} from "@/components/seo/SEO";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, DollarSign, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <>
      <SEO
        title="How It Works | The Market Hub"
        description="Learn how to buy, sell and advertise on The Market Hub in a few simple steps."
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-background to-secondary/30 border-b">
        <div className="container py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">
            How The Market Hub Works
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground text-lg">
            Buying and selling across Eswatini has never been easier. Follow
            these simple steps to start advertising and reach thousands of
            potential buyers.
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
      </section>

      {/* How It Works */}
      <section className="bg-secondary/50">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold">
              How It Works
            </h2>

            <p className="text-muted-foreground mt-2">
              Start selling in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: FileText,
                step: "1",
                title: "Post Your Ad",
                description:
                  "Create a listing with photos, description, and price in minutes.",
              },
              {
                icon: CheckCircle,
                step: "2",
                title: "Get Approved",
                description:
                  "Our team reviews your advertisement to ensure quality and trust for all users.",
              },
              {
                icon: DollarSign,
                step: "3",
                title: "Sell & Earn",
                description:
                  "Connect with buyers across Eswatini and complete your sale.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative text-center space-y-4"
              >
                <div className="mx-auto w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>

                <div className="text-xs font-bold text-primary uppercase tracking-widest">
                  Step {item.step}
                </div>

                <h3 className="text-lg font-bold">
                  {item.title}
                </h3>

                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  {item.description}
                </p>

                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-6 -right-6 h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}