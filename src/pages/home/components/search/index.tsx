import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { Input, Loading } from "../../../../components";
import { useSearch } from "../../../../services/search/useSearch";
import { debounce } from "../../../../utility";
import cn from "classnames";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";

type SearchProps = {
  userLocation: [number, number];
  map: any;
};

const Search: FC<SearchProps> = ({ userLocation, map }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedText, setDebouncedText] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { data, isLoading } = useSearch({
    lat: userLocation[1].toString(),
    lng: userLocation[0].toString(),
    term: debouncedText,
  });

  const handleSearch = useRef(
    debounce((text: string) => {
      setDebouncedText(text);
    }, 1500)
  ).current;

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (map.getLayer("search-results-layer")) {
      map.removeLayer("search-results-layer");
    }
    if (map.getSource("search-results-source")) {
      map.removeSource("search-results-source");
    }
    setSearchText(e.target.value);
  };

  useEffect(() => {
    if (data && map) {
      if (map.getLayer("search-results-layer")) {
        map.removeLayer("search-results-layer");
      }
      if (map.getSource("search-results-source")) {
        map.removeSource("search-results-source");
      }

      const geojson = {
        type: "FeatureCollection",
        features: data.items.map((item) => ({
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
      };

      map.addSource("search-results-source", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "search-results-layer",
        type: "symbol",
        source: "search-results-source",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": ["case", ["==", ["get", "key"], selectedKey], 1.0, 0.7],
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

      map.on("click", "search-results-layer", (e: any) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["search-results-layer"],
        });
        if (features.length) {
          setSelectedLocation(features[0].properties);
          setSelectedKey(features[0].properties.key);
          const key = features[0].properties.key;
          const ref = itemRefs.current[key];
          if (ref) {
            ref.scrollIntoView({ behavior: "smooth", block: "center" });
          }
          const feature = features[0];
          const coordinates = feature.geometry.coordinates.slice();
          const { title, region, address } = feature.properties;

          new nmp_mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
              `
              <h3>${title}</h3>
              <p>${region}</p>
              <p>${address}</p>
            `
            )
            .addTo(map)
            .setOffset([0, -25])
            .addClassName("popup-symbol");
        }
      });

      map.on("mouseenter", "search-results-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "search-results-layer", () => {
        map.getCanvas().style.cursor = "";
      });
    }
  }, [data, map, selectedKey]);

  return (
    <div className="fixed right-0 top-0 z-10 w-80 bg-gray-100 max-h-screen overflow-auto">
      <div className="bg-white p-4 shadow sticky top-0">
        <Input
          value={searchText}
          placeholder="دنبال چی میگردی؟ رستوران ، شهر یا ..."
          onChange={handleChange}
        />
        {isLoading && <Loading />}
      </div>
      <div className="flex flex-col gap-2">
        {data?.items.map((item) => (
          <div
            key={`${item.location.x}-${item.location.y}`}
            ref={(el) =>
              (itemRefs.current[`${item.location.x}-${item.location.y}`] = el)
            }
            className={cn("bg-white p-3 cursor-pointer", {
              "!bg-slate-200":
                selectedLocation?.key ===
                `${item.location.x}-${item.location.y}`,
            })}
            onClick={() => {
              setSelectedLocation({
                key: `${item.location.x}-${item.location.y}`,
                ...item,
              });
              setSelectedKey(`${item.location.x}-${item.location.y}`);
              const ref =
                itemRefs.current[`${item.location.x}-${item.location.y}`];
              if (ref) {
                ref.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              map.flyTo({
                center: [item.location.x, item.location.y],
                zoom: 15,
              });
            }}
          >
            <p className="text-xl font-bold">{item.title}</p>
            <p className="text-zinc-500">{item.region}</p>
            <p className="text-zinc-500">{item.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
