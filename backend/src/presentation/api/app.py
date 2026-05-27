from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys
from src.infrastructure.config.settings import settings
from src.infrastructure.adapters.vertex_ai_adapter import VertexAIAdapter
from src.infrastructure.adapters.zip_file_generator import ZipFileGenerator
from src.infrastructure.adapters.memory_cache import MemoryCache
from src.application.use_cases.generate_boilerplate import GenerateBoilerplateUseCase
from src.application.use_cases.preview_boilerplate import PreviewBoilerplateUseCase
from src.application.use_cases.analyze_project import AnalyzeProjectUseCase
from src.application.use_cases.generate_adaptive_boilerplate import GenerateAdaptiveBoilerplateUseCase
from src.presentation.api.routes import create_router
from pathlib import Path


def configure_logging():
    """Configure loguru with level from environment variable"""
    # Remove default logger
    logger.remove()
    
    # Add custom logger with level from settings
    logger.add(
        sys.stderr,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level=settings.log_level.upper(),
        colorize=True
    )
    
    logger.info(f"Logging configured with level: {settings.log_level.upper()}")


def create_app() -> FastAPI:
    """Application factory with dependency injection"""
    
    # Configure logging first
    configure_logging()
    
    app = FastAPI(
        title="VibeArchitect API",
        description="AI-First Boilerplate Generator",
        version="0.2.1-alpha"
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.get_cors_origins_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    ai_adapter = VertexAIAdapter()
    file_generator = ZipFileGenerator()
    cache = MemoryCache(ttl_minutes=30)  # Cache previews for 30 minutes
    
    # Get templates path
    backend_dir = Path(__file__).parent.parent.parent.parent
    templates_path = backend_dir / "templates"
    
    generate_use_case = GenerateBoilerplateUseCase(ai_adapter, file_generator)
    preview_use_case = PreviewBoilerplateUseCase(ai_adapter)
    analyze_use_case = AnalyzeProjectUseCase(ai_adapter)
    adaptive_use_case = GenerateAdaptiveBoilerplateUseCase(ai_adapter, templates_path)
    
    router = create_router(generate_use_case, preview_use_case, analyze_use_case, adaptive_use_case, cache)
    app.include_router(router)
    
    @app.get("/")
    async def root():
        return {
            "service": "VibeArchitect API",
            "version": "0.2.1-alpha",
            "status": "operational"
        }
    
    return app


app = create_app()
