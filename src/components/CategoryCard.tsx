import { Link } from "react-router-dom";
import {
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase, Users, Tag,
  Utensils, Heart, Scissors, Phone, TreePine, FileText, Landmark, Truck
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Smartphone, Car, Home, Hammer, Shield, Sofa, Shirt, Briefcase, Users,
  Utensils, Heart, Scissors, Phone, TreePine, FileText, Landmark, Truck,
};

interface CategoryCardProps {
  id: string;
  name: string;
  icon: string | null;
  description: string | null;
}

export function CategoryCard({ id, name, icon, description }: CategoryCardProps) {
  const Icon = (icon && iconMap[icon]) || Tag;

  return (
    <Link
      to={`/marketplace?category=${id}`}
      className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center hover:shadow-md hover:border-primary/30 transition-all duration-300"
    >
      <div className="rounded-xl bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-semibold text-sm">{name}</h3>
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
      )}
    </Link>
  );
}
