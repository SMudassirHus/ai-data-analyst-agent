export type ChatMessageRole = "user" | "assistant";

export type ChatMessageItem = {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: string;
};

type ChatMessageProps = {
  message: ChatMessageItem;
};

function formatTime(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <article
      className={`rounded-lg border p-4 ${
        isUser
          ? "border-indigo-200 bg-indigo-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-950">
          {isUser ? "You" : "AI Analyst"}
        </p>
        <time className="text-xs text-slate-500" dateTime={message.timestamp}>
          {formatTime(message.timestamp)}
        </time>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {message.content}
      </p>
    </article>
  );
}

export default ChatMessage;
