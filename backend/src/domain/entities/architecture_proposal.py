from enum import Enum
from typing import List
from pydantic import BaseModel, Field


class ArchitectureComplexity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ArchitectureProposal(BaseModel):
    """Proposed architecture for a project"""
    name: str = Field(
        description="Architecture name (e.g., MVC, Clean, Hexagonal, Feature-Sliced)"
    )
    reasoning: str = Field(
        description="Why this architecture is appropriate for this project"
    )
    complexity: ArchitectureComplexity = Field(
        description="Implementation complexity level"
    )
    pros: List[str] = Field(
        description="Advantages of this architecture (3-4 items)"
    )
    cons: List[str] = Field(
        description="Disadvantages or trade-offs (2-3 items)"
    )
    estimated_files: int = Field(
        description="Estimated number of files with this architecture",
        ge=1
    )
    example_structure: List[str] = Field(
        description="Example file structure (first 10-15 files)",
        max_items=15
    )
    
    class Config:
        use_enum_values = True


class ArchitectureAnalysis(BaseModel):
    """Complete analysis with architecture proposals"""
    project_size: str = Field(
        description="Project size: small, medium, or large"
    )
    complexity_score: int = Field(
        description="Overall complexity score 1-10",
        ge=1,
        le=10
    )
    reasoning: str = Field(
        description="Why this project size and complexity"
    )
    proposed_architectures: List[ArchitectureProposal] = Field(
        description="List of appropriate architectures (2-4 options)"
    )
    recommended: str = Field(
        description="Name of the recommended architecture"
    )
