import { useEffect, useRef } from "react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import polyline from "@mapbox/polyline";

export const useMapLayer = (
  map: any,
  data: any,
  selectedKey: string | null,
  setSelectedLocation: (location: any) => void,
  setSelectedKey: (key: string | null) => void,
  itemRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
) => {
  const markerRef = useRef<any>(null);

  const clearMapLayers = () => {
    const layers = ["search-results-layer", "direction-layer"];
    const sources = ["search-results-source", "direction-source"];
    layers.forEach((layer) => map.getLayer(layer) && map.removeLayer(layer));
    sources.forEach(
      (source) => map.getSource(source) && map.removeSource(source)
    );
    markerRef.current && markerRef.current.remove();
  };

  const handleMapClick = (e: any) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["search-results-layer"],
    });
    if (features.length) {
      const feature = features[0];
      const { key, title, region, address } = feature.properties;
      setSelectedLocation(feature.properties);
      setSelectedKey(key);
      itemRefs.current[key]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      new nmp_mapboxgl.Popup({ closeOnMove: true })
        .setLngLat(feature.geometry.coordinates.slice())
        .setHTML(`<h3>${title}</h3><p>${region}</p><p>${address}</p>`)
        .addTo(map)
        .setOffset([0, -25])
        .addClassName("popup-symbol");
    }
  };

  const createGeoJson = (items: any[]) => ({
    type: "FeatureCollection",
    features: items.map((item) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [item.location.x, item.location.y],
      },
      properties: {
        title: item.title,
        region: item.region,
        address: item.address,
        icon: item.type,
        key: `${item.location.x}-${item.location.y}`,
      },
    })),
  });

  const createMapLayer = () => ({
    id: "search-results-layer",
    type: "symbol",
    source: "search-results-source",
    layout: {
      "icon-image": ["get", "icon"],
      "icon-size": 0.7,
      "text-field": ["get", "title"],
      "text-size": 12,
      "text-anchor": "top",
      "text-offset": [0, 1.5],
    },
    paint: {
      "text-color": "#fff",
      "text-halo-color": "#000",
      "text-halo-width": 1,
    },
  });

  useEffect(() => {
    if (data && map) {
      clearMapLayers();
      const geojson = createGeoJson(data.items);

      if (!map.getSource("search-results-source")) {
        map.addSource("search-results-source", {
          type: "geojson",
          data: geojson,
        });
      } else {
        const source = map.getSource("search-results-source");
        source && source.setData && source.setData(geojson);
      }

      map.addLayer(createMapLayer());
      map.on("click", "search-results-layer", handleMapClick);
      map.on("mouseenter", "search-results-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "search-results-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [data, map, selectedKey]);

  return {
    clearMapLayers,
    markerRef,
  };
};
