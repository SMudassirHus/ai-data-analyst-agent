import { API_BASE_URL } from "./client";

export type ReportPreview = {
  executive_summary: string;
  findings_count: number;
  opportunities_count: number;
  risks_count: number;
  forecast_available: boolean;
  generated_charts_count: number;
  rows: number;
  columns: number;
};

export type ReportGenerateResponse = {
  success: boolean;
  report_id: string;
  download_url: string;
  preview: ReportPreview;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function generateReport(
  filename: string
): Promise<ReportGenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/reports/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) {
    let message = "Unable to generate report.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to generate report.";
    }

    throw new Error(message);
  }

  return response.json();
}

export function buildReportDownloadUrl(downloadUrl: string) {
  return `${API_BASE_URL}${downloadUrl}`;
}
