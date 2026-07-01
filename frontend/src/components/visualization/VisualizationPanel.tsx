import { BarChart3, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  createVisualization,
  type VisualizationResponse,
} from "../../api/visualization";
import type { ColumnInfo } from "../../api/profile";
import Card from "../ui/Card";
import ChartPromptInput from "./ChartPromptInput";
import ChartRenderer from "./ChartRenderer";
import ChartSuggestions from "./ChartSuggestions";

type VisualizationPanelProps = {
  filename?: string;
  columns: ColumnInfo[];
};

function isNumeric(column: ColumnInfo) {
  return ["int", "float", "double", "decimal"].some((type) =>
    column.data_type.toLowerCase().includes(type)
  );
}

function buildSuggestions(columns: ColumnInfo[]) {
  const names = columns.map((column) => column.name);
  const lowerNames = names.map((name) => name.toLowerCase());
  const has = (keyword: string) => lowerNames.some((name) => name.includes(keyword));
  const numeric = columns.filter(isNumeric).map((column) => column.name);
  const suggestions: string[] = [];

  if (has("attrition") || has("department")) {
    suggestions.push(
      "Show attrition by department",
      "Show average monthly income by department",
      "Show employee count by age group",
      "Show job satisfaction by department",
      "Show overtime distribution"
    );
  } else if (has("sales") || has("profit") || has("region")) {
    suggestions.push(
      "Show sales by region",
      "Create a bar chart of top categories",
      "Show monthly sales trend",
      "Compare profit and sales",
      "Show count by category"
    );
  } else if (has("campaign") || has("channel") || has("revenue")) {
    suggestions.push(
      "Show revenue by channel",
      "Show conversions by channel",
      "Compare spend and revenue",
      "Show leads by audience",
      "Show monthly campaign revenue trend"
    );
  }

  if (suggestions.length === 0) {
    const category = names.find((name) => !numeric.includes(name)) ?? names[0];
    const value = numeric[0];
    const secondValue = numeric[1];

    if (category && value) {
      suggestions.push(`Show ${value} by ${category}`);
      suggestions.push(`Create a bar chart of ${value} by ${category}`);
    }

    if (value && secondValue) {
      suggestions.push(`Compare ${value} and ${secondValue}`);
    }

    suggestions.push("Show count by category");
  }

  return [...new Set(suggestions)].slice(0, 5);
}

function VisualizationPanel({ filename, columns }: VisualizationPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [chart, setChart] = useState<VisualizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = !filename;
  const suggestions = buildSuggestions(columns);

  async function generate(promptText: string) {
    const trimmedPrompt = promptText.trim();

    if (!trimmedPrompt || !filename || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrompt("");

    try {
      const nextChart = await createVisualization({
        filename,
        message: trimmedPrompt,
      });
      setChart(nextChart);
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to generate visualization."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF] ring-1 ring-indigo-100">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Chart workspace
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                AI Visualization Agent
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Ask the analyst to create decision-ready charts from this dataset.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#635BFF]">
            <Sparkles className="h-3.5 w-3.5" />
            Chart JSON
          </span>
        </div>

        <div className="mt-5">
          <ChartSuggestions
            suggestions={suggestions}
            disabled={isDisabled || isLoading}
            onSelect={generate}
          />
        </div>
      </div>

      <div className="min-h-[430px] space-y-5 bg-slate-50/70 p-5">
        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Planning and preparing chart data...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!chart && !isLoading && !error && (
          <div className="flex min-h-[290px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-[#635BFF] ring-1 ring-indigo-100">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-950">
              No visualization generated yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Select a suggested prompt or describe the comparison, trend, or
              category breakdown you want to see.
            </p>
          </div>
        )}

        {chart && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">
                {chart.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{chart.insight}</p>
            </div>

            <ChartRenderer chart={chart} />

            <dl className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-4">
              <div>
                <dt className="font-medium text-slate-500">Chart type</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {chart.chart_type}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">X column</dt>
                <dd className="mt-1 font-semibold text-slate-950">{chart.x}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Y column</dt>
                <dd className="mt-1 font-semibold text-slate-950">{chart.y}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Aggregation</dt>
                <dd className="mt-1 font-semibold text-slate-950">
                  {chart.aggregation}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <ChartPromptInput
        value={prompt}
        disabled={isDisabled}
        isLoading={isLoading}
        onChange={setPrompt}
        onSubmit={() => generate(prompt)}
      />
    </Card>
  );
}

export default VisualizationPanel;
