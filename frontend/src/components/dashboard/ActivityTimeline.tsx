import {
  Bot,
  CheckCircle2,
  FileText,
  ScanLine,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import type { DatasetProfile } from "../../api/profile";
import type { UploadResponse } from "../../api/upload";
import Card from "../ui/Card";

type ActivityTimelineProps = {
  upload: UploadResponse;
  profile: DatasetProfile;
};

function ActivityTimeline({ upload, profile }: ActivityTimelineProps) {
  const uploadedAt = new Date(upload.uploaded_at);
  const uploadedTime = Number.isNaN(uploadedAt.getTime())
    ? "just now"
    : new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(uploadedAt);

  const activities = [
    {
      label: "Dataset uploaded",
      detail: `${upload.original_filename} stored as ${upload.filename}`,
      icon: UploadCloud,
      status: "Complete",
      time: uploadedTime,
    },
    {
      label: "Profile generated",
      detail: `${profile.summary.rows.toLocaleString()} rows and ${profile.summary.columns.toLocaleString()} columns analyzed`,
      icon: CheckCircle2,
      status: "Complete",
      time: "just now",
    },
    {
      label: "Quality scan completed",
      detail:
        profile.warnings.length > 0
          ? `${profile.warnings.length} quality warnings surfaced for review.`
          : "No high-priority quality warnings detected.",
      icon: ScanLine,
      status: "Complete",
      time: "just now",
    },
    {
      label: "AI context prepared",
      detail: "Dataset schema, profile metrics, and sample rows are ready.",
      icon: Bot,
      status: "Ready",
      time: "just now",
    },
    {
      label: "Insights ready",
      detail: "Generate an executive brief, chart, forecast, or report.",
      icon: Sparkles,
      status: "Ready",
      time: "just now",
    },
    {
      label: "Report ready",
      detail: "Executive report generation is available for this workspace.",
      icon: FileText,
      status: "Ready",
      time: "just now",
    },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
            Timeline
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            Workspace progress
          </h2>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <div key={activity.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF] ring-1 ring-indigo-100">
                  <Icon className="h-4 w-4" />
                </div>
                {index < activities.length - 1 && (
                  <div className="h-8 w-px bg-slate-200" />
                )}
              </div>
              <div className="min-w-0 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-950">
                    {activity.label}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {activity.status}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {activity.time}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {activity.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ActivityTimeline;
