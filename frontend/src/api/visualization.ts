import { API_BASE_URL } from "./client";

export type ChartType = "bar" | "line" | "pie" | "scatter";
export type ChartAggregation = "sum" | "average" | "count" | "min" | "max";

export type ChartPoint = {
  x: string | number;
  y: number;
};

export type VisualizationResponse = {
  success: boolean;
  chart_type: ChartType;
  title: string;
  x: string;
  y: string;
  aggregation: ChartAggregation;
  data: ChartPoint[];
  insight: string;
};

type VisualizationRequest = {
  filename: string;
  message: string;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function createVisualization(
  request: VisualizationRequest
): Promise<VisualizationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/visualization`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = "Unable to generate visualization.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to generate visualization.";
    }

    throw new Error(message);
  }

  return response.json();
}
