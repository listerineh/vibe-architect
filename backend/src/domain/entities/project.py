from dataclasses import dataclass
from typing import List
from enum import Enum


class StackType(Enum):
    GOOGLE_MODE = "google_mode"
    AGNOSTIC = "agnostic"


class CSSFramework(Enum):
    TAILWIND = "tailwind"
    SCSS = "scss"


@dataclass(frozen=True)
class TechPreferences:
    framework: str = "nextjs"  # nextjs, react, astro
    language: str = "typescript"  # typescript, javascript
    css: CSSFramework = CSSFramework.TAILWIND
    database: str | None = None
    backend_service: str | None = None


@dataclass(frozen=True)
class ProjectRequest:
    description: str
    tech_preferences: TechPreferences
    
    @property
    def google_mode(self) -> bool:
        """Compatibility property: returns True if backend is Firebase"""
        return self.tech_preferences.backend_service == "firebase"
    
    def __post_init__(self):
        if len(self.description) < 10 or len(self.description) > 500:
            raise ValueError("Description must be between 10 and 500 characters")


@dataclass(frozen=True)
class FileStructure:
    path: str
    content: str
    description: str


@dataclass(frozen=True)
class Dependencies:
    main: List[str]
    dev: List[str]


@dataclass(frozen=True)
class CursorRules:
    content: str
    focus_areas: List[str]


@dataclass(frozen=True)
class ProjectMetadata:
    name: str
    stack_type: StackType
    explanation: str


@dataclass(frozen=True)
class Boilerplate:
    project_metadata: ProjectMetadata
    file_structure: List[FileStructure]
    dependencies: Dependencies
    cursor_rules: CursorRules
    known_limitations: List[str]
    cost_optimizations: List[str]
