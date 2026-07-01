from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.services.chat.dataset_context import DatasetContextError, resolve_uploaded_file
from app.services.insights.insight_service import (
    BusinessInsights,
    InsightConfigurationError,
    InsightServiceError,
    generate_business_insights,
)
from app.services.profiling.profiler import profile_dataset


class ReportBuildError(Exception):
    """Raised when report content cannot be assembled."""


def _missing_value_totals(missing_values: dict[str, dict[str, float | int]]) -> int:
    return int(sum(values["count"] for values in missing_values.values()))


def build_report_data(filename: str) -> dict[str, Any]:
    try:
        file_path = resolve_uploaded_file(filename)
    except FileNotFoundError:
        raise
    except DatasetContextError as exc:
        raise ReportBuildError(str(exc)) from exc

    try:
        profile = profile_dataset(file_path)
    except FileNotFoundError:
        raise
    except Exception as exc:
        raise ReportBuildError(str(exc)) from exc

    insights = _generate_or_fallback_insights(file_path.name, profile)

    missing_total = _missing_value_totals(profile["missing_values"])
    generated_at = datetime.now(UTC)

    return {
        "title": "Executive Dataset Analysis Report",
        "dataset_name": Path(file_path.name).name,
        "generated_at": generated_at,
        "executive_summary": insights.executive_summary,
        "overview": {
            "total_rows": profile["summary"]["rows"],
            "total_columns": profile["summary"]["columns"],
            "memory_usage_mb": profile["summary"]["memory_usage_mb"],
            "missing_values": missing_total,
            "duplicate_rows": profile["duplicates"],
        },
        "data_quality": {
            "warnings": profile["warnings"],
            "missing_values": profile["missing_values"],
        },
        "key_findings": insights.key_findings,
        "risks": insights.risks,
        "opportunities": insights.opportunities,
        "recommended_actions": insights.recommended_actions,
        "forecast_summary": (
            "No forecast was attached to this report. Generate a forecast in the "
            "dashboard before using future report versions with saved forecast artifacts."
        ),
        "generated_charts": [],
        "final_conclusions": _build_final_conclusions(insights),
        "preview": _build_preview(insights, profile),
    }


def _build_final_conclusions(insights: BusinessInsights) -> str:
    if insights.recommended_actions:
        return (
            "The dataset provides enough signal for an initial executive review. "
            "Leadership should prioritize the recommended actions and validate "
            "the findings with business owners before making operational decisions."
        )

    return (
        "The dataset should be reviewed further before drawing strong business "
        "conclusions."
    )


def _generate_or_fallback_insights(
    filename: str,
    profile: dict[str, Any],
) -> BusinessInsights:
    try:
        return generate_business_insights(filename)
    except (InsightConfigurationError, InsightServiceError):
        warnings = profile["warnings"]
        summary = (
            "This report was generated from deterministic dataset profiling. "
            "AI executive insights were not available, so findings are limited "
            "to observed structure, quality signals, and numeric statistics."
        )
        findings = [
            f"The dataset contains {profile['summary']['rows']:,} rows and "
            f"{profile['summary']['columns']:,} columns.",
            f"Duplicate rows detected: {profile['duplicates']:,}.",
        ]
        if warnings:
            findings.append(f"Data quality warnings detected: {len(warnings)}.")
        else:
            findings.append("No automated data quality warnings were detected.")

        return BusinessInsights(
            executive_summary=summary,
            key_findings=findings,
            risks=warnings or ["AI insights were unavailable for deeper risk review."],
            opportunities=[
                "Review key numeric columns and high-cardinality categories for business patterns."
            ],
            recommended_actions=[
                "Validate data quality with the source system owner.",
                "Generate AI insights after configuring OPENAI_API_KEY.",
                "Use the explorer and visualization sections to investigate priority metrics.",
            ],
        )


def _build_preview(insights: BusinessInsights, profile: dict[str, Any]) -> dict[str, Any]:
    return {
        "executive_summary": insights.executive_summary,
        "findings_count": len(insights.key_findings),
        "opportunities_count": len(insights.opportunities),
        "risks_count": len(insights.risks),
        "forecast_available": False,
        "generated_charts_count": 0,
        "rows": profile["summary"]["rows"],
        "columns": profile["summary"]["columns"],
    }
