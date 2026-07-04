import type { NumericStatistic } from "../api/profile";
import { formatMetric } from "../utils/format";
import Card from "./ui/Card";

type StatisticsCardProps = {
  statistics: Record<string, NumericStatistic>;
};

function StatisticsCard({ statistics }: StatisticsCardProps) {
  const entries = Object.entries(statistics);

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold text-slate-950">
        Numeric Statistics
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Descriptive statistics for numeric columns.
      </p>

      {entries.length > 0 ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {entries.map(([columnName, values]) => (
            <article
              key={columnName}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <h3 className="truncate text-base font-semibold text-slate-950">
                {columnName}
              </h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5 xl:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Mean</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatMetric(values.mean)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Median</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatMetric(values.median)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Min</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatMetric(values.min)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Max</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatMetric(values.max)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Std Dev</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatMetric(values.std)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          No numeric columns were detected in this dataset.
        </p>
      )}
    </Card>
  );
}

export default StatisticsCard;
