import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ForecastPoint } from "../../api/forecasting";

type ForecastChartProps = {
  forecast: ForecastPoint[];
};

function ForecastChart({ forecast }: ForecastChartProps) {
  const chartData = forecast.map((point, index) => {
    const confidenceWidth = Math.max(point.predicted_value * (0.08 + index * 0.01), 1);

    return {
      ...point,
      lower_bound: Math.max(point.predicted_value - confidenceWidth, 0),
      upper_bound: point.predicted_value + confidenceWidth,
    };
  });

  return (
    <div className="h-80 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="forecastBand" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#635BFF" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#635BFF" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="upper_bound"
            name="Confidence band"
            stroke="#635BFF"
            strokeOpacity={0.18}
            fill="url(#forecastBand)"
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="predicted_value"
            name="Trend forecast"
            stroke="#635BFF"
            strokeWidth={3}
            dot={{ r: 4, fill: "#635BFF", strokeWidth: 2, stroke: "#ffffff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;
