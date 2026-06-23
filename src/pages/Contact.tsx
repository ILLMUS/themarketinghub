import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="container py-16 max-w-2xl">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-10">
        Have questions or need help? Reach out to The Market Hub team.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="https://wa.me/26876373859"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 border rounded-xl p-6 bg-card hover:shadow-md transition-shadow"
        >
          <div className="rounded-xl bg-success/10 p-3">
            <MessageCircle className="h-6 w-6 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">WhatsApp</h3>
            <p className="text-sm text-muted-foreground">76373859</p>
          </div>
        </a>

        <a
          href="mailto:themarkethub51@gmail.com"
          className="flex items-center gap-4 border rounded-xl p-6 bg-card hover:shadow-md transition-shadow"
        >
          <div className="rounded-xl bg-primary/10 p-3">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-sm text-muted-foreground">themarkethub51@gmail.com</p>
          </div>
        </a>

        <a
          href="tel:+26876373859"
          className="flex items-center gap-4 border rounded-xl p-6 bg-card hover:shadow-md transition-shadow"
        >
          <div className="rounded-xl bg-accent/10 p-3">
            <Phone className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Phone</h3>
            <p className="text-sm text-muted-foreground">+268 7637 3859</p>
          </div>
        </a>

        <div className="flex items-center gap-4 border rounded-xl p-6 bg-card">
          <div className="rounded-xl bg-secondary p-3">
            <MapPin className="h-6 w-6 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Location</h3>
            <p className="text-sm text-muted-foreground">Eswatini</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
