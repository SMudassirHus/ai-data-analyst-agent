import Card from "./Card";

type LoadingStateProps = {
  title: string;
  description: string;
};

function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <Card className="overflow-hidden p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 animate-pulse rounded-lg border border-indigo-200 bg-indigo-100" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {description}
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg bg-slate-100"
              />
            ))}
          </div>
          <div className="mt-3 h-32 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </div>
    </Card>
  );
}

export default LoadingState;
