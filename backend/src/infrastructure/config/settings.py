from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import Field, field_validator


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Gemini API (Google AI Studio) - Recomendado para desarrollo
    gemini_api_key: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    gemini_model: str = Field(default="gemini-2.5-flash", env="GEMINI_MODEL")
    use_mock: bool = Field(default=True, env="USE_MOCK")  # Set to True to use mock data
    
    # Vertex AI (Producción) - Opcional
    gcp_project_id: Optional[str] = None
    gcp_location: str = "us-central1"
    vertex_ai_model: str = "gemini-2.5-flash"
    google_application_credentials: Optional[str] = None
    
    # General
    cors_origins: str = "http://localhost:3000"
    system_prompt_path: str = "../prompts/system-prompt.md"
    log_level: str = Field(default="INFO", env="LOG_LEVEL")  # DEBUG, INFO, WARNING, ERROR
    
    # Firebase Admin SDK
    firebase_service_account_key: Optional[str] = Field(default=None, env="FIREBASE_SERVICE_ACCOUNT_KEY")
    
    # Firebase Storage
    firebase_storage_bucket: str = Field(
        default="vibe-architect-676ae.firebasestorage.app",
        env="FIREBASE_STORAGE_BUCKET"
    )
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return v
        return v
    
    def get_cors_origins_list(self) -> list[str]:
        """Convert cors_origins string to list"""
        return [origin.strip() for origin in self.cors_origins.split(',')]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        env_file_encoding = 'utf-8'


settings = Settings()
