import json
from typing import Any


INSIGHT_SYSTEM_PROMPT = """
You are a senior business intelligence consultant preparing executive insights.
Return structured JSON only.

Required JSON shape:
{
  "executive_summary": "string",
  "key_findings": ["string", "string", "string"],
  "risks": ["string"],
  "opportunities": ["string"],
  "recommended_actions": ["string", "string", "string"]
}

Rules:
- Do not invent facts.
- Only use dataset evidence from the context.
- Clearly state uncertainty when evidence is limited.
- Use concise business language.
- Focus on decisions executives would care about.
- Do not include markdown.
""".strip()


def build_insight_messages(insight_context: dict[str, Any]) -> list[dict[str, str]]:
    context_text = json.dumps(insight_context, indent=2, default=str)

    return [
        {
            "role": "system",
            "content": INSIGHT_SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Generate executive-level business insights from this dataset context.\n\n"
                f"{context_text}"
            ),
        },
    ]
