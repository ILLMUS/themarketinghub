import { supabase } from "@/integrations/supabase/client";

export interface AdCampaign {
  id: string;
  title: string;
  image_url: string;
  target_url?: string;
  position: "homepage_banner" | "sidebar" | "category_header";
  status: "active" | "draft" | "paused" | "expired";
  start_date: string;
  end_date: string;
  impressions?: number;
  clicks?: number;
  created_at?: string;
}

export const getAdCampaigns = async (): Promise<AdCampaign[]> => {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Failed to fetch ad campaigns:", error.message);
    return [];
  }
  return data || [];
};

export const getAdCampaignById = async (id: string): Promise<AdCampaign | null> => {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to fetch campaign details:", error.message);
    return null;
  }
  return data;
};

export const createAdCampaign = async (campaign: Omit<AdCampaign, "id" | "impressions" | "clicks" | "created_at">) => {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .insert([campaign])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAdCampaign = async (id: string, updates: Partial<AdCampaign>) => {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAdCampaign = async (id: string) => {
  const { error } = await supabase
    .from("ad_campaigns")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
};

export const uploadCampaignBanner = async (file: File): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const filePath = `banners/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("ad-banners")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("ad-banners")
    .getPublicUrl(filePath);

  return data.publicUrl;
};