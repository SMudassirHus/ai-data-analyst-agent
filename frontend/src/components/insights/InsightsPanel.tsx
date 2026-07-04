import { useEffect, useState } from "react";

import { generateInsights, type BusinessInsights } from "../../api/insights";
import Button from "../ui/Button";
import Card from "../ui/Card";
import ExecutiveSummaryCard from "./ExecutiveSummaryCard";
import FindingsList from "./FindingsList";
import OpportunityCard from "./OpportunityCard";
import RecommendationsCard from "./RecommendationsCard";
import RiskCard from "./RiskCard";

type InsightsPanelProps = {
  filename?: string;
};

function InsightsPanel({ filename }: InsightsPanelProps) {
  const [insights, setInsights] = useState<BusinessInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = !filename || isLoading;
  const storageKey = filename ? `ai-data-analyst-insights-${filename}` : null;

  useEffect(() => {
    if (!storageKey) {
      setInsights(null);
      return;
    }

    const savedInsights = localStorage.getItem(storageKey);
    if (!savedInsights) {
      setInsights(null);
      return;
    }

    try {
      setInsights(JSON.parse(savedInsights) as BusinessInsights);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey && insights) {
      localStorage.setItem(storageKey, JSON.stringify(insights));
    }
  }, [insights, storageKey]);

  async function handleGenerate() {
    if (!filename || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateInsights(filename);
      setInsights(response.insights);
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to generate business insights."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Business Insights
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Generate an executive briefing from the uploaded dataset profile.
            </p>
          </div>
          <Button disabled={isDisabled} onClick={handleGenerate}>
            {isLoading ? "Generating..." : "Generate Insights"}
          </Button>
        </div>
      </div>

      <div className="space-y-5 bg-slate-50/70 p-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Preparing executive insights from profile metrics, sample rows, and
            quality signals...
          </div>
        )}

        {!insights && !isLoading && !error && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm font-semibold text-slate-950">
              No executive insights generated yet
            </p>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Use the button above to create a concise management-ready brief
              with findings, risks, opportunities, and next actions.
            </p>
          </div>
        )}

        {insights && (
          <div className="space-y-5">
            <ExecutiveSummaryCard summary={insights.executive_summary} />
            <FindingsList findings={insights.key_findings} />
            <div className="grid gap-5 lg:grid-cols-2">
              <RiskCard risks={insights.risks} />
              <OpportunityCard opportunities={insights.opportunities} />
            </div>
            <RecommendationsCard
              recommendations={insights.recommended_actions}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export default InsightsPanel;
