import http from "../http";

class SearchService {
  private static instance: SearchService;

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  public async search(
    searchRequest: SearchRequestType
  ): Promise<SearchResponseType> {
    try {
      const response = await http.get("/v1/search", {
        params: {
          lat: searchRequest.lat,
          lng: searchRequest.lng,
          term: searchRequest.term,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error performing search:", error);
      throw error;
    }
  }
}

export default SearchService.getInstance();
