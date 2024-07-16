import http from "../http";

class DirectionService {
  private static instance: DirectionService;

  private constructor() {}

  public static getInstance(): DirectionService {
    if (!DirectionService.instance) {
      DirectionService.instance = new DirectionService();
    }
    return DirectionService.instance;
  }

  public async getDirections(
    directionRequest: DirectionRequestType
  ): Promise<DirectionResponseType> {
    try {
      const response = await http.get("/v2/direction", {
        params: {
          origin: `${directionRequest.origin[1]},${directionRequest.origin[0]}`,
          destination: `${directionRequest.destination[1]},${directionRequest.destination[0]}`,
          type: "car",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching directions:", error);
      throw error;
    }
  }
}

export default DirectionService.getInstance();
