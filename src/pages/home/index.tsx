import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";

import { useEffect, useRef } from "react";
import SDKMap from "@neshan-maps-platform/mapbox-gl/dist/src/core/Map";

export const HomePgae = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<SDKMap>();

  useEffect(() => {
    if (mapContainerRef.current) {
      const mapKey = process.env.NESHAN_MAP_API_KEY as string;

      mapRef.current = new nmp_mapboxgl.Map({
        mapType: nmp_mapboxgl.Map.mapTypes.neshanVector,
        container: mapContainerRef.current,
        center: [51.389, 35.6892],
        zoom: 11,
        minZoom: 2,
        maxZoom: 21,
        mapKey,
      });
    }
  }, []);

  return (
    <div>
      <div ref={mapContainerRef} className="h-dvh"></div>
    </div>
  );
};
