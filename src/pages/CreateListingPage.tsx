import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { PreciseLocationPicker } from "@/components/PreciseLocationPicker";
import { Loader2, AlertCircle } from "lucide-react";

export function CreateListingPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("vehicles");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [needsManualPermission, setNeedsManualPermission] = useState(false);

  // Check if global prompt was denied; if so, require manual action here
  useEffect(() => {
    const permissionStatus = localStorage.getItem("geo_permission");
    const savedLat = localStorage.getItem("user_lat");
    const savedLng = localStorage.getItem("user_lng");

    if (permissionStatus === "granted" && savedLat && savedLng) {
      setLat(parseFloat(savedLat));
      setLng(parseFloat(savedLng));
    } else {
      // Denied or not set yet -> Require action on PostAd page
      setNeedsManualPermission(true);
    }
  }, []);

  const handleLocationCaptured = (latitude: number, longitude: number) => {
    setLat(latitude);
    setLng(longitude);
    setNeedsManualPermission(false);
    localStorage.setItem("geo_permission", "granted");
    localStorage.setItem("user_lat", latitude.toString());
    localStorage.setItem("user_lng", longitude.toString());
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lat === null || lng === null) {
      alert("Please pinpoint your location before publishing.");
      return;
    }

    setSubmitting(true);
    setSuccessMsg(null);

    const { error } = await supabase.from("listings").insert([
      {
        title: title,
        category_id: category,
        latitude: lat,
        longitude: lng,
      },
    ]);

    setSubmitting(false);

    if (error) {
      console.error("Error saving listing:", error);
      alert("Failed to save listing.");
    } else {
      setSuccessMsg("Listing successfully published with precise GPS location!");
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSaveListing} className="max-w-md mx-auto p-6 space-y-4 border rounded-xl bg-card shadow-sm">
      <h1 className="text-lg font-bold">List an Item (Post Ad)</h1>

      <div className="space-y-1">
        <label className="text-xs font-medium">Item Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g., Mountain Bike"
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
        >
          <option value="vehicles">Vehicles</option>
          <option value="electronics">Electronics</option>
          <option value="property">Property</option>
          <option value="services">Services</option>
        </select>
      </div>

      <div className="space-y-2 pt-2">
        <label className="text-xs font-medium">Precise Location Required</label>
        
        {needsManualPermission && (
          <div className="flex items-start gap-2 p-3 text-xs bg-amber-500/10 text-amber-600 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Location access is required to post an ad. Please click the button below to allow location pin-pointing.</span>
          </div>
        )}

        {/* Picker component handles manual user trigger if global prompt was blocked */}
        <PreciseLocationPicker onLocationSelect={handleLocationCaptured} />
      </div>

      {successMsg && (
        <p className="text-xs text-emerald-600 bg-emerald-500/10 p-2.5 rounded-md">
          {successMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || lat === null}
        className="w-full py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>Publish Listing</span>
      </button>
    </form>
  );
}