import { FC, useState, ChangeEvent, useRef } from "react";
import { Input, Loading } from "../../../../components";
import { useSearch } from "../../../../services/search/useSearch";
import cn from "classnames";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import directionService from "../../../../services/direction/direction.service";
import polyline from "@mapbox/polyline";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { useSearchHistory } from "../../../../hooks/useSearchHistory";
import { SelectedLocation, useMapLayer } from "../../../../hooks/useMapLayer";
import { MapType } from "../../index";

type SearchProps = {
  userLocation: [number, number];
  map: MapType;
};

const Search: FC<SearchProps> = ({ userLocation, map }) => {
  const [searchText, setSearchText] = useState("");
  const [directionLoading, setDirectionLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const debouncedText = useDebouncedValue(searchText, 1500);

  const { data, isLoading } = useSearch({
    lat: userLocation[1].toString(),
    lng: userLocation[0].toString(),
    term: debouncedText,
  });

  const {
    history,
    showHistory,
    setShowHistory,
    addToHistorySearch,
    deleteAllItemsHistory,
    loadHistorySearch,
    deleteItemFromHistory,
  } = useSearchHistory();

  const { clearMapLayers, markerRef } = useMapLayer(
    map,
    data as SearchResponseType,
    selectedKey,
    setSelectedLocation,
    setSelectedKey,
    itemRefs
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") loadHistorySearch();
    clearMapLayers();
    setSearchText(e.target.value);
  };

  const handleItemClick = (item: SearchItemResponseType) => {
    const key = `${item.location.x}-${item.location.y}`;
    setSelectedLocation({ key, ...item });
    setSelectedKey(key);
    itemRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    map?.flyTo({ center: [item.location.x, item.location.y], zoom: 15 });
    markerRef.current?.remove();
    setTimeout(() => {
      markerRef.current = new nmp_mapboxgl.Marker()
        .setLngLat([item.location.x, item.location.y])
        .addTo(map as mapboxgl.Map);
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
        const geojson: GeoJSON.FeatureCollection<GeoJSON.Geometry> = {
          type: "FeatureCollection",
          features: steps.map((step) => ({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: polyline
                .decode(step.polyline)
                .map(([lat, lng]) => [lng, lat]),
            },
            properties: {
              summary: data.routes[0].legs[0].summary,
              distance: data.routes[0].legs[0].distance.text,
              duration: data.routes[0].legs[0].duration.text,
            },
          })),
        };
        if (!map?.getSource("direction-source")) {
          map?.addSource("direction-source", {
            type: "geojson",
            data: geojson,
          });
        } else {
          const source = map.getSource("direction-source");
          if (source && (source as mapboxgl.GeoJSONSource).setData) {
            (source as mapboxgl.GeoJSONSource).setData(geojson);
          }
        }
        if (map?.getLayer("direction-layer")) {
          map.removeLayer("direction-layer");
        }
        map?.addLayer({
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
          .addTo(map as mapboxgl.Map);
      }
      map?.flyTo({ center: destination, essential: true, zoom: 15 });
    } finally {
      setDirectionLoading(false);
    }
  };

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
          <div className="bg-white p-4 mt-4 shadow sticky top-0 h-[calc(100vh-86px)] overflow-auto">
            <div className="flex justify-between">
              <h3 className="font-bold">تاریخچه </h3>
              <span
                className="text-xs text-red-500 cursor-pointer"
                onClick={() => {
                  clearMapLayers();
                  deleteAllItemsHistory();
                }}
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
                  <div className="flex items-center gap-4">
                    <button
                      className="border border-blue-500 text-blue-500 bg-white p-2 rounded-xl mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGetDirection([item.location.x, item.location.y]);
                      }}
                    >
                      مسیریابی
                    </button>
                    <button
                      className="text-xs text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearMapLayers();
                        deleteItemFromHistory(item);
                      }}
                    >
                      حذف
                    </button>
                  </div>
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
