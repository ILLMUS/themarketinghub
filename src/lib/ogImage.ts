const OG_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-image`;

export const adOg = (id: string) => `${OG_BASE}?type=ad&id=${id}`;
export const categoryOg = (id: string, location?: string) =>
  `${OG_BASE}?type=category&id=${id}${location ? `&location=${encodeURIComponent(location)}` : ""}`;
export const homeOg = () => `${OG_BASE}?type=home`;