import { API_BASE_URL } from "./client";

export type ExploreRowValue = string | number | boolean | null;

export type ExploreRow = Record<string, ExploreRowValue>;

export type ExplorePagination = {
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
};

export type ExploreResponse = {
  filename: string;
  columns: string[];
  rows: ExploreRow[];
  pagination: ExplorePagination;
};

export type ExploreParams = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type ApiErrorResponse = {
  detail?: string;
};

export async function getDatasetRows(
  filename: string,
  params: ExploreParams
): Promise<ExploreResponse> {
  const query = new URLSearchParams({
    page: String(params.page),
    page_size: String(params.pageSize),
    sort_order: params.sortOrder ?? "asc",
  });

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.sortBy) {
    query.set("sort_by", params.sortBy);
  }

  const response = await fetch(
    `${API_BASE_URL}/api/explore/${encodeURIComponent(filename)}?${query}`
  );

  if (!response.ok) {
    let message = "Unable to load dataset rows.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to load dataset rows.";
    }

    throw new Error(message);
  }

  return response.json();
}
