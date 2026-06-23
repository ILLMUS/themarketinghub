import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function useSavedAds() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedAdIds = [] } = useQuery({
    queryKey: ["saved-ads", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_ads")
        .select("ad_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((s) => s.ad_id);
    },
    enabled: !!user,
  });

  const toggleSave = useMutation({
    mutationFn: async (adId: string) => {
      if (!user) throw new Error("Login required");
      const isSaved = savedAdIds.includes(adId);
      if (isSaved) {
        const { error } = await supabase
          .from("saved_ads")
          .delete()
          .eq("user_id", user.id)
          .eq("ad_id", adId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("saved_ads")
          .insert({ user_id: user.id, ad_id: adId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-ads"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  return { savedAdIds, toggleSave: toggleSave.mutate, isSaved: (id: string) => savedAdIds.includes(id) };
}
