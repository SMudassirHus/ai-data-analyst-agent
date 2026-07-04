import { API_BASE_URL } from "./client";

export type BusinessInsights = {
  executive_summary: string;
  key_findings: string[];
  risks: string[];
  opportunities: string[];
  recommended_actions: string[];
};

export type InsightsResponse = {
  success: boolean;
  insights: BusinessInsights;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function generateInsights(filename: string): Promise<InsightsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/insights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) {
    let message = "Unable to generate business insights.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to generate business insights.";
    }

    throw new Error(message);
  }

  return response.json();
}
