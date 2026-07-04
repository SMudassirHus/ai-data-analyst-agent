import type { ReportPreview } from "../../api/reports";
import Card from "../ui/Card";

type ReportPreviewCardProps = {
  preview: ReportPreview;
};

function ReportPreviewCard({ preview }: ReportPreviewCardProps) {
  const metrics = [
    { label: "Findings", value: preview.findings_count },
    { label: "Opportunities", value: preview.opportunities_count },
    { label: "Risks", value: preview.risks_count },
    { label: "Charts", value: preview.generated_charts_count },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="border-b border-[#E5E7EB] bg-[#F7F8FB] p-5 lg:border-b-0 lg:border-r">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#635BFF]">
            PDF preview
          </p>
          <h3 className="mt-4 text-2xl font-semibold leading-tight text-[#111827]">
            Executive Analytics Report
          </h3>
          <p className="mt-4 text-sm leading-6 text-[#6B7280]">
            Dataset overview, quality assessment, findings, risks,
            opportunities, recommendations, forecasts, and chart summaries.
          </p>
          <div className="mt-6 h-1.5 rounded-full bg-slate-200">
            <div className="h-full w-4/5 rounded-full bg-[#635BFF]" />
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#635BFF]">
            Executive summary
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {preview.executive_summary}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Forecast availability:{" "}
            {preview.forecast_available ? "Available" : "Not attached"}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default ReportPreviewCard;
