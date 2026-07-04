from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.chat.dataset_context import DatasetContextError, resolve_uploaded_file
from app.services.insights.insight_service import (
    BusinessInsights,
    InsightConfigurationError,
    InsightServiceError,
    generate_business_insights,
)


router = APIRouter()


class InsightRequest(BaseModel):
    filename: str = Field(..., min_length=1)


class InsightResponse(BaseModel):
    success: bool
    insights: BusinessInsights


@router.post("/insights", response_model=InsightResponse)
def create_insights(request: InsightRequest) -> InsightResponse:
    filename = request.filename.strip()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="filename is required",
        )

    try:
        resolve_uploaded_file(filename)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except DatasetContextError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    try:
        insights = generate_business_insights(filename)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except InsightConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except DatasetContextError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except InsightServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return InsightResponse(success=True, insights=insights)
