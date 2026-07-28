import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { PreciseLocationPicker } from "@/components/PreciseLocationPicker";
import { Loader2, MapPin } from "lucide-react";

export function NearbyMarketplace() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const fetchNearbyListings = async (lat: number, lng: number) => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc("get_nearby_listings", {
      user_lat: lat,
      user_lng: lng,
      max_distance_meters: 30000, // 30km radius
    });

    if (error) {
      console.error("Error fetching nearby listings:", error);
    } else {
      setListings(data || []);
    }
    setLoading(false);
  };

  // Automatically request location when the component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionError("Geolocation is not supported by your browser");
      setAutoDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setAutoDetecting(false);
        fetchNearbyListings(lat, lng);
      },
      (error) => {
        setAutoDetecting(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPermissionError("Location permission was denied. Use the manual detector below.");
            break;
          default:
            setPermissionError("Could not auto-detect location. Please use the button below.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Find Items Near Me</h2>
      </div>

      {/* Auto-detecting loading state */}
      {autoDetecting && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 p-3 rounded-xl">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Requesting location access to find nearby items...</span>
        </div>
      )}

      {/* Fallback permission warning or manual picker if denied */}
      {permissionError && (
        <div className="space-y-3">
          <p className="text-xs text-amber-600 bg-amber-500/10 p-3 rounded-xl">
            ⚠️ {permissionError}
          </p>
          <PreciseLocationPicker onLocationSelect={(lat, lng) => fetchNearbyListings(lat, lng)} />
        </div>
      )}

      {loading && !autoDetecting && (
        <p className="text-sm text-muted-foreground">Searching nearby listings...</p>
      )}

      {/* Render results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {listings.map((item) => {
          const listing = item.listing;
          return (
            <div key={listing.id} className="border p-4 rounded-xl bg-card flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm">{listing.title}</h3>
                <p className="text-xs text-muted-foreground">{listing.category_id}</p>
              </div>
              
              {item.distance_km !== undefined && (
                <span className="mt-3 text-[11px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full w-fit">
                  📍 {item.distance_km} km away
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}