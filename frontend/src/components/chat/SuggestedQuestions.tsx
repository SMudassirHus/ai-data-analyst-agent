type SuggestedQuestionsProps = {
  disabled?: boolean;
  onSelect: (question: string) => void;
};

const suggestions = [
  "Summarize this dataset for management",
  "What are the biggest data quality issues?",
  "Which columns look most important?",
  "What trends or patterns should I investigate?",
  "What questions should I ask about this data?",
];

function SuggestedQuestions({ disabled = false, onSelect }: SuggestedQuestionsProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">Suggested questions</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={disabled}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-[#635BFF] transition hover:border-indigo-300 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            onClick={() => onSelect(question)}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SuggestedQuestions;
