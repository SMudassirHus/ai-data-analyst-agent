import { useEffect, useState } from "react";
import {
  BarChart3,
  Bot,
  FileText,
  LineChart,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getDatasetProfile } from "../api/profile";
import { uploadSampleDataset, type UploadResponse } from "../api/upload";
import ProfileSection, {
  type ProfileState,
} from "../components/dashboard/ProfileSection";
import FileUploadCard from "../components/FileUploadCard";
import LiveAssistantWidget from "../components/landing/LiveAssistantWidget";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { sampleDatasets, type SampleDataset } from "../data/sampleDatasets";

const workspaceStorageKey = "ai-data-analyst-workspace";

type HomePageProps = {
  isWorkspaceRoute: boolean;
  onNavigateLanding: () => void;
  onNavigateWorkspace: () => void;
};

function HomePage({
  isWorkspaceRoute,
  onNavigateLanding,
  onNavigateWorkspace,
}: HomePageProps) {
  const [profileState, setProfileState] = useState<ProfileState>({
    status: "empty",
  });

  useEffect(() => {
    if (profileState.status === "success") {
      localStorage.setItem(workspaceStorageKey, JSON.stringify(profileState));
    }
  }, [profileState]);

  async function handleUploadComplete(upload: UploadResponse) {
    onNavigateWorkspace();
    setProfileState({ status: "loading", filename: upload.filename });

    try {
      const profile = await getDatasetProfile(upload.filename);
      setProfileState({ status: "success", upload, profile });
    } catch (error: unknown) {
      setProfileState({
        status: "error",
        upload,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load dataset profile.",
      });
    }
  }

  function handleClearWorkspace() {
    localStorage.removeItem(workspaceStorageKey);
    Object.keys(localStorage)
      .filter(
        (key) =>
          key.startsWith("ai-data-analyst-chat-") ||
          key.startsWith("ai-data-analyst-insights-")
      )
      .forEach((key) => localStorage.removeItem(key));
    setProfileState({ status: "empty" });
    onNavigateLanding();
  }

  const datasetName =
    profileState.status === "success"
      ? profileState.upload.original_filename
      : profileState.status === "loading"
        ? profileState.filename
        : "No dataset selected";

  const datasetStatus =
    profileState.status === "success"
      ? "Analysis ready"
      : profileState.status === "loading"
        ? "Profiling"
        : profileState.status === "error"
          ? "Needs attention"
          : "Waiting for upload";

  const lastUpdated =
    profileState.status === "success"
      ? "just now"
      : profileState.status === "loading"
        ? "now"
        : "never";

  if (!isWorkspaceRoute) {
    return (
      <LandingMode
        onLaunchWorkspace={onNavigateWorkspace}
        onUploadComplete={handleUploadComplete}
      />
    );
  }

  return (
    <AppShell
      datasetName={datasetName}
      datasetStatus={datasetStatus}
      lastUpdated={lastUpdated}
      fileType={profileState.status === "success" ? profileState.upload.file_type : undefined}
      rowCount={profileState.status === "success" ? profileState.profile.summary.rows : undefined}
      onClearWorkspace={handleClearWorkspace}
    >
      <div className="mx-auto max-w-[1600px] space-y-6">
        {profileState.status === "empty" ? (
          <WorkspaceStarter onUploadComplete={handleUploadComplete} />
        ) : (
          <ProfileSection
            profileState={profileState}
            onUploadComplete={handleUploadComplete}
          />
        )}
      </div>
    </AppShell>
  );
}

type LandingModeProps = {
  onLaunchWorkspace: () => void;
  onUploadComplete: (upload: UploadResponse) => void;
};

const capabilityCards = [
  {
    title: "Auto Dashboard",
    description: "Instant KPIs, category views, distributions, trends, and quality signals.",
    icon: BarChart3,
  },
  {
    title: "AI Analyst",
    description: "Ask questions in plain English using compact dataset context only.",
    icon: Bot,
  },
  {
    title: "Data Quality",
    description: "Surface missing values, duplicates, date readiness, and outlier signals.",
    icon: ShieldCheck,
  },
  {
    title: "Forecasting",
    description: "Generate baseline trend forecasts when date and numeric fields exist.",
    icon: LineChart,
  },
  {
    title: "Executive Reports",
    description: "Package dashboards and recommendations into business-ready reports.",
    icon: FileText,
  },
];

function LandingMode({ onLaunchWorkspace, onUploadComplete }: LandingModeProps) {
  const [demoState, setDemoState] = useState<{
    status: "idle" | "loading" | "error";
    sampleId?: SampleDataset["id"];
    message?: string;
  }>({ status: "idle" });

  function scrollToDemo() {
    document.getElementById("demo-data")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleUseDemoDataset(sample: SampleDataset) {
    if (demoState.status === "loading") {
      return;
    }

    setDemoState({ status: "loading", sampleId: sample.id });

    try {
      const upload = await uploadSampleDataset(sample.id);
      onUploadComplete(upload);
    } catch (error: unknown) {
      setDemoState({
        status: "error",
        sampleId: sample.id,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load demo dataset.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#111827]">
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-sm font-black text-white shadow-sm">
              IP
            </div>
            <div>
              <p className="text-sm font-semibold text-[#111827]">InsightPilot AI</p>
              <p className="text-xs text-[#6B7280]">AI business intelligence workspace</p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#6B7280] md:flex">
            <a href="#product" className="hover:text-[#111827]">Product</a>
            <a href="#features" className="hover:text-[#111827]">Features</a>
            <a href="#demo-data" className="hover:text-[#111827]">Demo</a>
            <a href="#reports" className="hover:text-[#111827]">Reports</a>
            <a href="https://github.com" className="hover:text-[#111827]">GitHub</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onLaunchWorkspace}>
              Try Free
            </Button>
            <Button onClick={onLaunchWorkspace}>Launch Workspace</Button>
          </div>
        </div>
      </header>

      <main>
        <section
          id="product"
          className="relative overflow-hidden border-b border-[#E5E7EB] bg-[radial-gradient(circle_at_top_left,rgba(99,91,255,0.14),transparent_34%),linear-gradient(135deg,#FFFFFF_0%,#F7F8FB_48%,#F4F1FF_100%)]"
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(99,91,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,91,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-12">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/85 px-3 py-1 text-xs font-semibold text-[#635BFF] shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI-powered analytics workspace
              </div>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-[#111827] lg:text-5xl">
                Turn spreadsheets into business intelligence
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#6B7280] lg:text-lg">
                Upload CSV or Excel files and instantly generate dashboards,
                data quality checks, AI insights, forecasts, and executive
                reports.
              </p>

              <div className="mt-5 flex w-fit max-w-full items-center gap-2 rounded-full border border-[#E5E7EB] bg-white/90 px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm backdrop-blur">
                <span className="relative h-2 w-2 shrink-0 rounded-full bg-[#16A34A]">
                  <span
                    className="absolute inset-0 rounded-full bg-[#16A34A] opacity-75 animate-ping"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-[#6B7280]">Live workspace</span>
                <span className="text-[#6B7280]">{"\u00B7"}</span>
                <span>dashboards generated</span>
                <span className="text-[#6B7280]">{"\u00B7"}</span>
                <span>insights ready</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={onLaunchWorkspace}>Try Free</Button>
                <Button variant="secondary" onClick={onLaunchWorkspace}>
                  Launch Workspace
                </Button>
                <button
                  type="button"
                  className="text-sm font-semibold text-[#635BFF] transition hover:text-[#5148E5]"
                  onClick={scrollToDemo}
                >
                  View Demo
                </button>
              </div>

              <div className="mt-7 max-w-xl rounded-2xl border border-[#E5E7EB] bg-white/95 p-3 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#635BFF]">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                    placeholder="Ask your data: What changed this month?"
                    readOnly
                  />
                  <Button className="min-h-9 px-4" onClick={onLaunchWorkspace}>
                    Start
                  </Button>
                </div>
                <p className="mt-3 px-1 text-xs font-medium text-[#6B7280]">
                  Ask a business question, then launch the workspace to connect your dataset.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
                    Sales analytics preview
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[#111827]">
                    Executive workspace
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-[#16A34A]">
                  Live
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {[
                  ["Revenue", "$1.24M"],
                  ["Rows scanned", "24.8K"],
                  ["Data quality", "94/100"],
                  ["Forecast", "+8.2%"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                      {label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#111827]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#111827]">
                      Revenue by segment
                    </p>
                    <span className="text-xs font-medium text-[#6B7280]">
                      Auto chart
                    </span>
                  </div>
                  <div className="flex h-40 items-end gap-2">
                    {[42, 64, 38, 80, 54, 72, 92].map((height, index) => (
                      <div
                        key={index}
                        className="flex-1 rounded-t-md bg-[#635BFF]/80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#635BFF]">
                      AI insight
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#111827]">
                      Enterprise segment is driving the strongest revenue
                      growth while data quality remains report-ready.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-[#111827]">
                      Activity feed
                    </p>
                    <div className="mt-3 space-y-3">
                      {[
                        "Dataset uploaded",
                        "Schema detected",
                        "Dashboard generated",
                        "Insights ready",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-[#6B7280]"
                        >
                          <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-6">
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ["3", "sample datasets"],
              ["5", "analysis engines"],
              ["PDF", "export ready"],
              ["Private", "dataset context only"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm"
              >
                <p className="text-2xl font-semibold text-[#111827]">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-[#6B7280]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {capabilityCards.map((card) => {
              const Icon = card.icon;

              return (
                <Card key={card.title} className="p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#635BFF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-[#111827]">
                    {card.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                    {card.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="demo-data" className="mx-auto max-w-7xl px-5 py-10">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
              Demo datasets
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#111827]">View the product with sample data</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#6B7280]">
              Choose a realistic demo dataset and the workspace will generate
              analysis automatically.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {sampleDatasets.map((sample) => (
              <Card key={sample.id} className="p-4">
                <h3 className="text-base font-semibold text-[#111827]">
                  {sample.name.replace(" Dataset", "")}
                </h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#6B7280]">
                  {sample.description}
                </p>
                <Button
                  className="mt-5 w-full gap-2"
                  disabled={demoState.status === "loading"}
                  onClick={() => handleUseDemoDataset(sample)}
                >
                  {demoState.status === "loading" &&
                  demoState.sampleId === sample.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Use Demo Dataset
                </Button>
                {demoState.status === "error" &&
                  demoState.sampleId === sample.id && (
                    <p className="mt-3 text-sm font-medium text-[#EF4444]">
                      {demoState.message}
                    </p>
                  )}
              </Card>
            ))}
          </div>
        </section>

        <section id="reports" className="mx-auto max-w-7xl px-5 pb-16">
          <Card className="p-6 text-center">
            <h2 className="text-2xl font-semibold text-[#111827]">
              Ready to turn data into decisions?
            </h2>
            <p className="mt-2 text-sm text-[#6B7280]">
              Dashboards, insights, forecasts, and reports are generated after upload.
            </p>
            <Button className="mt-5" onClick={onLaunchWorkspace}>
              Try Free
            </Button>
            <Button className="mt-5 ml-3" variant="secondary" onClick={onLaunchWorkspace}>
              Launch Workspace
            </Button>
          </Card>
        </section>
      </main>
      <LiveAssistantWidget
        onLaunchWorkspace={onLaunchWorkspace}
        onShowDemo={scrollToDemo}
      />
    </div>
  );
}

function WorkspaceStarter({
  onUploadComplete,
}: {
  onUploadComplete: (upload: UploadResponse) => void;
}) {
  return (
    <div className="space-y-6">
      <section id="upload-dataset" className="scroll-mt-24">
        <FileUploadCard onUploadComplete={onUploadComplete} />
      </section>

      <section id="overview" className="scroll-mt-24">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#635BFF]">
            Workspace ready
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[#111827]">
            Upload a dataset to generate the analytics workspace
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]">
            The sidebar and command bar are active. Add a CSV or Excel file to
            generate KPIs, dashboards, insights, quality checks, AI Copilot
            context, forecasts, and reports.
          </p>
        </Card>
      </section>

      {[
        ["kpi-overview", "KPI overview will appear after profiling."],
        ["dashboards", "Dashboards will appear after profiling."],
        ["insights", "AI Business Analyst Summary will appear after profiling."],
        ["data-quality", "Data quality checks will appear after profiling."],
        ["explore-data", "Dataset rows will appear after upload."],
        ["ai-analyst", "AI Analyst will activate after dataset context loads."],
        ["forecasting", "Forecasting will activate when suitable columns exist."],
        ["reports", "Executive reports will be available after analysis."],
        ["settings", "Workspace settings are ready."],
      ].map(([id, message]) => (
        <section key={id} id={id} className="scroll-mt-24">
          <Card className="p-4">
            <p className="text-sm font-medium text-[#6B7280]">{message}</p>
          </Card>
        </section>
      ))}
    </div>
  );
}

export default HomePage;
