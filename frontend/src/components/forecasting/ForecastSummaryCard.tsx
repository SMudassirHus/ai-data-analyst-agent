import Card from "../ui/Card";

type ForecastSummaryCardProps = {
  summary: string;
};

function ForecastSummaryCard({ summary }: ForecastSummaryCardProps) {
  return (
    <Card className="border-indigo-100 bg-indigo-50/60 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#635BFF]">
        Forecast Summary
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>
    </Card>
  );
}

export default ForecastSummaryCard;
