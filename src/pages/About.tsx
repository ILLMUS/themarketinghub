import { Target, Users, TrendingUp } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container py-16 max-w-3xl">
      <h1 className="text-4xl font-bold mb-6">About The Market Hub</h1>
      <p className="text-lg text-muted-foreground mb-12">
        The Market Hub is Eswatini's premier digital marketplace, connecting local businesses, entrepreneurs, and customers through a powerful advertising platform.
      </p>

      <div className="grid gap-8 md:grid-cols-3 mb-16">
        <div className="text-center space-y-3">
          <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold">Our Mission</h3>
          <p className="text-sm text-muted-foreground">
            To create the largest online marketplace in Eswatini, empowering businesses to grow digitally.
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold">Community</h3>
          <p className="text-sm text-muted-foreground">
            We bring together buyers and sellers, creating opportunities for everyone in the kingdom.
          </p>
        </div>
        <div className="text-center space-y-3">
          <div className="rounded-xl bg-primary/10 p-4 w-fit mx-auto">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-semibold">Growth</h3>
          <p className="text-sm text-muted-foreground">
            Our platform is designed to scale with the growing digital economy of Eswatini.
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-8 space-y-4">
        <h2 className="text-2xl font-bold">How It Works</h2>
        <ol className="space-y-4">
          {[
            { step: "1", title: "Post Your Ad", desc: "Fill out the advertisement form with your product or service details." },
            { step: "2", title: "Make Payment", desc: "Complete the listing fee and send proof of payment via WhatsApp or email." },
            { step: "3", title: "Get Approved", desc: "Our team reviews and approves your ad within 24 hours." },
            { step: "4", title: "Reach Customers", desc: "Your ad goes live on the marketplace for all Eswatini to see." },
          ].map((item) => (
            <li key={item.step} className="flex gap-4">
              <div className="gradient-primary rounded-full w-8 h-8 flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default AboutPage;
