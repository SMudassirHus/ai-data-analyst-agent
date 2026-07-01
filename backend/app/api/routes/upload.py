from datetime import UTC, datetime
from pathlib import Path
from shutil import copyfile
from uuid import uuid4

from fastapi import APIRouter, HTTPException, UploadFile, status

from app.core.config import settings


router = APIRouter()

ALLOWED_FILE_TYPES = {"csv", "xlsx", "xls"}
SAMPLE_DATA_DIR = Path(__file__).resolve().parents[3] / "sample_data"
SAMPLE_FILES = {
    "hr_analytics": "hr_analytics.csv",
    "sales_analytics": "sales_analytics.csv",
    "marketing_campaign": "marketing_campaign.csv",
}


def get_file_type(filename: str) -> str:
    suffix = Path(filename).suffix.lower().lstrip(".")

    if suffix not in ALLOWED_FILE_TYPES:
        allowed = ", ".join(sorted(ALLOWED_FILE_TYPES))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed file types: {allowed}.",
        )

    return suffix


@router.post("/upload")
async def upload_file(file: UploadFile) -> dict[str, object]:
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A file with a valid filename is required.",
        )

    original_filename = Path(file.filename.replace("\\", "/")).name
    file_type = get_file_type(original_filename)
    saved_filename = f"{uuid4().hex}.{file_type}"
    destination = settings.UPLOAD_DIR / saved_filename

    try:
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        size_bytes = 0
        with destination.open("wb") as output_file:
            while chunk := await file.read(1024 * 1024):
                size_bytes += len(chunk)
                output_file.write(chunk)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save uploaded file.",
        ) from exc
    finally:
        await file.close()

    return {
        "filename": saved_filename,
        "original_filename": original_filename,
        "size_bytes": size_bytes,
        "file_type": file_type,
        "uploaded_at": datetime.now(UTC).isoformat(),
        "success": True,
    }


@router.post("/upload/sample/{sample_id}")
def upload_sample_dataset(sample_id: str) -> dict[str, object]:
    sample_filename = SAMPLE_FILES.get(sample_id)

    if not sample_filename:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sample dataset not found.",
        )

    source = SAMPLE_DATA_DIR / sample_filename

    if not source.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sample dataset file is missing.",
        )

    file_type = get_file_type(sample_filename)
    saved_filename = f"{uuid4().hex}.{file_type}"
    destination = settings.UPLOAD_DIR / saved_filename

    try:
        settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        copyfile(source, destination)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to load sample dataset.",
        ) from exc

    return {
        "filename": saved_filename,
        "original_filename": sample_filename,
        "size_bytes": destination.stat().st_size,
        "file_type": file_type,
        "uploaded_at": datetime.now(UTC).isoformat(),
        "success": True,
    }
