interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={className}>
      <div className="container py-16">
        {children}
      </div>
    </section>
  );
}