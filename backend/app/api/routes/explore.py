from math import ceil
from pathlib import Path
from typing import Any, Literal

import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import settings


router = APIRouter()

SUPPORTED_FILE_TYPES = {"csv", "xlsx", "xls"}


def _resolve_uploaded_file(filename: str) -> Path:
    safe_filename = Path(filename).name

    if safe_filename != filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    return settings.UPLOAD_DIR / safe_filename


def _load_dataset(file_path: Path) -> pd.DataFrame:
    file_type = file_path.suffix.lower().lstrip(".")

    if file_type not in SUPPORTED_FILE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported dataset file type.",
        )

    try:
        if file_type == "csv":
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        df.columns = [str(column) for column in df.columns]
        return df
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to read dataset file.",
        ) from exc


def _apply_search(df: pd.DataFrame, search: str | None) -> pd.DataFrame:
    if not search or not search.strip():
        return df

    query = search.strip().lower()
    searchable_df = df.fillna("").astype(str)
    mask = searchable_df.apply(
        lambda column: column.str.lower().str.contains(query, na=False, regex=False)
    ).any(axis=1)

    return df[mask]


def _apply_sort(
    df: pd.DataFrame,
    sort_by: str | None,
    sort_order: Literal["asc", "desc"],
) -> pd.DataFrame:
    if not sort_by:
        return df

    if sort_by not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sort column not found: {sort_by}.",
        )

    try:
        return df.sort_values(
            by=sort_by,
            ascending=sort_order == "asc",
            na_position="last",
            kind="mergesort",
        )
    except TypeError:
        return df.sort_values(
            by=sort_by,
            ascending=sort_order == "asc",
            kind="mergesort",
            key=lambda column: column.fillna("").astype(str),
        )


def _to_json_safe_value(value: Any) -> Any:
    if pd.isna(value):
        return None

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if isinstance(value, np.generic):
        return value.item()

    return value


def _rows_to_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []

    for row in df.to_dict(orient="records"):
        records.append(
            {str(key): _to_json_safe_value(value) for key, value in row.items()}
        )

    return records


@router.get("/explore/{filename}")
def explore_dataset(
    filename: str,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
    search: str | None = Query(default=None),
    sort_by: str | None = Query(default=None),
    sort_order: Literal["asc", "desc"] = Query(default="asc"),
) -> dict[str, Any]:
    file_path = _resolve_uploaded_file(filename)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )

    df = _load_dataset(file_path)
    columns = [str(column) for column in df.columns]
    filtered_df = _apply_search(df, search)
    sorted_df = _apply_sort(filtered_df, sort_by, sort_order)

    total_rows = int(len(sorted_df))
    total_pages = max(ceil(total_rows / page_size), 1)
    current_page = min(page, total_pages)
    start = (current_page - 1) * page_size
    end = start + page_size
    page_df = sorted_df.iloc[start:end]

    return {
        "filename": Path(filename).name,
        "columns": columns,
        "rows": _rows_to_records(page_df),
        "pagination": {
            "page": current_page,
            "page_size": page_size,
            "total_rows": total_rows,
            "total_pages": total_pages,
        },
    }
