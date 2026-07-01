import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { VisualizationResponse } from "../../api/visualization";

type ChartRendererProps = {
  chart: VisualizationResponse;
};

const palette = ["#635BFF", "#00A3A3", "#94A3B8", "#111827", "#F59E0B"];

function ChartRenderer({ chart }: ChartRendererProps) {
  if (chart.data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-lg bg-slate-50 text-sm text-slate-600">
        No chart data available.
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg border border-slate-200 bg-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        {chart.chart_type === "line" ? (
          <LineChart data={chart.data}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="y"
              name={chart.y}
              stroke="#635BFF"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        ) : chart.chart_type === "pie" ? (
          <PieChart>
            <Tooltip />
            <Legend />
            <Pie
              data={chart.data}
              dataKey="y"
              nameKey="x"
              outerRadius={120}
              label
            >
              {chart.data.map((entry, index) => (
                <Cell
                  key={`${entry.x}-${index}`}
                  fill={palette[index % palette.length]}
                />
              ))}
            </Pie>
          </PieChart>
        ) : chart.chart_type === "scatter" ? (
          <ScatterChart>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              name={chart.x}
              type="number"
              tick={{ fill: "#475569", fontSize: 12 }}
            />
            <YAxis
              dataKey="y"
              name={chart.y}
              type="number"
              tick={{ fill: "#475569", fontSize: 12 }}
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Legend />
            <Scatter name={`${chart.x} vs ${chart.y}`} data={chart.data} fill="#635BFF" />
          </ScatterChart>
        ) : (
          <BarChart data={chart.data}>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="y" name={chart.y} fill="#635BFF" radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default ChartRenderer;
