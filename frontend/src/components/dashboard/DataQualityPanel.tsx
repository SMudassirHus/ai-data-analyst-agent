import type { DatasetProfile } from "../../api/profile";
import { formatNumber } from "../../utils/format";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import StatCard from "../ui/StatCard";

type DataQualityPanelProps = {
  profile: DatasetProfile;
};

function DataQualityPanel({ profile }: DataQualityPanelProps) {
  const columnsWithMissing = Object.values(profile.missing_values).filter(
    (item) => item.count > 0
  ).length;

  const metrics = [
    {
      label: "Missing values",
      value: formatNumber(columnsWithMissing),
      description: "Columns containing at least one missing value.",
    },
    {
      label: "Duplicate rows",
      value: formatNumber(profile.duplicates),
      description: "Rows that exactly repeat another record.",
    },
    {
      label: "Warnings",
      value: formatNumber(profile.warnings.length),
      description: "Quality checks requiring analyst review.",
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-950">Data Quality</h2>
        <p className="mt-1 text-sm text-slate-600">
          Automated checks for missing data, duplicates, dates, and anomalies.
        </p>
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

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">Quality Notes</h3>
          {profile.date_columns.length > 0 && (
            <Badge variant="blue">
              Date columns: {profile.date_columns.join(", ")}
            </Badge>
          )}
        </div>

        {profile.warnings.length > 0 ? (
          <ul className="mt-4 grid gap-3">
            {profile.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-[#635BFF]">
            No data quality warnings found.
          </p>
        )}
      </Card>
    </section>
  );
}

export default DataQualityPanel;
