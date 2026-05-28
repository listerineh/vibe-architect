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
    architecture: Optional[str] = None  # User-selected architecture (e.g., "MVC", "Flat/Simple")


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


class ProjectAnalysisResponseDTO(BaseModel):
    """Response from project complexity analysis"""
    size: Literal["small", "medium", "large"]
    reasoning: str
    tree: List[str]
    estimated_files: int
    complexity_score: int = Field(ge=1, le=10)
    required_base_files: List[str]


class ArchitectureProposalDTO(BaseModel):
    """Single architecture proposal"""
    name: str
    reasoning: str
    complexity: Literal["low", "medium", "high"]
    pros: List[str]
    cons: List[str]
    estimated_files: int
    example_structure: List[str]


class ArchitectureAnalysisResponseDTO(BaseModel):
    """Response with architecture proposals"""
    project_size: Literal["small", "medium", "large"]
    complexity_score: int = Field(ge=1, le=10)
    reasoning: str
    proposed_architectures: List[ArchitectureProposalDTO]
    recommended: str
