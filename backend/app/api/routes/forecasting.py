from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.forecasting.forecasting_service import (
    ForecastingError,
    generate_forecast,
)


router = APIRouter()


class ForecastRequest(BaseModel):
    filename: str = Field(..., min_length=1)
    date_column: str = Field(..., min_length=1)
    value_column: str = Field(..., min_length=1)
    periods: int = Field(default=6, ge=1, le=24)


@router.post("/forecast")
def create_forecast(request: ForecastRequest) -> dict:
    filename = request.filename.strip()
    date_column = request.date_column.strip()
    value_column = request.value_column.strip()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="filename is required",
        )

    if not date_column:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="date_column is required",
        )

    if not value_column:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="value_column is required",
        )

    try:
        return generate_forecast(
            filename=filename,
            date_column=date_column,
            value_column=value_column,
            periods=request.periods,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except ForecastingError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
