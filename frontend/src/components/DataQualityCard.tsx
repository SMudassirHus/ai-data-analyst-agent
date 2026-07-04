import type { DatasetProfile } from "../api/profile";
import { formatNumber } from "../utils/format";
import Card from "./ui/Card";
import StatCard from "./ui/StatCard";

type DataQualityCardProps = {
  profile: DatasetProfile;
};

function DataQualityCard({ profile }: DataQualityCardProps) {
  const columnsWithMissing = Object.values(profile.missing_values).filter(
    (item) => item.count > 0
  ).length;

  const metrics = [
    { label: "Missing value columns", value: formatNumber(columnsWithMissing) },
    { label: "Duplicate rows", value: formatNumber(profile.duplicates) },
    { label: "Warnings", value: formatNumber(profile.warnings.length) },
  ];

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold text-slate-950">Data Quality</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>

      {profile.date_columns.length > 0 && (
        <div className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm text-[#635BFF]">
          <p className="font-semibold">Likely date columns</p>
          <p className="mt-2">{profile.date_columns.join(", ")}</p>
        </div>
      )}

      <div className="mt-5">
        <p className="text-sm font-semibold text-slate-950">Warnings</p>
        {profile.warnings.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {profile.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
              >
                {warning}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-[#635BFF]">
            No data quality warnings found.
          </p>
        )}
      </div>
    </Card>
  );
}

export default DataQualityCard;
