import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface DesktopNavItemProps {
  title: string;
  to: string;
  children: ReactNode;
}

export function DesktopNavItem({
  title,
  to,
  children,
}: DesktopNavItemProps) {
  return (
    <div className="relative group">
      <Link
        to={to}
        className="
          flex
          items-center
          gap-1
          text-sm
          font-medium
          text-muted-foreground
          hover:text-foreground
          transition-colors
        "
      >
        {title}
      </Link>

      <div
        className="
          absolute
          top-full
          left-1/2
          -translate-x-1/2
          mt-2

          opacity-0
          invisible
          translate-y-2

          group-hover:opacity-100
          group-hover:visible
          group-hover:translate-y-0

          transition-all
          duration-200
          z-50
        "
      >
        {children}
      </div>
    </div>
  );
}