import { useEffect, useState } from "react";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import Search from "./components/search";
import SDKMap from "@neshan-maps-platform/mapbox-gl/dist/src/core/Map";

export type MapType = (mapboxgl.Map & SDKMap) | null;

export const HomePage = () => {
  const mapKey = process.env.NESHAN_MAP_API_KEY as string;
  const [map, setMap] = useState<MapType>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(() => {
    const savedLocation = localStorage.getItem("userLocation");
    return savedLocation ? JSON.parse(savedLocation) : [51.389, 35.6892];
  });

  useEffect(() => {
    map?.on("load", () => {
      const geolocateControl = new nmp_mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
        showAccuracyCircle: true,
      });

      map.addControl(geolocateControl, "bottom-left");

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

      map.addLayer({
        id: "direction-layer",
        type: "line",
        source: "direction-source",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": [
            "interpolate",
            ["linear"],
            ["get", "distance"],
            0,
            "#3b82f6",
            1000,
            "#f64a3b",
          ],
          "line-width": 5,
        },
      });
      map.on("click", "direction-layer", (e: any) => {
        const { distance, duration, summary } = e.features[0].properties;

        new nmp_mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `
            <h3>${summary}</h3>
            <strong>فاصله:</strong> ${distance}<br>
            <strong>زمان:</strong> ${duration}
          `
          )
          .addTo(map)
          .addClassName("popup-symbol");
      });
      map.on("mouseenter", "direction-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "direction-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    });
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
          mapTypeControllerOptions: { show: false },
          mapKey,
        }}
        className="h-dvh"
        mapSetter={(mapInstance) => setMap(mapInstance as MapType)}
      >
        <Search userLocation={userLocation} map={map} />
      </MapComponent>
    </div>
  );
};
