import Card from "../ui/Card";

type RiskCardProps = {
  risks: string[];
};

function RiskCard({ risks }: RiskCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-slate-950">Risks</h3>
      {risks.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {risks.map((risk, index) => (
            <li
              key={`${risk}-${index}`}
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800"
            >
              {risk}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          No material risks were identified from the available dataset context.
        </p>
      )}
    </Card>
  );
}

export default RiskCard;
