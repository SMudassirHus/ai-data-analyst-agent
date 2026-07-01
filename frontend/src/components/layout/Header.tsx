import { useEffect, useState } from "react";
import {
  BarChart3,
  CircleDot,
  FileText,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import { getHealth } from "../../api/client";
import Badge from "../ui/Badge";

type ApiStatus = "checking" | "online" | "offline";

type HeaderProps = {
  datasetName: string;
  datasetStatus: string;
  lastUpdated: string;
  fileType?: string;
  rowCount?: number;
  onClearWorkspace?: () => void;
};

function Header({
  datasetName,
  datasetStatus,
  lastUpdated,
  fileType,
  rowCount,
  onClearWorkspace,
}: HeaderProps) {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then(() => {
        if (isMounted) {
          setApiStatus("online");
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus("offline");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabel =
    apiStatus === "online"
      ? "API Online"
      : apiStatus === "offline"
        ? "API Offline"
        : "Checking API";

  const statusVariant =
    apiStatus === "online"
      ? "success"
      : apiStatus === "offline"
        ? "amber"
        : "slate";

  return (
    <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 px-4 py-3 backdrop-blur sm:px-5 lg:px-6">
      <div className="flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-sm font-black text-white shadow-sm">
            IP
          </div>
          <div>
            <p className="text-sm font-semibold text-[#111827]">
              InsightPilot AI
            </p>
            <p className="text-xs text-[#6B7280]">
              AI business intelligence workspace
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#635BFF] shadow-sm sm:flex">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B7280]">
              Workspace Command Bar
            </p>
            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold text-[#111827]">
                {datasetName}
              </h1>
              <Badge variant="blue">{datasetStatus}</Badge>
              {fileType && (
                <span className="rounded-full border border-[#E5E7EB] bg-white px-2.5 py-1 text-xs font-semibold uppercase text-[#6B7280]">
                  {fileType}
                </span>
              )}
              {typeof rowCount === "number" && (
                <span className="text-xs text-[#6B7280]">
                  {rowCount.toLocaleString()} rows
                </span>
              )}
              <span className="text-xs text-[#6B7280]">
                Last updated {lastUpdated}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#6B7280] shadow-sm">
            <CircleDot className="h-3.5 w-3.5 fill-[#16A34A] text-[#16A34A]" />
            Live analysis running - Dataset context loaded - Insights ready
          </span>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <a
            href="#upload-dataset"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#635BFF] hover:text-[#635BFF]"
          >
            <UploadCloud className="h-4 w-4" />
            Upload
          </a>
          <a
            href="#insights"
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#635BFF] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5148E5]"
          >
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </a>
          <a
            href="#reports"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#635BFF] hover:text-[#635BFF]"
          >
            <FileText className="h-4 w-4" />
            Export Report
          </a>
          {onClearWorkspace && (
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#6B7280] shadow-sm transition hover:border-[#EF4444] hover:text-[#EF4444]"
              onClick={onClearWorkspace}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
