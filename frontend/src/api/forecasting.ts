import { API_BASE_URL } from "./client";

export type ForecastPoint = {
  date: string;
  predicted_value: number;
};

export type ForecastResponse = {
  success: boolean;
  forecast: ForecastPoint[];
  summary: string;
};

export type ForecastRequest = {
  filename: string;
  date_column: string;
  value_column: string;
  periods: number;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function createForecast(
  request: ForecastRequest
): Promise<ForecastResponse> {
  const response = await fetch(`${API_BASE_URL}/api/forecast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = "Unable to generate forecast.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to generate forecast.";
    }

    throw new Error(message);
  }

  return response.json();
}
