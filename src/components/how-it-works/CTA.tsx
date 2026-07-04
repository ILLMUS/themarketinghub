import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="container">

        <div className="rounded-3xl gradient-primary p-12 text-center">

          <h2 className="text-4xl font-bold text-primary-foreground">
            Ready to Start?
          </h2>

          <p className="mt-4 text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of buyers and sellers using The Market Hub to grow
            their business and discover amazing deals across Eswatini.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate("/post-ad")}
            >
              Post Your First Ad
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-primary"
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