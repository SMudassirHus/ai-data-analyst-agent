import { useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

import Button from "../ui/Button";

type LiveAssistantWidgetProps = {
  onLaunchWorkspace: () => void;
  onShowDemo: () => void;
};

function LiveAssistantWidget({
  onLaunchWorkspace,
  onShowDemo,
}: LiveAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState(
    "Hi, I can help you explore how InsightPilot AI turns CSV and Excel files into dashboards, insights, forecasts, and reports."
  );

  function explainPlatform() {
    setAssistantResponse(
      "InsightPilot AI helps analysts upload spreadsheets, profile data quality, generate dashboards, ask AI questions, forecast trends, and export executive reports from one workspace."
    );
  }

  const quickActions = [
    {
      label: "Show demo",
      onClick: onShowDemo,
    },
    {
      label: "Launch workspace",
      onClick: onLaunchWorkspace,
    },
    {
      label: "What can this app do?",
      onClick: explainPlatform,
    },
  ];

  if (!isOpen) {
    return (
      <button
        type="button"
        aria-label="Open InsightPilot Assistant"
        className="group fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#635BFF] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#5148E5] focus:outline-none focus:ring-2 focus:ring-[#635BFF] focus:ring-offset-2"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#111827] opacity-0 shadow-sm transition group-hover:translate-x-[-2px] group-hover:opacity-100">
          Ask InsightPilot
        </span>
        <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-[#16A34A] ring-2 ring-white">
          <span className="absolute inset-0 rounded-full bg-[#16A34A] opacity-75 animate-ping" />
        </span>
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 right-4 z-40 max-h-[520px] w-[min(calc(100vw-2rem),360px)] animate-fade-in-up overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-[#E5E7EB] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#635BFF]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              InsightPilot Assistant
            </h2>
            <div className="mt-1 flex items-center gap-2 text-xs font-medium text-[#6B7280]">
              <span className="relative h-2 w-2 rounded-full bg-[#16A34A]">
                <span className="absolute inset-0 rounded-full bg-[#16A34A] opacity-75 animate-ping" />
              </span>
              Live guide
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close InsightPilot Assistant"
          className="rounded-lg p-1.5 text-[#6B7280] transition hover:bg-slate-100 hover:text-[#111827]"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-2xl bg-[#F7F8FB] p-3 text-sm leading-6 text-[#111827]">
          {assistantResponse}
        </div>

        <div className="grid gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-left text-sm font-semibold text-[#111827] shadow-sm transition hover:border-[#635BFF] hover:text-[#635BFF]"
              onClick={action.onClick}
            >
              {action.label}
              <Sparkles className="h-4 w-4" />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-sm">
          <input
            className="min-w-0 flex-1 bg-transparent px-2 text-sm text-[#111827] outline-none placeholder:text-[#9CA3AF]"
            placeholder="Ask about the platform..."
            readOnly
          />
          <Button className="h-9 min-h-9 px-3" onClick={explainPlatform}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

export default LiveAssistantWidget;
