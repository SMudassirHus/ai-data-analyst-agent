import {
  BarChart3,
  Bot,
  Database,
  FileText,
  LineChart,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react";

import Badge from "../ui/Badge";
import Card from "../ui/Card";

type WorkflowStepsProps = {
  aiFeaturesEnabled?: boolean;
};

type WorkflowStatus = "Live" | "Built" | "Not Available";

function WorkflowSteps({ aiFeaturesEnabled = false }: WorkflowStepsProps) {
  const aiStatus: WorkflowStatus = aiFeaturesEnabled ? "Live" : "Built";
  const steps: Array<{
    title: string;
    description: string;
    status: WorkflowStatus;
    icon: typeof UploadCloud;
  }> = [
    {
      title: "Upload Data",
      description: "Import CSV, XLSX, or XLS datasets into the local workspace.",
      status: "Live",
      icon: UploadCloud,
    },
    {
      title: "Profile Dataset",
      description: "Generate row counts, schema details, quality checks, and stats.",
      status: "Live",
      icon: Database,
    },
    {
      title: "Explore Columns",
      description: "Search, sort, and inspect column-level metadata.",
      status: "Live",
      icon: Search,
    },
    {
      title: "AI Chat",
      description: "Ask business questions using compact dataset context.",
      status: aiStatus,
      icon: Bot,
    },
    {
      title: "Visualizations",
      description: "Generate chart-ready views from natural-language prompts.",
      status: "Built",
      icon: BarChart3,
    },
    {
      title: "Business Insights",
      description: "Create executive findings, risks, opportunities, and actions.",
      status: aiStatus,
      icon: Sparkles,
    },
    {
      title: "Forecasting",
      description: "Usable for datasets with date and numeric time-series fields.",
      status: "Built",
      icon: LineChart,
    },
    {
      title: "Export Reports",
      description: "Package analysis into business-ready PDF reports.",
      status: "Built",
      icon: FileText,
    },
  ];

  function statusVariant(status: WorkflowStatus) {
    if (status === "Live") {
      return "success";
    }

    if (status === "Built") {
      return "blue";
    }

    return "slate";
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Product Workflow
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Core analytics capabilities available in this workspace.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step) => {
          const Icon = step.icon;

          return (
          <Card
            as="article"
            key={step.title}
            className="p-4 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="truncate text-sm font-semibold text-slate-950">
                  {step.title}
                </h3>
              </div>
              <Badge variant={statusVariant(step.status)}>{step.status}</Badge>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-600">
              {step.description}
            </p>
          </Card>
          );
        })}
      </div>
    </section>
  );
}

export default WorkflowSteps;
