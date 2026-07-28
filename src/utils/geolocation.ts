export const getUserLocation = (
  onSuccess: (lat: number, lng: number) => void,
  onError?: (error: GeolocationPositionError) => void
) => {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      localStorage.setItem("geo_permission", "granted");
      localStorage.setItem("user_lat", lat.toString());
      localStorage.setItem("user_lng", lng.toString());
      
      onSuccess(lat, lng);
    },
    (error) => {
      console.warn(`Geolocation error (${error.code}): ${error.message}`);
      if (error.code === error.PERMISSION_DENIED) {
        localStorage.setItem("geo_permission", "denied");
      }
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    }
  );
};