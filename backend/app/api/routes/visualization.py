from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.visualization.chart_planner import ChartPlanningError
from app.services.visualization.chart_service import (
    ChartServiceError,
    generate_chart,
)


router = APIRouter()


class VisualizationRequest(BaseModel):
    filename: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


@router.post("/visualization")
def create_visualization(request: VisualizationRequest) -> dict[str, Any]:
    filename = request.filename.strip()
    message = request.message.strip()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="filename is required",
        )

    if not message:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="message is required",
        )

    try:
        return generate_chart(filename=filename, message=message)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except ChartPlanningError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ChartServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
