import type { ReactNode } from "react";

import Card from "./Card";

type StatCardProps = {
  label: string;
  value: string;
  description?: string;
  accent?: ReactNode;
};

function StatCard({ label, value, description, accent }: StatCardProps) {
  return (
    <Card as="article" className="p-5 transition hover:border-indigo-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {accent && <div>{accent}</div>}
      </div>
      {description && (
        <p className="mt-4 text-sm leading-6 text-slate-600">{description}</p>
      )}
    </Card>
  );
}

export default StatCard;
