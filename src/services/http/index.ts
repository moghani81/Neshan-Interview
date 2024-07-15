import axios from "axios";

class HttpClient {
  private static instance: HttpClient;
  private http;

  private constructor() {
    const API_KEY = process.env.NESHAN_SERVICES_API_KEY as string;

    this.http = axios.create({
      baseURL: "https://api.neshan.org/v1/",
      headers: {
        "Api-Key": API_KEY,
      },
    });

    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          switch (status) {
            case 470:
              console.error(
                "Error 470: CoordinateParseError - Invalid coordinates."
              );
              break;
            case 480:
              console.error(
                "Error 480: KeyNotFound - Invalid or missing API key."
              );
              break;
            case 481:
              console.error("Error 481: LimitExceeded - Call limit exceeded.");
              break;
            case 482:
              console.error("Error 482: RateExceeded - Rate limit exceeded.");
              break;
            case 483:
              console.error(
                "Error 483: ApiKeyTypeError - API key type mismatch."
              );
              break;
            case 484:
              console.error(
                "Error 484: ApiWhiteListError - Access not allowed."
              );
              break;
            case 485:
              console.error(
                "Error 485: ApiServiceListError - Service access mismatch."
              );
              break;
            case 500:
              console.error("Error 500: GenericError - General error.");
              break;
            default:
              console.error("Unexpected error:", error.response.data);
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  public getHttpClient() {
    return this.http;
  }
}

export default HttpClient.getInstance().getHttpClient();
