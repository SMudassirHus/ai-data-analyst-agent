import { useEffect, useState } from "react";
import { Bot, Sparkles } from "lucide-react";

import { askDatasetQuestion } from "../../api/chat";
import Card from "../ui/Card";
import ChatEmptyState from "./ChatEmptyState";
import ChatInput from "./ChatInput";
import ChatMessage, { type ChatMessageItem } from "./ChatMessage";
import SuggestedQuestions from "./SuggestedQuestions";

type ChatPanelProps = {
  filename?: string;
  rowsAnalyzed?: number;
  columnsAnalyzed?: number;
};

function createMessage(
  role: ChatMessageItem["role"],
  content: string
): ChatMessageItem {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

function ChatPanel({ filename, rowsAnalyzed, columnsAnalyzed }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = !filename;
  const storageKey = filename ? `ai-data-analyst-chat-${filename}` : null;

  useEffect(() => {
    if (!storageKey) {
      setMessages([]);
      return;
    }

    const savedMessages = localStorage.getItem(storageKey);
    if (!savedMessages) {
      setMessages([]);
      return;
    }

    try {
      setMessages(JSON.parse(savedMessages) as ChatMessageItem[]);
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !filename || isLoading) {
      return;
    }

    const userMessage = createMessage("user", trimmedMessage);
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await askDatasetQuestion({
        filename,
        message: trimmedMessage,
      });
      setMessages((current) => [
        ...current,
        createMessage("assistant", response.answer),
      ]);
    } catch (apiError: unknown) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to get an analyst response."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                AI Analyst Live
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Copilot workspace
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Ask a question, generate a chart, or export an executive report.
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-[#635BFF]">
            <Sparkles className="h-3 w-3" />
            Live
          </span>
        </div>

        <div className="mt-4 grid gap-2 rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] p-3 text-xs text-[#6B7280]">
          <p className="font-semibold text-[#111827]">
            AI Analyst Ready
          </p>
          <p>Dataset Context Loaded</p>
          <p>Rows Analyzed: {rowsAnalyzed?.toLocaleString() ?? "Waiting for dataset"}</p>
          <p>Columns Analyzed: {columnsAnalyzed?.toLocaleString() ?? "Waiting for dataset"}</p>
          <p>Last Refresh: just now</p>
          <p>AI Analyst is using dataset context only</p>
        </div>

        <div className="mt-4">
          <SuggestedQuestions
            disabled={isDisabled || isLoading}
            onSelect={sendMessage}
          />
        </div>
      </div>

      <div className="max-h-[52vh] min-h-[360px] space-y-3 overflow-y-auto bg-slate-50/70 p-4">
        {messages.length === 0 && <ChatEmptyState disabled={isDisabled} />}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            AI Analyst is reviewing the dataset context...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}
      </div>

      <ChatInput
        value={draft}
        disabled={isDisabled}
        isLoading={isLoading}
        onChange={setDraft}
        onSubmit={() => sendMessage(draft)}
      />
    </Card>
  );
}

export default ChatPanel;
