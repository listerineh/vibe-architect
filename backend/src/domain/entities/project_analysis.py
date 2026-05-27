from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class ProjectSize(str, Enum):
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"


class ProjectAnalysis(BaseModel):
    size: ProjectSize = Field(
        description="Project complexity size: small, medium, or large"
    )
    reasoning: str = Field(
        description="Brief explanation of why this size was chosen"
    )
    tree: List[str] = Field(
        description="List of file paths to generate (no content, just structure)"
    )
    estimated_files: int = Field(
        description="Total number of files to generate",
        ge=1
    )
    complexity_score: int = Field(
        description="Complexity score from 1 (simple) to 10 (very complex)",
        ge=1,
        le=10
    )
    required_base_files: List[str] = Field(
        default_factory=list,
        description="Critical files needed for npm install & npm run dev to work"
    )
    
    class Config:
        use_enum_values = True
