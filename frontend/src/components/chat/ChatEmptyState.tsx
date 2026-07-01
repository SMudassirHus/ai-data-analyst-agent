type ChatEmptyStateProps = {
  disabled?: boolean;
};

function ChatEmptyState({ disabled = false }: ChatEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-950">
        {disabled ? "Upload a dataset to enable AI analysis" : "Ask your first question"}
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
        The AI analyst uses a compact dataset context with profile metrics,
        sample rows, and quality warnings. It does not receive the full dataset.
      </p>
    </div>
  );
}

export default ChatEmptyState;
