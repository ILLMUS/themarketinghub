import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export function PreciseLocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const executeGeolocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const options = {
      enableHighAccuracy: true, // Forces GPS chip usage on mobile devices
      timeout: 10000,           // Wait up to 10 seconds for a precise lock
      maximumAge: 0,            // Do not use cached location data
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setCoordinates({ lat, lng });
        setLoading(false);
        
        // Pass precise coordinates back to parent form/component
        onLocationSelect(lat, lng);
      },
      (error) => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location permission was denied. Please allow access in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setErrorMsg("The request to get user location timed out.");
            break;
          default:
            setErrorMsg("An unknown error occurred.");
            break;
        }
      },
      options
    );
  };

  // Automatically trigger location request the moment this component loads
  useEffect(() => {
    executeGeolocation();
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-xl bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-4 h-4 text-primary" />
          <span>Pinpoint Precise Location</span>
        </div>
        
        <button
          type="button"
          onClick={executeGeolocation}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Locking GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3.5 h-3.5" />
              <span>Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {coordinates && (
        <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
          📍 Locked: <span className="font-mono text-foreground">{coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
        </p>
      )}

      {errorMsg && (
        <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded-md">
          {errorMsg}
        </p>
      )}
    </div>
  );
}