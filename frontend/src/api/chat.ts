import { API_BASE_URL } from "./client";

export type ChatRequest = {
  filename: string;
  message: string;
};

export type ChatResponse = {
  answer: string;
  success: boolean;
};

type ApiErrorResponse = {
  detail?: string;
};

export async function askDatasetQuestion(
  request: ChatRequest
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let message = "Unable to get an analyst response.";

    try {
      const error = (await response.json()) as ApiErrorResponse;
      if (error.detail) {
        message = error.detail;
      }
    } catch {
      message = "Unable to get an analyst response.";
    }

    throw new Error(message);
  }

  return response.json();
}
