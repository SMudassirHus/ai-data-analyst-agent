from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd


SUPPORTED_FILE_TYPES = {"csv", "xlsx", "xls"}


class ProfilingError(Exception):
    """Raised when a dataset cannot be profiled."""


def _round_float(value: Any, digits: int = 4) -> float | None:
    if pd.isna(value):
        return None

    return round(float(value), digits)


def _load_dataset(file_path: Path) -> pd.DataFrame:
    file_type = file_path.suffix.lower().lstrip(".")

    try:
        if file_type == "csv":
            return pd.read_csv(file_path)

        if file_type in {"xlsx", "xls"}:
            return pd.read_excel(file_path)
    except Exception as exc:
        raise ProfilingError("Unable to read dataset file.") from exc

    raise ProfilingError("Unsupported dataset file type.")


def _build_column_info(df: pd.DataFrame) -> list[dict[str, Any]]:
    total_rows = len(df)
    columns: list[dict[str, Any]] = []

    for column in df.columns:
        series = df[column]
        null_count = int(series.isna().sum())
        null_percentage = (
            round((null_count / total_rows) * 100, 2) if total_rows else 0.0
        )

        columns.append(
            {
                "name": str(column),
                "data_type": str(series.dtype),
                "non_null_count": int(series.notna().sum()),
                "null_count": null_count,
                "null_percentage": null_percentage,
                "unique_values": int(series.nunique(dropna=True)),
            }
        )

    return columns


def _build_missing_values(df: pd.DataFrame) -> dict[str, dict[str, float | int]]:
    total_rows = len(df)
    missing_values: dict[str, dict[str, float | int]] = {}

    for column in df.columns:
        missing_count = int(df[column].isna().sum())
        missing_percentage = (
            round((missing_count / total_rows) * 100, 2) if total_rows else 0.0
        )
        missing_values[str(column)] = {
            "count": missing_count,
            "percentage": missing_percentage,
        }

    return missing_values


def _build_numeric_statistics(df: pd.DataFrame) -> dict[str, dict[str, float | None]]:
    numeric_df = df.select_dtypes(include=[np.number])
    statistics: dict[str, dict[str, float | None]] = {}

    for column in numeric_df.columns:
        series = numeric_df[column]
        statistics[str(column)] = {
            "min": _round_float(series.min()),
            "max": _round_float(series.max()),
            "mean": _round_float(series.mean()),
            "median": _round_float(series.median()),
            "std": _round_float(series.std()),
        }

    return statistics


def _detect_date_columns(df: pd.DataFrame) -> list[str]:
    date_columns: list[str] = []

    for column in df.columns:
        series = df[column].dropna()

        if series.empty:
            continue

        if pd.api.types.is_datetime64_any_dtype(series):
            date_columns.append(str(column))
            continue

        if not (
            pd.api.types.is_object_dtype(series)
            or pd.api.types.is_string_dtype(series)
        ):
            continue

        sample = series.astype(str).head(100)
        parsed = pd.to_datetime(sample, errors="coerce", utc=False)
        parse_rate = float(parsed.notna().mean())

        if parse_rate >= 0.8:
            date_columns.append(str(column))

    return date_columns


def _build_warnings(
    df: pd.DataFrame,
    missing_values: dict[str, dict[str, float | int]],
    duplicate_count: int,
) -> list[str]:
    warnings: list[str] = []

    columns_with_missing = [
        column for column, values in missing_values.items() if values["count"] > 0
    ]
    empty_columns = [
        column
        for column, values in missing_values.items()
        if values["count"] == len(df)
    ]
    numeric_df = df.select_dtypes(include=[np.number])
    negative_columns = [
        str(column) for column in numeric_df.columns if (numeric_df[column] < 0).any()
    ]

    if columns_with_missing:
        warnings.append(
            f"Missing values found in {len(columns_with_missing)} column(s)."
        )

    if duplicate_count > 0:
        warnings.append(f"Duplicate rows detected: {duplicate_count}.")

    if negative_columns:
        warnings.append(
            f"Negative values detected in: {', '.join(negative_columns)}."
        )

    if empty_columns:
        warnings.append(f"Empty columns detected: {', '.join(empty_columns)}.")

    return warnings


def profile_dataset(file_path: Path) -> dict[str, Any]:
    if not file_path.exists():
        raise FileNotFoundError(file_path)

    if file_path.suffix.lower().lstrip(".") not in SUPPORTED_FILE_TYPES:
        raise ProfilingError("Unsupported dataset file type.")

    df = _load_dataset(file_path)
    memory_usage_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
    missing_values = _build_missing_values(df)
    duplicate_count = int(df.duplicated().sum())

    return {
        "summary": {
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "memory_usage_mb": round(memory_usage_mb, 2),
        },
        "column_info": _build_column_info(df),
        "missing_values": missing_values,
        "duplicates": duplicate_count,
        "statistics": _build_numeric_statistics(df),
        "date_columns": _detect_date_columns(df),
        "warnings": _build_warnings(df, missing_values, duplicate_count),
    }
