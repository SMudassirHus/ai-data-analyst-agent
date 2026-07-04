import json

from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings
from app.services.chat.dataset_context import DatasetContextError
from app.services.insights.insight_context import build_insight_context
from app.services.insights.insight_prompt_builder import build_insight_messages


class InsightConfigurationError(Exception):
    """Raised when insights configuration is incomplete."""


class InsightServiceError(Exception):
    """Raised when insights cannot be generated."""


class BusinessInsights(BaseModel):
    executive_summary: str
    key_findings: list[str] = Field(min_length=1)
    risks: list[str] = Field(default_factory=list)
    opportunities: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(min_length=1)


def _extract_json(text: str) -> dict:
    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.removeprefix("json").strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise InsightServiceError("AI returned invalid insight JSON.") from exc

    if not isinstance(parsed, dict):
        raise InsightServiceError("AI returned an invalid insight response.")

    return parsed


def generate_business_insights(filename: str) -> BusinessInsights:
    if not settings.OPENAI_API_KEY:
        raise InsightConfigurationError("OPENAI_API_KEY is not configured")

    try:
        insight_context = build_insight_context(filename)
    except FileNotFoundError:
        raise
    except DatasetContextError:
        raise
    except Exception as exc:
        raise InsightServiceError("Unable to prepare insight context.") from exc

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    messages = build_insight_messages(insight_context)

    try:
        try:
            response = client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=messages,
                response_format={"type": "json_object"},
            )
        except TypeError:
            response = client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=messages,
            )
    except OpenAIError as exc:
        raise InsightServiceError("Unable to generate insights right now.") from exc

    content = response.choices[0].message.content if response.choices else None

    if not content:
        raise InsightServiceError("AI insight response was empty.")

    try:
        return BusinessInsights.model_validate(_extract_json(content))
    except ValidationError as exc:
        raise InsightServiceError("AI returned incomplete insight output.") from exc
