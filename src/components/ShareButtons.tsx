import { Button } from "@/components/ui/button";
import { MessageCircle, Facebook, Link2 } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({ url, title, className = "" }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} – ${url}`);
  const wa = `https://wa.me/?text=${encodedText}`;
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Button asChild size="sm" variant="outline" className="border-success text-success hover:bg-success hover:text-success-foreground">
        <a href={wa} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
        </a>
      </Button>
      <Button asChild size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        <a href={fb} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4 mr-2" /> Facebook
        </a>
      </Button>
      <Button size="sm" variant="ghost" onClick={copy}>
        <Link2 className="h-4 w-4 mr-2" /> Copy link
      </Button>
    </div>
  );
}