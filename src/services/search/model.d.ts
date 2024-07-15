interface SearchRequestType {
  lat: string;
  lng: string;
  term: string;
}

interface SearchItemResponseType {
  title: string;
  address: string;
  neighbourhood: string;
  region: string;
  type: string;
  category: string;
  location: {
    x: number;
    y: number;
  };
}
interface SearchResponseType {
  count: number;
  items: SearchItemResponseType[];
}
