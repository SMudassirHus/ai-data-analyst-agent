import Card from "../ui/Card";

type ExecutiveSummaryCardProps = {
  summary: string;
};

function ExecutiveSummaryCard({ summary }: ExecutiveSummaryCardProps) {
  return (
    <Card className="border-indigo-100 bg-indigo-50/50 p-5">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#635BFF]">
        Executive Summary
      </p>
      <p className="mt-3 text-base leading-7 text-slate-800">{summary}</p>
    </Card>
  );
}

export default ExecutiveSummaryCard;
