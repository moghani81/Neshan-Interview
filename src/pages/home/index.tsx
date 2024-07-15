import { useEffect, useState } from "react";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import Search from "./components/search";

export const HomePage = () => {
  const mapKey = process.env.NESHAN_MAP_API_KEY as string;
  const [map, setMap] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(() => {
    const savedLocation = localStorage.getItem("userLocation");
    return savedLocation ? JSON.parse(savedLocation) : [51.389, 35.6892];
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation: [number, number] = [longitude, latitude];
          setUserLocation(newLocation);
          localStorage.setItem("userLocation", JSON.stringify(newLocation));
          if (map) {
            new nmp_mapboxgl.Marker({ color: "red" })
              .setLngLat(newLocation)
              .addTo(map);
            map.flyTo({
              center: newLocation,
              essential: true,
              zoom: 14,
            });
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [map]);

  return (
    <div>
      <MapComponent
        options={{
          mapType: MapTypes.neshanVectorNight,
          center: userLocation,
          zoom: 14,
          minZoom: 2,
          maxZoom: 21,
          poi: true,
          mapKey,
        }}
        className="h-dvh"
        mapSetter={(mapInstance) => setMap(mapInstance)}
      >
        <Search userLocation={userLocation} map={map} />
      </MapComponent>
    </div>
  );
};
