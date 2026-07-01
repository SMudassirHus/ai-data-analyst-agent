from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.services.chat.dataset_context import DatasetContextError, resolve_uploaded_file


class ForecastingError(Exception):
    """Raised when a forecast cannot be generated."""


def _load_dataset(file_path: Path) -> pd.DataFrame:
    file_type = file_path.suffix.lower().lstrip(".")

    try:
        if file_type == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except pd.errors.EmptyDataError as exc:
        raise ForecastingError("Dataset is empty.") from exc
    except Exception as exc:
        raise ForecastingError("Unable to read dataset file.") from exc

    df.columns = [str(column) for column in df.columns]

    if df.empty:
        raise ForecastingError("Dataset is empty.")

    return df


def _prepare_monthly_series(
    df: pd.DataFrame,
    date_column: str,
    value_column: str,
) -> pd.Series:
    if date_column not in df.columns:
        raise ForecastingError(f"Date column not found: {date_column}.")

    if value_column not in df.columns:
        raise ForecastingError(f"Value column not found: {value_column}.")

    working_df = df[[date_column, value_column]].copy()
    working_df[date_column] = pd.to_datetime(working_df[date_column], errors="coerce")
    working_df[value_column] = pd.to_numeric(working_df[value_column], errors="coerce")
    working_df = working_df.dropna(subset=[date_column, value_column])

    if working_df.empty:
        raise ForecastingError("No valid date and numeric value pairs were found.")

    monthly = (
        working_df.set_index(date_column)[value_column]
        .resample("MS")
        .sum()
        .dropna()
    )

    monthly = monthly[monthly.index.notna()]

    if len(monthly) < 3:
        raise ForecastingError(
            "At least 3 monthly data points are required for forecasting."
        )

    return monthly


def _forecast_values(monthly: pd.Series, periods: int) -> list[float]:
    x = np.arange(len(monthly), dtype=float)
    y = monthly.to_numpy(dtype=float)

    if len(monthly) >= 4:
        slope, intercept = np.polyfit(x, y, 1)
        future_x = np.arange(len(monthly), len(monthly) + periods, dtype=float)
        forecast = intercept + slope * future_x
    else:
        forecast = np.repeat(y[-3:].mean(), periods)

    return [round(max(float(value), 0.0), 2) for value in forecast]


def _build_summary(value_column: str, periods: int, forecast_values: list[float]) -> str:
    first_value = forecast_values[0]
    last_value = forecast_values[-1]

    if last_value > first_value * 1.05:
        direction = "increase"
    elif last_value < first_value * 0.95:
        direction = "decrease"
    else:
        direction = "remain relatively stable"

    return (
        f"{value_column} is expected to {direction} over the next "
        f"{periods} periods based on the recent monthly trend."
    )


def generate_forecast(
    filename: str,
    date_column: str,
    value_column: str,
    periods: int,
) -> dict[str, Any]:
    if periods not in {3, 6, 12}:
        raise ForecastingError("Forecast periods must be one of: 3, 6, 12.")

    try:
        file_path = resolve_uploaded_file(filename)
    except FileNotFoundError:
        raise
    except DatasetContextError as exc:
        raise ForecastingError(str(exc)) from exc

    df = _load_dataset(file_path)
    monthly = _prepare_monthly_series(df, date_column, value_column)
    predicted_values = _forecast_values(monthly, periods)
    last_date = monthly.index.max()
    future_dates = pd.date_range(
        start=last_date + pd.DateOffset(months=1),
        periods=periods,
        freq="MS",
    )

    forecast = [
        {
            "date": date.date().isoformat(),
            "predicted_value": predicted_value,
        }
        for date, predicted_value in zip(future_dates, predicted_values)
    ]

    return {
        "success": True,
        "forecast": forecast,
        "summary": _build_summary(value_column, periods, predicted_values),
    }
