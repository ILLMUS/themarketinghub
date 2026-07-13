import { supabase } from "@/integrations/supabase/client";

export interface AdPosition {
  id: string;
  name: string;
  code: string;
  description: string | null;
  width: number | null;
  height: number | null;
  active: boolean;
}

export interface AdCampaign {
  id: string;

  company_name: string;

  title: string;

  description: string | null;

  image_url: string;

  destination_url: string | null;

  whatsapp: string | null;

  position_id: string;

  start_date: string;

  end_date: string;

  active: boolean;

  created_by: string | null;

  approved_by: string | null;

  created_at: string;

  updated_at: string;
}

export interface CampaignForm {
  company_name: string;

  title: string;

  description?: string;

  image_url: string;

  destination_url?: string;

  whatsapp?: string;

  position_id: string;

  start_date: string;

  end_date: string;

  active: boolean;
}

export const AdvertisingService = {
  // =====================================================
  // AD POSITIONS
  // =====================================================

  async getPositions() {
    const { data, error } = await supabase
      .from("ad_positions")
      .select("*")
      .eq("active", true)
      .order("name");

    if (error) throw error;

    return data;
  },

  // =====================================================
  // ADMIN
  // =====================================================

  async getCampaigns() {
    const { data, error } = await supabase
      .from("ad_campaigns")
      .select(
        `
        *,
        ad_positions(
          id,
          name,
          code
        )
      `
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data;
  },

  // =====================================================
  // PUBLIC
  // =====================================================

  async getBanner(positionCode: string) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("ad_campaigns")
      .select(
        `
        *,
        ad_positions!inner(
          code,
          name
        )
      `
      )
      .eq("active", true)
      .eq("ad_positions.code", positionCode)
      .lte("start_date", now)
      .gte("end_date", now)
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return data;
  },

  // =====================================================
  // STORAGE
  // =====================================================

  async uploadBannerImage(file: File) {
    const extension = file.name.split(".").pop();

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("banner-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("banner-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  // =====================================================
  // CREATE
  // =====================================================

  async createCampaign(campaign: CampaignForm) {
    const { data, error } = await supabase
      .from("ad_campaigns")
      .insert(campaign)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // =====================================================
  // UPDATE
  // =====================================================

  async updateCampaign(id: string, campaign: Partial<CampaignForm>) {
    const { data, error } = await supabase
      .from("ad_campaigns")
      .update(campaign)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // =====================================================
  // ENABLE / DISABLE
  // =====================================================

  async toggleCampaign(id: string, active: boolean) {
    const { data, error } = await supabase
      .from("ad_campaigns")
      .update({
        active,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  // =====================================================
  // DELETE
  // =====================================================

  async deleteCampaign(id: string) {
    const { error } = await supabase
      .from("ad_campaigns")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return true;
  },
};