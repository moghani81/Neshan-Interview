import { useQuery } from "react-query";
import searchService from "./search.service";

const fetchSearchResults = async (
  searchRequest: SearchRequestType
): Promise<SearchResponseType> => {
  return searchService.search(searchRequest);
};

export const useSearch = (searchRequest: SearchRequestType) => {
  return useQuery<SearchResponseType, Error>(
    ["search", searchRequest],
    () => fetchSearchResults(searchRequest),
    {
      enabled: !!searchRequest.term,
    }
  );
};
