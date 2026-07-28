import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface EnableLocationProps {
  onPermissionGranted: (lat: number, lng: number) => void;
}

export function EnableLocationBanner({ onPermissionGranted }: EnableLocationProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserPermission = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    // This direct click handler guarantees the browser's native popup will open!
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Save state so we don't ask again
        localStorage.setItem("geo_permission", "granted");
        localStorage.setItem("user_lat", lat.toString());
        localStorage.setItem("user_lng", lng.toString());

        onPermissionGranted(lat, lng);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access was blocked. Please enable it in your browser settings.");
        } else {
          setError("Unable to retrieve your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // If permission is already granted, don't show the banner
  if (localStorage.getItem("geo_permission") === "granted") {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 my-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary text-white rounded-lg shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Enable Precise Location</h4>
          <p className="text-xs text-muted-foreground">
            Allow location access to find nearby marketplace items and post your ads accurately.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={requestBrowserPermission}
        disabled={loading}
        className="px-4 py-2 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all shrink-0 flex items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        <span>Allow Location Access</span>
      </button>

      {error && <p className="text-xs text-red-500 w-full">{error}</p>}
    </div>
  );
}