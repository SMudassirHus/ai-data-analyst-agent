from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    APP_NAME: str = "InsightPilot AI API"
    APP_ENV: str = "local"
    API_PREFIX: str = "/api"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    GENERATED_REPORT_DIR: Path = BASE_DIR / "generated_reports"
    OPENAI_API_KEY: str = ""
    CHAT_MODEL: str = "gpt-5.5"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)


settings = Settings()
