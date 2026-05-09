from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from enum import Enum


class CSSFramework(str, Enum):
    TAILWIND = "tailwind"
    SCSS = "scss"


class BackendService(str, Enum):
    NONE = "none"
    FIREBASE = "firebase"
    SUPABASE = "supabase"


class TechPreferencesDTO(BaseModel):
    """Technical preferences for the project"""
    framework: str = "nextjs"  # nextjs, react, astro
    language: str = "typescript"  # typescript, javascript
    css: CSSFramework = CSSFramework.TAILWIND
    database: Optional[str] = None
    backend_service: BackendService = BackendService.NONE


class ProjectRequestDTO(BaseModel):
    description: str = Field(..., min_length=10, max_length=500)
    tech_preferences: TechPreferencesDTO = TechPreferencesDTO()
    framework: str = "nextjs"  # nextjs, react, astro
    language: str = "typescript"  # typescript, javascript


class FileStructureDTO(BaseModel):
    path: str
    content: str
    description: str


class DependenciesDTO(BaseModel):
    main: List[str]
    dev: List[str]


class CursorRulesDTO(BaseModel):
    content: str
    focus_areas: List[str]


class ProjectMetadataDTO(BaseModel):
    name: str
    stack_type: Literal["google_mode", "agnostic"]
    explanation: str


class BoilerplateResponseDTO(BaseModel):
    session_id: str = ""  # Unique ID for caching (set by route handler)
    project_metadata: ProjectMetadataDTO
    file_structure: List[FileStructureDTO]
    dependencies: DependenciesDTO
    cursor_rules: CursorRulesDTO
    known_limitations: List[str]
    cost_optimizations: List[str] = []  # Cost saving suggestions


class GenerateRequestDTO(BaseModel):
    """Request for generating ZIP - can use session_id or full request"""
    session_id: str | None = None
    description: str | None = Field(None, min_length=10, max_length=500)
    google_mode: bool | None = None
    tech_preferences: TechPreferencesDTO | None = None


class FileStructureOnlyDTO(BaseModel):
    """Response with only file structure"""
    file_structure: List[FileStructureDTO]


class DependenciesOnlyDTO(BaseModel):
    """Response with only dependencies"""
    dependencies: DependenciesDTO


class FocusAreasOnlyDTO(BaseModel):
    """Response with only focus areas"""
    focus_areas: List[str]


class KnownLimitationsOnlyDTO(BaseModel):
    """Response with only known limitations"""
    known_limitations: List[str]


class CostOptimizationsDTO(BaseModel):
    """Response with cost optimization suggestions"""
    cost_optimizations: List[str]


class ProgressiveGenerationDTO(BaseModel):
    """Request for progressive generation"""
    description: str = Field(..., min_length=10, max_length=500)
    google_mode: bool = True
    tech_preferences: TechPreferencesDTO = TechPreferencesDTO()
    step: Literal["file_structure", "dependencies", "focus_areas", "limitations", "cost_optimizations"]
