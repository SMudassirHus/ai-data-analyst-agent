import type { DatasetSummary } from "../../api/profile";
import { formatMetric, formatNumber } from "../../utils/format";
import Badge from "../ui/Badge";
import StatCard from "../ui/StatCard";

type DatasetOverviewGridProps = {
  summary: DatasetSummary;
};

function DatasetOverviewGrid({ summary }: DatasetOverviewGridProps) {
  const metrics = [
    {
      label: "Rows",
      value: formatNumber(summary.rows),
      description: "Total records detected in the uploaded dataset.",
    },
    {
      label: "Columns",
      value: formatNumber(summary.columns),
      description: "Fields available for profiling and exploration.",
    },
    {
      label: "Memory",
      value: `${formatMetric(summary.memory_usage_mb)} MB`,
      description: "Estimated in-memory footprint from pandas profiling.",
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Dataset Overview</h2>
          <p className="mt-1 text-sm text-slate-600">
            Core size metrics for the latest uploaded file.
          </p>
        </div>
        <Badge variant="success">Profile generated</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </div>
    </section>
  );
}

export default DatasetOverviewGrid;
