from openai import OpenAI, OpenAIError

from app.core.config import settings
from app.services.chat.dataset_context import (
    DatasetContextError,
    build_dataset_context,
)
from app.services.chat.prompt_builder import build_chat_messages


class ChatConfigurationError(Exception):
    """Raised when chat configuration is incomplete."""


class ChatServiceError(Exception):
    """Raised when the AI service cannot answer."""


def answer_dataset_question(filename: str, message: str) -> str:
    if not settings.OPENAI_API_KEY:
        raise ChatConfigurationError("OPENAI_API_KEY is not configured")

    try:
        dataset_context = build_dataset_context(filename)
    except FileNotFoundError:
        raise
    except DatasetContextError:
        raise
    except Exception as exc:
        raise ChatServiceError("Unable to prepare dataset context.") from exc

    messages = build_chat_messages(dataset_context, message)
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        response = client.chat.completions.create(
            model=settings.CHAT_MODEL,
            messages=messages,
        )
    except OpenAIError as exc:
        raise ChatServiceError("Unable to get an AI response right now.") from exc

    answer = response.choices[0].message.content if response.choices else None

    if not answer:
        raise ChatServiceError("AI response was empty.")

    return answer
