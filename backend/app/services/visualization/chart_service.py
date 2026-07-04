from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.services.chat.dataset_context import DatasetContextError, resolve_uploaded_file
from app.services.visualization.chart_planner import (
    ChartPlan,
    ChartPlanningError,
    plan_chart,
)


class ChartServiceError(Exception):
    """Raised when chart data cannot be generated."""


MAX_GROUPED_POINTS = 50
MAX_PIE_SLICES = 10
MAX_SCATTER_POINTS = 500


def _load_dataset(file_path: Path) -> pd.DataFrame:
    file_type = file_path.suffix.lower().lstrip(".")

    try:
        if file_type == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except pd.errors.EmptyDataError as exc:
        raise ChartServiceError("Dataset is empty.") from exc
    except Exception as exc:
        raise ChartServiceError("Unable to read dataset file.") from exc

    df.columns = [str(column) for column in df.columns]

    if df.empty and len(df.columns) == 0:
        raise ChartServiceError("Dataset is empty.")

    return df


def _safe_number(value: Any) -> float | int | None:
    if pd.isna(value):
        return None

    if isinstance(value, np.generic):
        value = value.item()

    if isinstance(value, float):
        return round(value, 4)

    return value


def _aggregate(df: pd.DataFrame, x: str, y: str, aggregation: str) -> pd.DataFrame:
    working_df = df[[x, y]].dropna(subset=[x]).copy()

    if working_df.empty:
        raise ChartServiceError("Chart data is empty after removing missing values.")

    if aggregation == "count":
        return (
            working_df.groupby(x, dropna=False)
            .size()
            .reset_index(name="y")
            .rename(columns={x: "x"})
        )

    working_df[y] = pd.to_numeric(working_df[y], errors="coerce")
    working_df = working_df.dropna(subset=[y])

    if working_df.empty:
        raise ChartServiceError("Selected y column must contain numeric values.")

    aggregation_map = {
        "sum": "sum",
        "average": "mean",
        "min": "min",
        "max": "max",
    }

    return (
        working_df.groupby(x, dropna=False)[y]
        .agg(aggregation_map[aggregation])
        .reset_index(name="y")
        .rename(columns={x: "x"})
    )


def _build_grouped_chart_data(df: pd.DataFrame, plan: ChartPlan) -> list[dict[str, Any]]:
    grouped = _aggregate(df, plan.x, plan.y, plan.aggregation)
    grouped = grouped.sort_values("y", ascending=False).head(MAX_GROUPED_POINTS)

    return [
        {"x": str(row["x"]), "y": _safe_number(row["y"])}
        for row in grouped.to_dict(orient="records")
        if _safe_number(row["y"]) is not None
    ]


def _build_pie_chart_data(df: pd.DataFrame, plan: ChartPlan) -> list[dict[str, Any]]:
    grouped = _aggregate(df, plan.x, plan.y, plan.aggregation)
    grouped = grouped.sort_values("y", ascending=False)

    top = grouped.head(MAX_PIE_SLICES)
    remainder = grouped.iloc[MAX_PIE_SLICES:]

    if not remainder.empty:
        other_value = remainder["y"].sum()
        top = pd.concat(
            [top, pd.DataFrame([{"x": "Other", "y": other_value}])],
            ignore_index=True,
        )

    return [
        {"x": str(row["x"]), "y": _safe_number(row["y"])}
        for row in top.to_dict(orient="records")
        if _safe_number(row["y"]) is not None
    ]


def _build_line_chart_data(df: pd.DataFrame, plan: ChartPlan) -> list[dict[str, Any]]:
    working_df = df[[plan.x, plan.y]].copy()
    working_df[plan.x] = pd.to_datetime(working_df[plan.x], errors="coerce")
    working_df = working_df.dropna(subset=[plan.x])

    if working_df.empty:
        raise ChartServiceError("Selected x column could not be parsed as dates.")

    working_df["__period__"] = working_df[plan.x].dt.to_period("M").astype(str)
    grouped = _aggregate(working_df, "__period__", plan.y, plan.aggregation)
    grouped = grouped.sort_values("x").head(MAX_GROUPED_POINTS)

    return [
        {"x": str(row["x"]), "y": _safe_number(row["y"])}
        for row in grouped.to_dict(orient="records")
        if _safe_number(row["y"]) is not None
    ]


def _build_scatter_chart_data(df: pd.DataFrame, plan: ChartPlan) -> list[dict[str, Any]]:
    working_df = df[[plan.x, plan.y]].copy()
    working_df[plan.x] = pd.to_numeric(working_df[plan.x], errors="coerce")
    working_df[plan.y] = pd.to_numeric(working_df[plan.y], errors="coerce")
    working_df = working_df.dropna(subset=[plan.x, plan.y]).head(MAX_SCATTER_POINTS)

    if working_df.empty:
        raise ChartServiceError("Scatter chart requires two numeric columns.")

    return [
        {"x": _safe_number(row[plan.x]), "y": _safe_number(row[plan.y])}
        for row in working_df.to_dict(orient="records")
    ]


def _build_insight(plan: ChartPlan, chart_data: list[dict[str, Any]]) -> str:
    if not chart_data:
        return "No chart insight is available because the chart data is empty."

    if plan.chart_type == "scatter":
        return f"Scatter chart compares {plan.x} and {plan.y} across available rows."

    top_point = max(chart_data, key=lambda point: point["y"] or 0)
    return (
        f"{top_point['x']} has the highest {plan.aggregation} "
        f"of {plan.y} in this chart."
    )


def generate_chart(filename: str, message: str) -> dict[str, Any]:
    try:
        file_path = resolve_uploaded_file(filename)
    except FileNotFoundError:
        raise
    except DatasetContextError as exc:
        raise ChartServiceError(str(exc)) from exc

    plan = plan_chart(filename, message)
    df = _load_dataset(file_path)

    if plan.x not in df.columns or plan.y not in df.columns:
        raise ChartServiceError("Selected chart columns do not exist in the dataset.")

    if plan.chart_type == "line":
        chart_data = _build_line_chart_data(df, plan)
    elif plan.chart_type == "pie":
        chart_data = _build_pie_chart_data(df, plan)
    elif plan.chart_type == "scatter":
        chart_data = _build_scatter_chart_data(df, plan)
    else:
        chart_data = _build_grouped_chart_data(df, plan)

    if not chart_data:
        raise ChartServiceError("Chart data is empty.")

    return {
        "success": True,
        "chart_type": plan.chart_type,
        "title": plan.title,
        "x": plan.x,
        "y": plan.y,
        "aggregation": plan.aggregation,
        "data": chart_data,
        "insight": _build_insight(plan, chart_data),
    }
