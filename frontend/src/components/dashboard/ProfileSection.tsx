import {
  AlertTriangle,
  BarChart3,
  Columns3,
  Database,
  FileSpreadsheet,
  Gauge,
  ScanLine,
  Rows3,
  Sparkles,
} from "lucide-react";

import type { DatasetProfile } from "../../api/profile";
import type { UploadResponse } from "../../api/upload";
import { formatBytes, formatNumber, formatPercentage } from "../../utils/format";
import ChatPanel from "../chat/ChatPanel";
import ColumnExplorer from "../ColumnExplorer";
import DataExplorer from "../explorer/DataExplorer";
import FileUploadCard from "../FileUploadCard";
import ForecastingPanel from "../forecasting/ForecastingPanel";
import InsightsPanel from "../insights/InsightsPanel";
import ReportPanel from "../reports/ReportPanel";
import StatisticsCard from "../StatisticsCard";
import Badge from "../ui/Badge";
import Card from "../ui/Card";
import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";
import VisualizationPanel from "../visualization/VisualizationPanel";
import ActivityTimeline from "./ActivityTimeline";
import AnalyticsOverview from "./AnalyticsOverview";
import DataQualityPanel from "./DataQualityPanel";
import ExecutiveBrief from "./ExecutiveBrief";

export type ProfileState =
  | { status: "empty" }
  | { status: "loading"; filename: string }
  | { status: "success"; upload: UploadResponse; profile: DatasetProfile }
  | { status: "error"; upload: UploadResponse; message: string };

type ProfileSectionProps = {
  profileState: ProfileState;
  onUploadComplete?: (upload: UploadResponse) => void;
};

function getTotalMissingValues(profile: DatasetProfile) {
  return Object.values(profile.missing_values).reduce(
    (total, item) => total + item.count,
    0
  );
}

function getQualityScore(profile: DatasetProfile) {
  const totalCells = profile.summary.rows * profile.summary.columns;
  const missingPenalty =
    totalCells > 0 ? (getTotalMissingValues(profile) / totalCells) * 70 : 0;
  const duplicatePenalty =
    profile.summary.rows > 0
      ? (profile.duplicates / profile.summary.rows) * 20
      : 0;
  const warningPenalty = Math.min(profile.warnings.length * 3, 10);

  return Math.max(
    0,
    Math.round(100 - missingPenalty - duplicatePenalty - warningPenalty)
  );
}

function getHealthExplanations(profile: DatasetProfile) {
  const totalCells = profile.summary.rows * profile.summary.columns;
  const totalMissing = getTotalMissingValues(profile);
  const missingRate = totalCells > 0 ? (totalMissing / totalCells) * 100 : 0;
  const duplicateRate =
    profile.summary.rows > 0 ? (profile.duplicates / profile.summary.rows) * 100 : 0;
  const outlierColumns = Object.entries(profile.statistics).filter(([, stats]) => {
    if (stats.mean === null || stats.std === null || stats.std === 0) {
      return false;
    }

    return (
      (stats.max !== null && stats.max > stats.mean + stats.std * 3) ||
      (stats.min !== null && stats.min < stats.mean - stats.std * 3)
    );
  }).length;

  return [
    `${missingRate.toFixed(2)}% of cells are missing across the profiled dataset.`,
    `${duplicateRate.toFixed(2)}% of rows are exact duplicates.`,
    profile.date_columns.length > 0
      ? `${profile.date_columns.length} date-like columns were detected for trend analysis.`
      : "No date-like columns were detected, so time-series analysis may be limited.",
    outlierColumns > 0
      ? `${outlierColumns} numeric columns show potential outlier ranges.`
      : "No obvious numeric outlier ranges were detected from summary statistics.",
  ];
}

function formatUploadedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function DatasetKpiStrip({ profile }: { profile: DatasetProfile }) {
  const totalMissing = getTotalMissingValues(profile);
  const qualityScore = getQualityScore(profile);
  const kpis = [
    {
      label: "Rows",
      value: formatNumber(profile.summary.rows),
      detail: "records loaded",
      icon: Rows3,
    },
    {
      label: "Columns",
      value: formatNumber(profile.summary.columns),
      detail: "fields detected",
      icon: Columns3,
    },
    {
      label: "Missing Values",
      value: formatNumber(totalMissing),
      detail:
        profile.summary.rows * profile.summary.columns > 0
          ? formatPercentage(
              (totalMissing /
                (profile.summary.rows * profile.summary.columns)) *
                100
            )
          : "0.00%",
      icon: AlertTriangle,
    },
    {
      label: "Duplicates",
      value: formatNumber(profile.duplicates),
      detail: "matching rows",
      icon: Database,
    },
    {
      label: "Quality Score",
      value: `${qualityScore}`,
      detail: qualityScore >= 85 ? "strong" : qualityScore >= 70 ? "review" : "needs work",
      icon: Gauge,
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Card
            key={kpi.label}
            as="article"
            className="p-4 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {kpi.detail}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#635BFF] shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}

function DatasetSummaryPanel({
  upload,
  profile,
}: {
  upload: UploadResponse;
  profile: DatasetProfile;
}) {
  const totalMissing = getTotalMissingValues(profile);

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-sm">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold text-slate-950">
                {upload.original_filename}
              </h2>
              <Badge variant="success">Analysis ready</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {formatNumber(profile.summary.rows)} rows,{" "}
              {formatNumber(profile.summary.columns)} columns,{" "}
              {formatBytes(upload.size_bytes)} uploaded{" "}
              {formatUploadedAt(upload.uploaded_at)}
            </p>
          </div>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-4 xl:min-w-[520px]">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3 py-2">
            <dt className="text-xs font-medium text-slate-500">File type</dt>
            <dd className="mt-1 font-semibold uppercase text-slate-950">
              {upload.file_type}
            </dd>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3 py-2">
            <dt className="text-xs font-medium text-slate-500">Memory</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {profile.summary.memory_usage_mb.toFixed(2)} MB
            </dd>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3 py-2">
            <dt className="text-xs font-medium text-slate-500">Missing</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatNumber(totalMissing)}
            </dd>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3 py-2">
            <dt className="text-xs font-medium text-slate-500">Dates</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {profile.date_columns.length}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}

function LiveAnalysisStatus({
  upload,
  profile,
}: {
  upload: UploadResponse;
  profile: DatasetProfile;
}) {
  const uploadedAt = new Date(upload.uploaded_at);
  const uploadedTime = Number.isNaN(uploadedAt.getTime())
    ? "just now"
    : new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(uploadedAt);
  const steps = [
    { label: "Dataset uploaded", icon: FileSpreadsheet, time: uploadedTime },
    { label: "Schema detected", icon: Columns3, time: "just now" },
    { label: "Quality scanned", icon: ScanLine, time: "just now" },
    { label: "Charts generated", icon: BarChart3, time: "just now" },
    { label: "AI insights ready", icon: Sparkles, time: "just now" },
    { label: "Report ready", icon: Database, time: "just now" },
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
            Live Analysis Status
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {formatNumber(profile.summary.rows)} rows scanned and workspace
            assets generated automatically.
          </p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-[#16A34A]">
          All systems ready
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.label}
              className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#635BFF] shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#111827]">
                    {step.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280]">
                    {step.time}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DatasetHealthBanner({ profile }: { profile: DatasetProfile }) {
  const healthScore = getQualityScore(profile);
  const explanations = getHealthExplanations(profile);

  return (
    <Card className="border-[#E5E7EB] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#111827]">
            Analysis ready - {formatNumber(profile.summary.rows)} rows scanned -{" "}
            {formatNumber(profile.summary.columns)} fields detected
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            Ask a question, generate a chart, or export an executive report.
          </p>
          <div className="mt-3 grid gap-2 text-xs text-[#6B7280] md:grid-cols-2">
            {explanations.map((explanation) => (
              <p key={explanation} className="rounded-xl bg-[#F7F8FB] px-3 py-2">
                {explanation}
              </p>
            ))}
          </div>
        </div>
        <div className="shrink-0 rounded-xl border border-[#E5E7EB] bg-white p-4 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Dataset Health Score
          </p>
          <p className="mt-2 text-3xl font-semibold text-[#111827]">
            {healthScore}/100
          </p>
          <p className="mt-1 max-w-48 text-xs text-[#6B7280]">
            Completeness, duplicates, dates, and outlier signals
          </p>
        </div>
      </div>
    </Card>
  );
}

function SmartRecommendations({ profile }: { profile: DatasetProfile }) {
  const columnNames = profile.column_info.map((column) => column.name.toLowerCase());
  const has = (keyword: string) =>
    columnNames.some((columnName) => columnName.includes(keyword));
  const recommendations = [
    has("churn") || has("attrition")
      ? "Analyze customer churn or employee attrition drivers."
      : null,
    has("region") || has("country") || has("state")
      ? "Investigate regional performance and concentration risk."
      : null,
    has("revenue") || has("sales") || has("profit")
      ? "Compare revenue, sales, or profit by category and segment."
      : null,
    profile.date_columns.length > 0
      ? "Forecast monthly growth using detected date fields."
      : null,
    profile.duplicates > 0
      ? "Resolve duplicate records before final executive reporting."
      : null,
    Object.keys(profile.statistics).length > 1
      ? "Review numeric relationships in the correlation heatmap."
      : null,
  ].filter(Boolean) as string[];

  const fallbackRecommendations = [
    "Identify the most important categorical segments.",
    "Review missing values before publishing results.",
    "Ask the AI Analyst which columns deserve deeper investigation.",
  ];

  const visibleRecommendations =
    recommendations.length > 0 ? recommendations : fallbackRecommendations;

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
            Smart recommendations
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Recommended next steps
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Suggested automatically from detected columns, profile quality, and
          available numeric/date fields.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleRecommendations.slice(0, 6).map((recommendation) => (
          <div
            key={recommendation}
            className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] px-3 py-3 text-sm font-medium text-[#111827]"
          >
            {recommendation}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProfileSection({ profileState, onUploadComplete }: ProfileSectionProps) {
  if (profileState.status === "empty") {
    return (
      <EmptyState
        title="No dataset profile yet"
        description="Upload a CSV or Excel file to generate a dashboard with dataset overview, quality checks, column exploration, and numeric statistics."
      />
    );
  }

  if (profileState.status === "loading") {
    return (
      <LoadingState
        title="Profiling dataset"
        description={`Reading ${profileState.filename} and calculating quality metrics.`}
      />
    );
  }

  if (profileState.status === "error") {
    return (
      <EmptyState
        title="Unable to profile dataset"
        description={profileState.message}
      />
    );
  }

  return (
    <div className="space-y-5">
      <section id="upload-dataset" className="scroll-mt-24">
        <FileUploadCard onUploadComplete={onUploadComplete} />
      </section>

      <section id="overview" className="scroll-mt-24 space-y-5">
        <LiveAnalysisStatus
          upload={profileState.upload}
          profile={profileState.profile}
        />
        <DatasetSummaryPanel
          upload={profileState.upload}
          profile={profileState.profile}
        />
      </section>

      <section id="kpi-overview" className="scroll-mt-24 space-y-5">
        <DatasetKpiStrip profile={profileState.profile} />
        <DatasetHealthBanner profile={profileState.profile} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="min-w-0 space-y-5">
          <section id="dashboards" className="scroll-mt-24">
            <AnalyticsOverview
              filename={profileState.upload.filename}
              profile={profileState.profile}
            />
            <div className="mt-5">
              <VisualizationPanel
                filename={profileState.upload.filename}
                columns={profileState.profile.column_info}
              />
            </div>
          </section>

          <section id="insights" className="scroll-mt-24 space-y-5">
            <ExecutiveBrief profile={profileState.profile} />
            <SmartRecommendations profile={profileState.profile} />
            <InsightsPanel filename={profileState.upload.filename} />
          </section>

          <section id="data-quality" className="scroll-mt-24">
            <DataQualityPanel profile={profileState.profile} />
          </section>

          <section id="explore-data" className="scroll-mt-24">
            <div className="mb-3">
              <h2 className="text-base font-semibold text-slate-950">
                Data Workspace
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Inspect rows, columns, and numeric metrics without leaving the
                dashboard.
              </p>
            </div>
            <DataExplorer filename={profileState.upload.filename} />
          </section>

          <section id="ai-analyst" className="scroll-mt-24">
            <ChatPanel
              filename={profileState.upload.filename}
              rowsAnalyzed={profileState.profile.summary.rows}
              columnsAnalyzed={profileState.profile.summary.columns}
            />
          </section>

          <section id="forecasting" className="scroll-mt-24">
            <ForecastingPanel
              filename={profileState.upload.filename}
              columns={profileState.profile.column_info}
            />
          </section>

          <div className="grid gap-5 2xl:grid-cols-2">
            <ColumnExplorer columns={profileState.profile.column_info} />
            <StatisticsCard statistics={profileState.profile.statistics} />
          </div>

          <section id="reports" className="scroll-mt-24">
            <ReportPanel filename={profileState.upload.filename} />
          </section>

          <section id="settings" className="scroll-mt-24">
            <Card className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
                Settings
              </p>
              <h2 className="mt-1 text-base font-semibold text-slate-950">
                Workspace settings
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Local demo workspace settings are intentionally minimal for this
                portfolio build. Backend API configuration and keys remain in the
                backend environment file.
              </p>
            </Card>
          </section>
        </div>

        <aside
          className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start"
        >
          <ActivityTimeline
            upload={profileState.upload}
            profile={profileState.profile}
          />
        </aside>
      </div>
    </div>
  );
}

export default ProfileSection;
