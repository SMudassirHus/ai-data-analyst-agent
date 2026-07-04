import { useEffect, useState } from "react";

import { getHealth, type HealthResponse } from "../api/client";
import Badge from "./ui/Badge";
import Card from "./ui/Card";

type HealthState =
  | { status: "loading" }
  | { status: "online"; data: HealthResponse }
  | { status: "offline"; message: string };

function HealthCheckCard() {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (isMounted) {
          setHealth({ status: "online", data });
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHealth({
            status: "offline",
            message:
              error instanceof Error
                ? error.message
                : "Unable to reach backend API",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const statusLabel =
    health.status === "online"
      ? "Connected"
      : health.status === "offline"
        ? "Offline"
        : "Checking";

  const statusClasses =
    health.status === "online"
      ? "success"
      : health.status === "offline"
        ? "amber"
        : "slate";

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">API Health</h2>
          <p className="mt-1 text-sm text-slate-600">
            Confirms the frontend can reach the FastAPI backend.
          </p>
        </div>
        <Badge variant={statusClasses}>{statusLabel}</Badge>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
        {health.status === "online" && (
          <div className="space-y-1">
            <p>
              <span className="font-medium text-slate-950">Status:</span>{" "}
              {health.data.status}
            </p>
            <p>
              <span className="font-medium text-slate-950">Service:</span>{" "}
              {health.data.service}
            </p>
          </div>
        )}

        {health.status === "offline" && <p>{health.message}</p>}
        {health.status === "loading" && <p>Checking backend connection...</p>}
      </div>
    </Card>
  );
}

export default HealthCheckCard;
