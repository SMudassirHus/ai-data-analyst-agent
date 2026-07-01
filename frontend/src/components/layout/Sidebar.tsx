import { useEffect, useState, type MouseEvent } from "react";
import {
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "#overview", icon: LayoutDashboard },
  { label: "Dashboards", href: "#dashboards", icon: BarChart3 },
  { label: "Insights", href: "#insights", icon: Sparkles },
  { label: "Data Quality", href: "#data-quality", icon: Database },
  { label: "Explore Data", href: "#explore-data", icon: Gauge },
  { label: "AI Analyst", href: "#ai-analyst", icon: Bot },
  { label: "Forecasting", href: "#forecasting", icon: LineChart },
  { label: "Reports", href: "#reports", icon: FileText },
  { label: "Settings", href: "#settings", icon: Settings },
];

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    function updateActiveSection() {
      const visibleSection = navItems
        .map((item) => document.getElementById(item.href.slice(1)))
        .filter(Boolean)
        .map((section) => ({
          id: section!.id,
          top: section!.getBoundingClientRect().top,
        }))
        .filter((section) => section.top < window.innerHeight * 0.35)
        .sort((a, b) => b.top - a.top)[0];

      if (visibleSection) {
        setActiveId(visibleSection.id);
      }
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  function handleNavigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    const id = href.slice(1);
    const target = document.getElementById(id);

    if (target) {
      setActiveId(id);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <aside
      className={`sticky top-0 z-30 hidden h-screen shrink-0 border-r border-[#E5E7EB] bg-white shadow-sm lg:block ${
        isCollapsed ? "w-[76px]" : "w-60"
      } transition-all duration-300`}
    >
      <div className="flex h-full flex-col px-3 py-4">
        <div className="flex h-12 items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">
                InsightPilot AI
              </p>
              <p className="truncate text-xs text-[#6B7280]">
                AI business intelligence
              </p>
            </div>
          )}
        </div>

        <nav className="mt-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.href.slice(1);

            return (
              <a
                key={item.label}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                onClick={(event) => handleNavigate(event, item.href)}
                className={`group relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-[#635BFF]"
                    : "text-[#6B7280] hover:bg-slate-50 hover:text-[#111827]"
                } ${isCollapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-full bg-[#635BFF]" />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {!isCollapsed && (
            <div className="rounded-xl border border-[#E5E7EB] bg-[#F7F8FB] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#635BFF]">
                Workspace
              </p>
              <p className="mt-1 text-sm font-medium text-[#111827]">
                Profile, explore, ask, visualize, forecast, report.
              </p>
            </div>
          )}
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-semibold text-[#6B7280] transition hover:border-[#635BFF] hover:text-[#635BFF]"
            onClick={() => setIsCollapsed((current) => !current)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
