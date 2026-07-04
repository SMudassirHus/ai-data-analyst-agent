import { AlertTriangle, CheckCircle2, Lightbulb, Target } from "lucide-react";

import type { DatasetProfile } from "../../api/profile";
import { formatNumber } from "../../utils/format";
import Card from "../ui/Card";

type ExecutiveBriefProps = {
  profile: DatasetProfile;
};

function ExecutiveBrief({ profile }: ExecutiveBriefProps) {
  const columnsWithMissing = Object.values(profile.missing_values).filter(
    (item) => item.count > 0
  ).length;
  const totalMissing = Object.values(profile.missing_values).reduce(
    (total, item) => total + item.count,
    0
  );
  const numericColumns = Object.keys(profile.statistics).length;
  const dateColumns = profile.date_columns.length;
  const confidence =
    profile.summary.rows >= 100 && profile.summary.columns >= 3
      ? "High"
      : profile.summary.rows >= 25
        ? "Medium"
        : "Directional";

  const items = [
    {
      label: "Key Findings",
      icon: CheckCircle2,
      tone: "blue",
      points: [
        `${formatNumber(profile.summary.rows)} rows and ${formatNumber(
          profile.summary.columns
        )} columns are available for analysis.`,
        `${numericColumns} numeric columns can support measures, ranking, charting, and forecasting candidates.`,
      ],
    },
    {
      label: "Risks",
      icon: AlertTriangle,
      tone: "amber",
      points:
        profile.warnings.length > 0
          ? profile.warnings.slice(0, 2)
          : ["No high-priority quality warnings were detected in profiling."],
    },
    {
      label: "Opportunities",
      icon: Lightbulb,
      tone: "blue",
      points: [
        dateColumns > 0
          ? `${dateColumns} date-like columns may support trend analysis and forecasting.`
          : "Add a date column to unlock stronger time-series analysis.",
        "Use AI visualization prompts to turn profile signals into business views.",
      ],
    },
    {
      label: "Recommendations",
      icon: Target,
      tone: "slate",
      points: [
        columnsWithMissing > 0
          ? `Review missing values across ${columnsWithMissing} columns before decision reporting.`
          : "Proceed to insights and reporting with current data quality checks.",
        profile.duplicates > 0
          ? `Validate ${formatNumber(profile.duplicates)} duplicate rows before final reporting.`
          : "No duplicate remediation is required from the current profile.",
      ],
    },
  ];

  return (
    <section className="space-y-3">
      <Card className="overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
              AI Business Analyst Summary
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Executive Summary
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This workspace automatically profiled the dataset, prepared
              chart-ready views, scanned quality signals, and generated a
              business briefing from the available evidence. The dataset has{" "}
              {formatNumber(profile.summary.rows)} rows,{" "}
              {formatNumber(profile.summary.columns)} columns,{" "}
              {formatNumber(totalMissing)} missing values, and{" "}
              {formatNumber(profile.duplicates)} duplicate rows.
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Recommended next move: review the automated charts, ask the AI
              Analyst for the highest-impact segment, then export the executive
              report once the quality notes are understood.
            </p>
          </div>

          <div className="border-t border-[#E5E7EB] bg-[#F7F8FB] p-5 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Confidence Level
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#111827]">
              {confidence}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Based on row volume, schema coverage, detected numeric/date
              fields, missing values, and duplicate rate.
            </p>
            <div className="mt-4 grid gap-2 text-xs font-semibold text-[#6B7280]">
              <span className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                Key Risks: {profile.warnings.length || columnsWithMissing}
              </span>
              <span className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                Opportunities: {numericColumns + dateColumns}
              </span>
              <span className="rounded-xl border border-[#E5E7EB] bg-white px-3 py-2">
                Suggested Actions: {items[3].points.length}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    item.tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : item.tone === "blue"
                        ? "bg-indigo-50 text-[#635BFF]"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-950">
                  {item.label}
                </h3>
              </div>
              <ul className="mt-4 space-y-2">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="text-sm leading-5 text-slate-600"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default ExecutiveBrief;
