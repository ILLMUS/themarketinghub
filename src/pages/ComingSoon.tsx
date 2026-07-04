import { Button } from "@/components/ui/button";
import SEO from "@/components/seo/SEO";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function ComingSoon() {
  return (
    <main>

     
      <section className="container flex min-h-[75vh] items-center justify-center py-20">

        <div className="max-w-xl text-center">

          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">

            <Construction className="h-12 w-12 text-primary" />

          </div>

          <h1 className="text-4xl font-bold">
            Coming Soon
          </h1>

          <p className="mt-5 text-muted-foreground leading-7">
            We're currently building this page to give you the best possible
            experience. Thank you for your patience.
          </p>

          <div className="mt-10">

            <Button asChild className="gradient-primary border-0">

              <Link to="/marketplace">

                <ArrowLeft className="mr-2 h-4 w-4" />

                Back to Marketplace

              </Link>

            </Button>

          </div>

        </div>

      </section>

    </main>
  );
}