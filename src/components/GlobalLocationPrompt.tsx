import { useEffect } from "react";

export function GlobalLocationPrompt() {
  useEffect(() => {
    // Check if we already asked this browser before
    const hasBeenPrompted = localStorage.getItem("geo_prompt_requested");
    if (hasBeenPrompted) return;

    if (!navigator.geolocation) return;

    // Request location once globally on first landing
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success: save coordinates globally if you want, or just mark as granted
        localStorage.setItem("geo_permission", "granted");
        localStorage.setItem("geo_prompt_requested", "true");
        localStorage.setItem("user_lat", position.coords.latitude.toString());
        localStorage.setItem("user_lng", position.coords.longitude.toString());
      },
      (error) => {
        // If denied or failed, record it so we don't spam them globally
        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem("geo_permission", "denied");
        }
        localStorage.setItem("geo_prompt_requested", "true");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return null; // Invisible component
}