import { FC, useState, useEffect, useRef, ChangeEvent } from "react";
import { Input, Loading } from "../../../../components";
import { useSearch } from "../../../../services/search/useSearch";
import { debounce } from "../../../../utility";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";

type SearchProps = {
  userLocation: [number, number];
  map: any;
};

const Search: FC<SearchProps> = ({ userLocation, map }) => {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedText, setDebouncedText] = useState<string>("");
  const [markers, setMarkers] = useState<any[]>([]);

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
    markers.forEach((marker) => marker?.remove());
    setMarkers([]);
    setSearchText(e.target.value);
  };

  useEffect(() => {
    if (data) {
      markers.forEach((marker) => marker?.remove());
      const newMarkers = data.items.map((item) => {
        const marker = new nmp_mapboxgl.Marker({ color: "red" })
          .setLngLat([item.location.x, item.location.y])
          .addTo(map);
        return marker;
      });
      setMarkers(newMarkers);
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
        {data?.items.map((item, idx) => (
          <div key={idx} className="bg-white p-3">
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
