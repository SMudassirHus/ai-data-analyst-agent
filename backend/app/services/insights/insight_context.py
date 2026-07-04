from typing import Any

from app.services.chat.dataset_context import build_dataset_context


def build_insight_context(filename: str) -> dict[str, Any]:
    dataset_context = build_dataset_context(filename)

    return {
        "filename": dataset_context["filename"],
        "summary": {
            "total_rows": dataset_context["total_rows"],
            "total_columns": dataset_context["total_columns"],
            "duplicate_row_count": dataset_context["duplicate_row_count"],
        },
        "columns": {
            "names": dataset_context["column_names"],
            "types": dataset_context["detected_data_types"],
        },
        "missing_values": dataset_context["missing_values_summary"],
        "numeric_statistics": dataset_context["numeric_statistics"],
        "sample_rows": dataset_context["sample_rows"],
        "data_quality_warnings": dataset_context["data_quality_warnings"],
        "generated_charts": [],
        "context_limits": dataset_context["context_limits"],
    }
