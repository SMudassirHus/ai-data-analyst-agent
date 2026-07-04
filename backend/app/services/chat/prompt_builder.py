import json
from typing import Any


SYSTEM_PROMPT = """
You are an AI data analyst inside a business intelligence dashboard.

Rules:
- Answer only using the dataset context provided.
- Be honest if the dataset does not contain enough information.
- Do not invent numbers or columns.
- Use clear business-friendly language.
- Mention assumptions clearly.
- For calculations, explain briefly how the answer was derived.
- If the user asks for a chart, say charts will be available in a future visualization feature.
- If the user asks for prediction or forecasting, say forecasting will be available in a future feature.
- Keep answers concise but useful.
""".strip()


def build_chat_messages(
    dataset_context: dict[str, Any],
    user_message: str,
) -> list[dict[str, str]]:
    context_text = json.dumps(dataset_context, indent=2, default=str)

    return [
        {
            "role": "system",
            "content": SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Dataset context follows. Use only this context when answering.\n\n"
                f"{context_text}\n\n"
                f"Business question: {user_message}"
            ),
        },
    ]
