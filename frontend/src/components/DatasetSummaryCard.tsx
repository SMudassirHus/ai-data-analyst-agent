import type { DatasetSummary } from "../api/profile";
import { formatMetric, formatNumber } from "../utils/format";
import StatCard from "./ui/StatCard";

type DatasetSummaryCardProps = {
  summary: DatasetSummary;
};

function DatasetSummaryCard({ summary }: DatasetSummaryCardProps) {
  const metrics = [
    { label: "Rows", value: formatNumber(summary.rows) },
    { label: "Columns", value: formatNumber(summary.columns) },
    { label: "Memory", value: `${formatMetric(summary.memory_usage_mb)} MB` },
  ];

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">
            Dataset Overview
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            High-level size and memory profile for the uploaded dataset.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </section>
  );
}

export default DatasetSummaryCard;
