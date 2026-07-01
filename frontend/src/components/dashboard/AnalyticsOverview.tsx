import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Fragment, useEffect, useMemo, useState } from "react";

import { getDatasetRows, type ExploreRow } from "../../api/explore";
import type { DatasetProfile } from "../../api/profile";
import Card from "../ui/Card";

type AnalyticsOverviewProps = {
  filename: string;
  profile: DatasetProfile;
};

const palette = ["#635BFF", "#00A3A3", "#94A3B8", "#111827", "#F59E0B"];

function shortLabel(value: string) {
  return value.length > 16 ? `${value.slice(0, 14)}...` : value;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function isLikelyCategorical(columnName: string, profile: DatasetProfile) {
  const column = profile.column_info.find((item) => item.name === columnName);

  if (!column) {
    return false;
  }

  return (
    !Object.prototype.hasOwnProperty.call(profile.statistics, columnName) &&
    !profile.date_columns.includes(columnName) &&
    column.unique_values > 1
  );
}

function buildCategoryCounts(rows: ExploreRow[], columnName: string) {
  const counts = new Map<string, number>();

  rows.forEach((row) => {
    const rawValue = row[columnName];
    const value =
      rawValue === null || rawValue === undefined || rawValue === ""
        ? "Missing"
        : String(rawValue);
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name: shortLabel(name), fullName: name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function buildTrend(rows: ExploreRow[], dateColumn: string, valueColumn: string) {
  const monthly = new Map<string, number>();

  rows.forEach((row) => {
    const date = new Date(String(row[dateColumn] ?? ""));
    const value = toNumber(row[valueColumn]);

    if (Number.isNaN(date.getTime()) || value === null) {
      return;
    }

    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(month, (monthly.get(month) ?? 0) + value);
  });

  return [...monthly.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(-12)
    .map(([name, value]) => ({ name, value }));
}

function AnalyticsOverview({ filename, profile }: AnalyticsOverviewProps) {
  const [rows, setRows] = useState<ExploreRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    getDatasetRows(filename, { page: 1, pageSize: 100 })
      .then((response) => {
        if (isMounted) {
          setRows(response.rows);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRows([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filename]);

  const numericColumns = Object.keys(profile.statistics);
  const categoricalColumns = profile.column_info
    .map((column) => column.name)
    .filter((columnName) => isLikelyCategorical(columnName, profile));
  const primaryDateColumn = profile.date_columns[0];
  const primaryNumericColumn = numericColumns[0];
  const primaryCategoryColumn = categoricalColumns[0];

  const numericDistribution = Object.entries(profile.statistics)
    .slice(0, 6)
    .map(([name, stats]) => ({
      name: shortLabel(name),
      fullName: name,
      mean: stats.mean ?? 0,
      median: stats.median ?? 0,
    }));

  const missingValues = Object.entries(profile.missing_values)
    .map(([name, value]) => ({
      name: shortLabel(name),
      fullName: name,
      missing: value.count,
    }))
    .filter((item) => item.missing > 0)
    .sort((a, b) => b.missing - a.missing)
    .slice(0, 8);

  const topCategories = useMemo(() => {
    if (rows.length > 0 && primaryCategoryColumn) {
      return buildCategoryCounts(rows, primaryCategoryColumn);
    }

    return [...profile.column_info]
      .filter((column) => isLikelyCategorical(column.name, profile))
      .sort((a, b) => b.unique_values - a.unique_values)
      .slice(0, 6)
      .map((column) => ({
        name: shortLabel(column.name),
        fullName: column.name,
        count: column.unique_values,
      }));
  }, [primaryCategoryColumn, profile, rows]);

  const trendData = useMemo(() => {
    if (!primaryDateColumn || !primaryNumericColumn || rows.length === 0) {
      return [];
    }

    return buildTrend(rows, primaryDateColumn, primaryNumericColumn);
  }, [primaryDateColumn, primaryNumericColumn, rows]);

  const heatmapColumns = Object.keys(profile.statistics).slice(0, 5);
  const heatmapValues = heatmapColumns.flatMap((row, rowIndex) =>
    heatmapColumns.map((column, columnIndex) => {
      const rowStats = profile.statistics[row];
      const columnStats = profile.statistics[column];
      const rowScale = Math.abs(rowStats.mean ?? 0) + Math.abs(rowStats.std ?? 0);
      const columnScale =
        Math.abs(columnStats.mean ?? 0) + Math.abs(columnStats.std ?? 0);
      const similarity =
        rowIndex === columnIndex
          ? 1
          : 1 - Math.min(Math.abs(rowScale - columnScale) / (rowScale + columnScale + 1), 1);

      return {
        key: `${row}-${column}`,
        row,
        column,
        value: Number(similarity.toFixed(2)),
      };
    })
  );

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
            Analytics overview
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Dataset intelligence at a glance
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          Profile-driven visuals generated from the uploaded dataset.
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Numeric distribution
          </h3>
          <div className="mt-3 h-64">
            {numericDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={numericDistribution}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="mean" fill="#635BFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="median" fill="#00A3A3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No numeric columns detected." />
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Automatically compares mean and median for the strongest numeric
            measures detected in the dataset.
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            {trendData.length > 0 ? "Trend chart" : "Missing values chart"}
          </h3>
          <div className="mt-3 h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    dataKey="value"
                    name={primaryNumericColumn}
                    stroke="#635BFF"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#635BFF" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : missingValues.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missingValues} layout="vertical">
                  <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={92}
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="missing" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No trend or missing-value chart needed." />
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {trendData.length > 0
              ? `${primaryNumericColumn} is aggregated by ${primaryDateColumn} from the dataset preview to surface immediate time-based movement.`
              : "Missing-value analysis highlights fields that may need cleanup before reporting."}
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Top categories chart
          </h3>
          <div className="mt-3 h-64">
            {topCategories.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={topCategories}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                  >
                    {topCategories.map((entry, index) => (
                      <Cell
                        key={entry.fullName}
                        fill={palette[index % palette.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No columns available." />
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {primaryCategoryColumn
              ? `The workspace selected ${primaryCategoryColumn} as the first category breakdown for quick segmentation.`
              : "No strong categorical field was detected for segmentation."}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">
                Correlation heatmap
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Numeric relationship view based on profile statistics.
              </p>
            </div>
          </div>
          <div className="mt-4 min-h-64 overflow-x-auto">
            {heatmapColumns.length > 1 ? (
              <div
                className="grid min-w-[360px] gap-1"
                style={{
                  gridTemplateColumns: `96px repeat(${heatmapColumns.length}, minmax(48px, 1fr))`,
                }}
              >
                <div />
                {heatmapColumns.map((column) => (
                  <div
                    key={column}
                    className="truncate px-1 text-center text-[11px] font-medium text-slate-500"
                    title={column}
                  >
                    {shortLabel(column)}
                  </div>
                ))}
                {heatmapColumns.map((row) => (
                  <Fragment key={row}>
                    <div
                      className="truncate pr-2 text-right text-[11px] font-medium text-slate-500"
                      title={row}
                    >
                      {shortLabel(row)}
                    </div>
                    {heatmapValues
                      .filter((item) => item.row === row)
                      .map((item) => (
                        <div
                          key={item.key}
                          className="flex h-10 items-center justify-center rounded-md text-xs font-semibold text-white"
                          style={{
                            backgroundColor: `rgba(99, 91, 255, ${Math.max(
                              0.2,
                              item.value
                            )})`,
                          }}
                          title={`${item.row} / ${item.column}: ${item.value}`}
                        >
                          {item.value}
                        </div>
                      ))}
                  </Fragment>
                ))}
              </div>
            ) : (
              <EmptyChart message="At least two numeric columns are needed." />
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Multiple numeric columns are compared to reveal potential
            relationships worth investigating in the AI Copilot.
          </p>
        </Card>
      </div>
    </section>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-44 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
      {message}
    </div>
  );
}

export default AnalyticsOverview;
