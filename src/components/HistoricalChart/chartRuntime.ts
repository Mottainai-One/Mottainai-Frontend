import {
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";

Chart.register(CategoryScale, Filler, LineController, LineElement, LinearScale, PointElement, Tooltip);

export { Chart };
