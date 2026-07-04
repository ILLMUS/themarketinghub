import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
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
  );
}