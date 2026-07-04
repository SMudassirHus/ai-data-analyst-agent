from pathlib import Path

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.reports.pdf_generator import generate_report_pdf
from app.services.reports.report_builder import ReportBuildError, build_report_data


router = APIRouter()


class ReportGenerateRequest(BaseModel):
    filename: str = Field(..., min_length=1)


@router.post("/reports/generate")
def generate_report(request: ReportGenerateRequest) -> dict:
    filename = request.filename.strip()

    if not filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="filename is required",
        )

    try:
        report_data = build_report_data(filename)
        report_id, _ = generate_report_pdf(report_data)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except ReportBuildError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return {
        "success": True,
        "report_id": report_id,
        "download_url": f"/api/reports/download/{report_id}",
        "preview": report_data["preview"],
    }


@router.get("/reports/download/{report_id}")
def download_report(report_id: str) -> FileResponse:
    safe_report_id = Path(report_id).name

    if safe_report_id != report_id or not safe_report_id.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report id.",
        )

    report_path = settings.GENERATED_REPORT_DIR / safe_report_id

    if not report_path.exists() or not report_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found.",
        )

    return FileResponse(
        path=report_path,
        media_type="application/pdf",
        filename=safe_report_id,
    )
