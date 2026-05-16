import { Link } from "react-router-dom";
import { Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

interface PopularChipsProps {
  categories: Category[] | undefined;
  chipIconMap: Record<string, React.ElementType>;
}

export function PopularChips({ categories, chipIconMap }: PopularChipsProps) {
  const chips = categories?.slice(0, 9) ?? [];

  return (
    <section className="border-b bg-card">
      <div className="container py-5">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Popular:
          </span>
          {chips.map((cat) => {
            const Icon = cat.icon ? chipIconMap[cat.icon] || Tag : null;

            return (
              <Link
                key={cat.id}
                to={`/marketplace?category=${cat.id}`}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors bg-secondary/50 text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
