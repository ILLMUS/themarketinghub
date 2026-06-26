import { Helmet } from "react-helmet-async";
import { Target, Users, TrendingUp } from "lucide-react";

const AboutPage = () => {
  return (
    <>

        <title>About The Market Hub | Eswatini's Online Marketplace</title>

        <meta
          name="description"
          content="Learn about The Market Hub, Eswatini's trusted online marketplace connecting buyers, sellers, businesses and entrepreneurs. Buy, sell and discover cars, property, electronics, jobs and local services."
        />

        <meta
          name="keywords"
          content="About The Market Hub, Eswatini marketplace, online marketplace Eswatini, buy and sell Eswatini, classifieds Eswatini, local businesses Eswatini"
        />

        <meta name="author" content="The Market Hub" />
        <meta name="robots" content="index, follow" />

        <link
          rel="canonical"
          href="https://themarkethubsz.com/about"
        />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="About The Market Hub | Eswatini's Online Marketplace"
        />

        <meta
          property="og:description"
          content="Discover the story behind The Market Hub, Eswatini's growing marketplace connecting buyers, sellers and businesses."
        />

        <meta
          property="og:image"
          content="https://themarkethubsz.com/og-image.jpg"
        />

        <meta
          property="og:url"
          content="https://themarkethubsz.com/about"
        />

        <meta property="og:type" content="website" />

        {/* Twitter */}
        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="About The Market Hub"
        />

        <meta
          name="twitter:description"
          content="Eswatini's trusted online marketplace for buying and selling."
        />

        <meta
          name="twitter:image"
          content="https://themarkethubsz.com/og-image.jpg"
        />
  

      <div className="container py-16">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About The Market Hub
            </h1>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The Market Hub is Eswatini's premier digital marketplace,
              connecting local businesses, entrepreneurs and customers through
              a modern online platform designed for buying, selling and
              discovering products and services.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-16">

            <div className="text-center space-y-3">
              <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
                <Target className="h-8 w-8 text-primary" />
              </div>

              <h3 className="font-semibold text-xl">
                Our Mission
              </h3>

              <p className="text-sm text-muted-foreground">
                To create Eswatini's leading online marketplace by empowering
                individuals and businesses with an easy, trusted and affordable
                digital platform.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
                <Users className="h-8 w-8 text-primary" />
              </div>

              <h3 className="font-semibold text-xl">
                Our Community
              </h3>

              <p className="text-sm text-muted-foreground">
                We connect buyers, sellers, entrepreneurs and businesses,
                creating opportunities that strengthen Eswatini's digital
                economy.
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>

              <h3 className="font-semibold text-xl">
                Our Vision
              </h3>

              <p className="text-sm text-muted-foreground">
                To become Eswatini's most trusted marketplace and expand into a
                leading digital commerce platform across Southern Africa.
              </p>
            </div>

          </div>

          <div className="bg-card border rounded-xl p-8 shadow-sm">

            <h2 className="text-2xl font-bold mb-8">
              How It Works
            </h2>

            <ol className="space-y-6">

              {[
                {
                  step: "1",
                  title: "Post Your Ad",
                  desc: "Create your listing by filling in product or service details, uploading photos and choosing the right category."
                },
                {
                  step: "2",
                  title: "Make Payment",
                  desc: "Complete your listing payment securely and send proof of payment through WhatsApp or email."
                },
                {
                  step: "3",
                  title: "Approval Process",
                  desc: "Our moderation team reviews your listing to ensure quality and trust before publishing."
                },
                {
                  step: "4",
                  title: "Reach Thousands",
                  desc: "Once approved, your advertisement becomes visible to buyers across Eswatini."
                }
              ].map((item) => (
                <li key={item.step} className="flex gap-4">

                  <div className="gradient-primary rounded-full w-9 h-9 flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                    {item.step}
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg">
                      {item.title}
                    </h4>

                    <p className="text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>

                </li>
              ))}

            </ol>

          </div>

        </div>
      </div>
    </>
  );
};

export default AboutPage;