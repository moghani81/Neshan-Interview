import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { Input, Loading } from "../../../../components";
import { useSearch } from "../../../../services/search/useSearch";
import { debounce } from "../../../../utility";

type SearchProps = {
  userLocation: [number, number];
  map: any;
};

const Search: FC<SearchProps> = ({ userLocation, map }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedText, setDebouncedText] = useState<string>("");

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
          type: item.type,
          geometry: {
            type: "Point",
            coordinates: [item.location.x, item.location.y],
          },
          properties: {
            title: item.title,
            icon: item.type,
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
    }
  }, [data, map]);

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
            className="bg-white p-3"
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
