import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  className = "",
}: FeatureCardProps) {
  return (
    <div
      className={`
        group
        rounded-2xl
        border
        bg-card
        p-6
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
        ${className}
      `}
    >
      <div
        className="
          mb-5
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          transition-all
          duration-300
          group-hover:scale-110
          group-hover:rotate-6
        "
      >
        <Icon className="h-7 w-7 text-primary" />
      </div>

      <h3 className="mb-2 text-lg font-semibold">
        {title}
      </h3>

      <p className="text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}