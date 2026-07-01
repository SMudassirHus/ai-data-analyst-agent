import { useState } from "react";
import { FileText } from "lucide-react";

import {
  generateReport,
  type ReportGenerateResponse,
} from "../../api/reports";
import Card from "../ui/Card";
import DownloadReportCard from "./DownloadReportCard";
import GenerateReportButton from "./GenerateReportButton";
import ReportPreviewCard from "./ReportPreviewCard";

type ReportPanelProps = {
  filename?: string;
};

function ReportPanel({ filename }: ReportPanelProps) {
  const [report, setReport] = useState<ReportGenerateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!filename || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateReport(filename);
      setReport(response);
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error ? apiError.message : "Unable to generate report."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF] ring-1 ring-indigo-100">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
                Board-ready output
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Executive Report
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Generate a business-ready PDF report with analysis, insights, and
                recommendations.
              </p>
            </div>
          </div>
          <GenerateReportButton
            disabled={!filename}
            isLoading={isLoading}
            onClick={handleGenerate}
          />
        </div>
      </div>

      <div className="space-y-5 bg-slate-50/70 p-5">
        {isLoading && (
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
            <div className="grid gap-3 md:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!report && !isLoading && !error && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-950">
              No report generated yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Generate an executive PDF after reviewing the profile, insights,
              visualizations, and forecast sections.
            </p>
          </div>
        )}

        {report && (
          <>
            <DownloadReportCard
              reportId={report.report_id}
              downloadUrl={report.download_url}
            />
            <ReportPreviewCard preview={report.preview} />
          </>
        )}
      </div>
    </Card>
  );
}

export default ReportPanel;
