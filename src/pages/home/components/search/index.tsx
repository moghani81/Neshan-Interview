import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { Input, Loading } from "../../../../components";
import { useSearch } from "../../../../services/search/useSearch";
import { debounce } from "../../../../utility";
import cn from "classnames";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import directionService from "../../../../services/direction/direction.service";
import polyline from "@mapbox/polyline";

type SearchProps = {
  userLocation: [number, number];
  map: any;
};

const Search: FC<SearchProps> = ({ userLocation, map }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [directionLoading, setDirectionLoading] = useState(false);
  const [debouncedText, setDebouncedText] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const markerRef = useRef<any>(null);

  const { data, isLoading } = useSearch({
    lat: userLocation[1].toString(),
    lng: userLocation[0].toString(),
    term: debouncedText,
  });

  const handleSearch = useRef(
    debounce((text: string) => setDebouncedText(text), 1500)
  ).current;

  useEffect(() => {
    handleSearch(searchText);
  }, [searchText, handleSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") loadHistorySearch();
    clearMapLayers();
    setSearchText(e.target.value);
  };

  const clearMapLayers = () => {
    const layers = ["search-results-layer", "direction-layer"];
    const sources = ["search-results-source", "direction-source"];
    layers.forEach((layer) => map.getLayer(layer) && map.removeLayer(layer));
    sources.forEach(
      (source) => map.getSource(source) && map.removeSource(source)
    );
    markerRef.current && markerRef.current.remove();
  };

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
  const addToHistorySearch = (item: any) => {
    const historyString = localStorage.getItem("historysearch");
    const history: any[] = historyString ? JSON.parse(historyString) : [];
    const newHistory = [...history, item];
    localStorage.setItem("historysearch", JSON.stringify(newHistory));
  };

  const deleteAllItemsHistory = () => {
    localStorage.removeItem("historysearch");
    setHistory([]);
    clearMapLayers();
    setShowHistory(false);
  };

  const loadHistorySearch = () => {
    const historyString = localStorage.getItem("historysearch");
    const history: any[] = historyString ? JSON.parse(historyString) : [];
    setHistory(history);
  };

  const handleItemClick = (item: any) => {
    const key = `${item.location.x}-${item.location.y}`;
    setSelectedLocation({ key, ...item });
    setSelectedKey(key);
    itemRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    map.flyTo({ center: [item.location.x, item.location.y], zoom: 15 });
    markerRef.current?.remove();
    setTimeout(() => {
      markerRef.current = new nmp_mapboxgl.Marker()
        .setLngLat([item.location.x, item.location.y])
        .addTo(map);
    }, 100);
  };

  const handleGetDirection = async (destination: [number, number]) => {
    try {
      setDirectionLoading(true);
      const origin = userLocation;
      const data = await directionService.getDirections({
        origin,
        destination,
      });
      const steps = data.routes[0].legs[0].steps;

      if (steps) {
        const geojson = {
          type: "FeatureCollection",
          features: steps.map((step) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: polyline
                .decode(step.polyline)
                .map(([lat, lng]) => [lng, lat]),
            },
          })),
        };
        if (!map.getSource("direction-source")) {
          map.addSource("direction-source", {
            type: "geojson",
            data: geojson,
          });
        } else {
          const source = map.getSource("direction-source");
          source && source.setData && source.setData(geojson);
        }
        map.addLayer({
          id: "direction-layer",
          type: "line",
          source: "direction-source",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 5,
          },
        });
        markerRef.current?.remove();
        markerRef.current = new nmp_mapboxgl.Marker()
          .setLngLat(destination)
          .addTo(map);
      }
      map.flyTo({ center: destination, essential: true, zoom: 15 });
    } finally {
      setDirectionLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchSection = document.querySelector(".search-section");
      if (searchSection && !searchSection.contains(event.target as Node)) {
        setShowHistory(false);
        loadHistorySearch();
        setSelectedLocation(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed right-0 top-0 z-10 w-80 bg-gray-100 max-h-screen overflow-auto search-section">
      <div className="bg-white p-4 shadow sticky top-0">
        <Input
          value={searchText}
          placeholder="دنبال چی میگردی؟ رستوران ، شهر یا ..."
          onChange={handleChange}
          onFocus={() => {
            setShowHistory(true);
            loadHistorySearch();
          }}
        />
        {isLoading && <Loading />}
        {showHistory && history.length > 0 && !searchText && (
          <div className="bg-white p-4 mt-4 shadow sticky top-0 h-dvh">
            <div className="flex justify-between">
              <h3 className="font-bold">تاریخچه </h3>
              <span
                className="text-xs text-red-500 cursor-pointer"
                onClick={deleteAllItemsHistory}
              >
                حذف همه
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {history?.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-3 cursor-pointer"
                  onClick={() => {
                    handleItemClick(item);
                  }}
                >
                  <p className="text-xl font-bold">{item.title}</p>
                  <p className="text-zinc-500">{item.region}</p>
                  <p className="text-zinc-500">{item.address}</p>
                  <button
                    className="border border-blue-500 text-blue-500 bg-white p-2 rounded-xl mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGetDirection([item.location.x, item.location.y]);
                    }}
                  >
                    مسیریابی
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
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
            onClick={() => handleItemClick(item)}
          >
            <p className="text-xl font-bold">{item.title}</p>
            <p className="text-zinc-500">{item.region}</p>
            <p className="text-zinc-500">{item.address}</p>
            <button
              className="border border-blue-500 text-blue-500 bg-white p-2 rounded-xl mt-2"
              onClick={(e) => {
                e.stopPropagation();
                const hasIdx = history.findIndex(
                  (historyItem) =>
                    historyItem.location.x === item.location.x &&
                    historyItem.location.y === item.location.y
                );
                if (hasIdx === -1) addToHistorySearch(item);
                handleGetDirection([item.location.x, item.location.y]);
              }}
            >
              مسیریابی
            </button>
          </div>
        ))}
      </div>
      {directionLoading && (
        <div className="fixed top-0 right-0 min-h-dvh z-20 pointer-events-none w-80">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-200/50 pointer-events-auto w-full h-full">
            <Loading />
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
