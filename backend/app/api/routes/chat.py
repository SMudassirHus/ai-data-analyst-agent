from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.chat.chat_service import (
    ChatConfigurationError,
    ChatServiceError,
    answer_dataset_question,
)
from app.services.chat.dataset_context import DatasetContextError, resolve_uploaded_file


router = APIRouter()


class ChatRequest(BaseModel):
    filename: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)


class ChatResponse(BaseModel):
    answer: str
    success: bool


@router.post("/chat", response_model=ChatResponse)
def chat_with_dataset(request: ChatRequest) -> ChatResponse:
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
        answer = answer_dataset_question(filename=filename, message=message)
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )
    except ChatConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except DatasetContextError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except ChatServiceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    return ChatResponse(answer=answer, success=True)
