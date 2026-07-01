from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.core.config import settings
from app.services.profiling.profiler import profile_dataset


SUPPORTED_FILE_TYPES = {"csv", "xlsx", "xls"}
MAX_SAMPLE_ROWS = 10


class DatasetContextError(Exception):
    """Raised when dataset context cannot be prepared."""


def resolve_uploaded_file(filename: str) -> Path:
    safe_filename = Path(filename).name

    if safe_filename != filename:
        raise DatasetContextError("Invalid filename.")

    file_path = settings.UPLOAD_DIR / safe_filename

    if not file_path.exists() or not file_path.is_file():
        raise FileNotFoundError(file_path)

    if file_path.suffix.lower().lstrip(".") not in SUPPORTED_FILE_TYPES:
        raise DatasetContextError("Unsupported dataset file type.")

    return file_path


def _load_dataset(file_path: Path) -> pd.DataFrame:
    file_type = file_path.suffix.lower().lstrip(".")

    try:
        if file_type == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
    except pd.errors.EmptyDataError as exc:
        raise DatasetContextError("Dataset is empty.") from exc
    except Exception as exc:
        raise DatasetContextError("Unable to read dataset file.") from exc

    df.columns = [str(column) for column in df.columns]

    if df.empty and len(df.columns) == 0:
        raise DatasetContextError("Dataset is empty.")

    return df


def _to_json_safe_value(value: Any) -> Any:
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, np.generic):
        return value.item()

    return value


def _sample_rows(df: pd.DataFrame) -> list[dict[str, Any]]:
    sample = df.head(MAX_SAMPLE_ROWS)
    rows: list[dict[str, Any]] = []

    for row in sample.to_dict(orient="records"):
        rows.append({str(key): _to_json_safe_value(value) for key, value in row.items()})

    return rows


def build_dataset_context(filename: str) -> dict[str, Any]:
    file_path = resolve_uploaded_file(filename)
    df = _load_dataset(file_path)
    profile = profile_dataset(file_path)

    column_types = {str(column): str(dtype) for column, dtype in df.dtypes.items()}

    return {
        "filename": file_path.name,
        "total_rows": int(df.shape[0]),
        "total_columns": int(df.shape[1]),
        "column_names": [str(column) for column in df.columns],
        "detected_data_types": column_types,
        "missing_values_summary": profile["missing_values"],
        "numeric_statistics": profile["statistics"],
        "duplicate_row_count": profile["duplicates"],
        "sample_rows": _sample_rows(df),
        "data_quality_warnings": profile["warnings"],
        "context_limits": {
            "sample_rows_included": min(MAX_SAMPLE_ROWS, int(df.shape[0])),
            "entire_dataset_sent": False,
        },
    }
