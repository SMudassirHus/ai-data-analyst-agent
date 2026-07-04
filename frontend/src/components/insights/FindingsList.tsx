import Card from "../ui/Card";

type FindingsListProps = {
  findings: string[];
};

function FindingsList({ findings }: FindingsListProps) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-slate-950">Key Findings</h3>
      <ol className="mt-4 space-y-3">
        {findings.map((finding, index) => (
          <li key={`${finding}-${index}`} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-semibold text-[#635BFF]">
              {index + 1}
            </span>
            <p className="text-sm leading-6 text-slate-700">{finding}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export default FindingsList;
