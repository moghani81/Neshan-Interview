interface Polyline {
  points: string;
}

interface Distance {
  value: number;
  text: string;
}

interface Duration {
  value: number;
  text: string;
}

interface Step {
  name: string;
  instruction: string;
  bearing_after: number;
  type: string;
  modifier: string;
  exit?: number;
  distance: Distance;
  duration: Duration;
  polyline: string;
  start_location: [number, number];
}

interface Leg {
  summary: string;
  distance: Distance;
  duration: Duration;
  steps: Step[];
}

interface Route {
  overview_polyline: Polyline;
  legs: Leg[];
}

interface DirectionResponseType {
  routes: Route[];
}

interface DirectionRequestType {
  origin: [number, number];
  destination: [number, number];
}
