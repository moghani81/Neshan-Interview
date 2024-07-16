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
    if (map) {
      const geolocateControl = new nmp_mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
        showAccuracyCircle: true,
      });

      map.addControl(geolocateControl, "top-left");

      geolocateControl.on("geolocate", (e: any) => {
        const newLocation: [number, number] = [
          e.coords.longitude,
          e.coords.latitude,
        ];
        setUserLocation(newLocation);
        localStorage.setItem("userLocation", JSON.stringify(newLocation));
        map.flyTo({
          center: newLocation,
          essential: true,
          zoom: 15,
        });
      });

      setTimeout(() => {
        geolocateControl.trigger();
      }, 1000);
    }
  }, [map]);

  return (
    <div>
      <MapComponent
        options={{
          mapType: MapTypes.neshanVectorNight,
          center: userLocation,
          zoom: 15,
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
