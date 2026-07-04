type ChartSuggestionsProps = {
  suggestions: string[];
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

function ChartSuggestions({
  suggestions,
  disabled = false,
  onSelect,
}: ChartSuggestionsProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">Suggested chart prompts</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-[#635BFF] transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            onClick={() => onSelect(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChartSuggestions;
