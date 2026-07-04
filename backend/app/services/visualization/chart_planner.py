import json
from typing import Any, Literal

from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, ValidationError

from app.core.config import settings
from app.services.chat.dataset_context import build_dataset_context


ChartType = Literal["bar", "line", "pie", "scatter"]
Aggregation = Literal["sum", "average", "count", "min", "max"]


class ChartPlanningError(Exception):
    """Raised when a chart plan cannot be created."""


class ChartPlan(BaseModel):
    chart_type: ChartType
    x: str
    y: str
    aggregation: Aggregation
    title: str
    reason: str


PLANNER_SYSTEM_PROMPT = """
You are a chart planning agent for a business intelligence dashboard.
Return structured JSON only.

Choose a chart plan from the provided dataset context and user request.
Allowed chart_type values: bar, line, pie, scatter.
Allowed aggregation values: sum, average, count, min, max.

Rules:
- Only choose columns that exist in the dataset context.
- Do not invent column names.
- If the request is unclear, choose the most reasonable chart from available columns.
- Prefer bar charts for category comparisons.
- Prefer line charts for date/time trends.
- Prefer pie charts for category share.
- Prefer scatter charts for relationships between two numeric columns.
- If no chart can be generated, return {"error": "clear reason"}.
- Do not include markdown.
""".strip()


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.removeprefix("json").strip()

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise ChartPlanningError("AI planner returned invalid JSON.") from exc

    if not isinstance(parsed, dict):
        raise ChartPlanningError("AI planner returned an invalid plan.")

    return parsed


def plan_chart(filename: str, message: str) -> ChartPlan:
    if not settings.OPENAI_API_KEY:
        raise ChartPlanningError("OPENAI_API_KEY is not configured")

    dataset_context = build_dataset_context(filename)
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    user_prompt = (
        "Dataset context:\n"
        f"{json.dumps(dataset_context, indent=2, default=str)}\n\n"
        f"User chart request: {message}\n\n"
        "Return JSON with keys: chart_type, x, y, aggregation, title, reason."
    )

    try:
        try:
            response = client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=[
                    {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
        except TypeError:
            response = client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=[
                    {"role": "system", "content": PLANNER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            )
    except OpenAIError as exc:
        raise ChartPlanningError("Unable to create a chart plan right now.") from exc

    content = response.choices[0].message.content if response.choices else None

    if not content:
        raise ChartPlanningError("AI planner returned an empty response.")

    parsed = _extract_json(content)

    if parsed.get("error"):
        raise ChartPlanningError(str(parsed["error"]))

    try:
        plan = ChartPlan.model_validate(parsed)
    except ValidationError as exc:
        raise ChartPlanningError("AI planner returned an incomplete chart plan.") from exc

    columns = set(dataset_context["column_names"])
    if plan.x not in columns or plan.y not in columns:
        raise ChartPlanningError("AI planner selected columns that do not exist.")

    return plan
