from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from app.core.config import settings
from app.services.profiling.profiler import ProfilingError, profile_dataset


router = APIRouter()


def _resolve_uploaded_file(filename: str) -> Path:
    safe_filename = Path(filename).name

    if safe_filename != filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid filename.",
        )

    return settings.UPLOAD_DIR / safe_filename


@router.get("/profile/{filename}")
def get_dataset_profile(filename: str) -> dict[str, object]:
    file_path = _resolve_uploaded_file(filename)

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )

    try:
        return profile_dataset(file_path)
    except ProfilingError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate dataset profile.",
        ) from exc
