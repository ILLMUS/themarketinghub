import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryCard } from "@/components/CategoryCard";

const CategoriesPage = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Categories</h1>
      <p className="text-muted-foreground mb-8">Browse listings by category</p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6 animate-pulse">
              <div className="w-14 h-14 bg-muted rounded-xl mx-auto mb-3" />
              <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories?.map((cat) => (
            <CategoryCard key={cat.id} id={cat.id} name={cat.name} icon={cat.icon} description={cat.description} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
