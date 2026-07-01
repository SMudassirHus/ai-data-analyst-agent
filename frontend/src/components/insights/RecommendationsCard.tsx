import Card from "../ui/Card";

type RecommendationsCardProps = {
  recommendations: string[];
};

function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-semibold text-slate-950">
        Recommended Actions
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {recommendations.map((recommendation, index) => (
          <article
            key={`${recommendation}-${index}`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-semibold text-[#635BFF]">
              Action {index + 1}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {recommendation}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}

export default RecommendationsCard;
