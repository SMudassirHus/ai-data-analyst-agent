import { API_BASE_URL } from "./client";

export type UploadResponse = {
  filename: string;
  original_filename: string;
  size_bytes: number;
  file_type: "csv" | "xlsx" | "xls";
  uploaded_at: string;
  success: boolean;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function uploadDataFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "File upload failed.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "File upload failed.";
    }

    throw new Error(message);
  }

  return response.json();
}

export async function uploadSampleDataset(sampleId: string): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE_URL}/api/upload/sample/${sampleId}`, {
    method: "POST",
  });

  if (!response.ok) {
    let message = "Unable to load sample dataset.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to load sample dataset.";
    }

    throw new Error(message);
  }

  return response.json();
}
