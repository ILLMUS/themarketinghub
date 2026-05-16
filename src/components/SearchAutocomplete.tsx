import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchAutocompleteProps {
  className?: string;
}

export const SearchAutocomplete = ({ className }: SearchAutocompleteProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (query.trim().length < 2) return [];
      const { data, error } = await supabase
        .from("advertisements")
        .select("id, title, categories(name)")
        .eq("status", "approved")
        .ilike("title", `%${query.trim()}%`)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: query.trim().length >= 2,
  });

  useEffect(() => {
    setOpen(!!suggestions?.length && query.trim().length >= 2);
  }, [suggestions, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      navigate(`/marketplace?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const goToAd = (id: string) => {
    setOpen(false);
    navigate(`/ad/${id}`);
  };

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-accent/40 text-accent-foreground rounded-sm px-0.5">{part}</mark> : part
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className ?? ""}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search listings..."
          className="w-full rounded-full bg-background/10 backdrop-blur-sm border border-muted-foreground/30 py-2.5 pl-10 pr-24 text-sm text-primary-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full gradient-accent border-0 text-xs px-4"
        >
          Search
        </Button>
      </form>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-xl overflow-hidden animate-fade-in">
          {suggestions?.map((ad) => (
            <button
              key={ad.id}
              onClick={() => goToAd(ad.id)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm hover:bg-accent/10 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate text-foreground">{highlight(ad.title)}</span>
                {(ad as any).categories?.name && (
                  <span className="shrink-0 text-[11px] text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                    {(ad as any).categories.name}
                  </span>
                )}
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
          <button
            onClick={handleSubmit as any}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm font-medium text-primary hover:bg-accent/10 transition-colors border-t"
          >
            <Search className="h-3.5 w-3.5" />
            Search all results for "{query}"
          </button>
        </div>
      )}
    </div>
  );
};
