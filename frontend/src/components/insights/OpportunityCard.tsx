import Card from "../ui/Card";

type OpportunityCardProps = {
  opportunities: string[];
};

function OpportunityCard({ opportunities }: OpportunityCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-slate-950">Opportunities</h3>
      {opportunities.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {opportunities.map((opportunity, index) => (
            <li
              key={`${opportunity}-${index}`}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm leading-6 text-[#635BFF]"
            >
              {opportunity}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No specific opportunities were identified from the available dataset context.
        </p>
      )}
    </Card>
  );
}

export default OpportunityCard;
