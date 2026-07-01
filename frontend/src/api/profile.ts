import { API_BASE_URL } from "./client";

export type DatasetSummary = {
  rows: number;
  columns: number;
  memory_usage_mb: number;
};

export type ColumnInfo = {
  name: string;
  data_type: string;
  non_null_count: number;
  null_count: number;
  null_percentage: number;
  unique_values: number;
};

export type MissingValueInfo = {
  count: number;
  percentage: number;
};

export type NumericStatistic = {
  min: number | null;
  max: number | null;
  mean: number | null;
  median: number | null;
  std: number | null;
};

export type DatasetProfile = {
  summary: DatasetSummary;
  column_info: ColumnInfo[];
  missing_values: Record<string, MissingValueInfo>;
  duplicates: number;
  statistics: Record<string, NumericStatistic>;
  date_columns: string[];
  warnings: string[];
};

type ApiErrorResponse = {
  detail?: string;
};

export async function getDatasetProfile(
  filename: string
): Promise<DatasetProfile> {
  const response = await fetch(
    `${API_BASE_URL}/api/profile/${encodeURIComponent(filename)}`
  );

  if (!response.ok) {
    let message = "Unable to load dataset profile.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to load dataset profile.";
    }

    throw new Error(message);
  }

  return response.json();
}
