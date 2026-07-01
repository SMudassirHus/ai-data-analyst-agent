import Button from "../ui/Button";

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

function ChatInput({
  value,
  disabled = false,
  isLoading = false,
  onChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <form
      className="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        value={value}
        disabled={disabled || isLoading}
        rows={2}
        placeholder="Ask a business question about this dataset"
        className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="submit"
        disabled={disabled || isLoading || !value.trim()}
        className="sm:self-end"
      >
        {isLoading ? "Asking..." : "Send"}
      </Button>
    </form>
  );
}

export default ChatInput;
