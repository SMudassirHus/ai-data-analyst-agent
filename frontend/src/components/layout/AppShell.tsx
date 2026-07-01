import type { ReactNode } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
  datasetName?: string;
  datasetStatus?: string;
  lastUpdated?: string;
  fileType?: string;
  rowCount?: number;
  onClearWorkspace?: () => void;
};

function AppShell({
  children,
  datasetName = "No dataset selected",
  datasetStatus = "Waiting for upload",
  lastUpdated = "Not updated yet",
  fileType,
  rowCount,
  onClearWorkspace,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#111827]">
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header
            datasetName={datasetName}
            datasetStatus={datasetStatus}
            lastUpdated={lastUpdated}
            fileType={fileType}
            rowCount={rowCount}
            onClearWorkspace={onClearWorkspace}
          />
          <main className="px-4 py-4 sm:px-5 lg:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
