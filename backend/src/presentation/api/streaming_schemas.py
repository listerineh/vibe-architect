from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel


class StreamEventType(str, Enum):
    """Types of streaming events"""
    STARTED = "started"
    PROGRESS = "progress"
    ARCHITECTURES_PROPOSED = "architectures_proposed"
    ARCHITECTURE_SELECTED = "architecture_selected"
    ANALYZING = "analyzing"
    MATCHING_TEMPLATES = "matching_templates"
    GENERATING_FILES = "generating_files"
    GENERATING_DOCS = "generating_docs"
    DOC_README_GENERATED = "doc_readme_generated"
    DOC_ARCHITECTURE_GENERATED = "doc_architecture_generated"
    DOC_CURSORRULES_GENERATED = "doc_cursorrules_generated"
    DOC_CONTRIBUTING_GENERATED = "doc_contributing_generated"
    DOC_KNOWLEDGE_GRAPH_GENERATED = "doc_knowledge_graph_generated"
    COMPLETE = "complete"
    ERROR = "error"


class StreamEvent(BaseModel):
    """Single streaming event"""
    event: StreamEventType
    progress: int  # 0-100
    message: str
    data: Optional[Any] = None
    
    def to_sse(self) -> str:
        """Convert to SSE format"""
        import json
        return f"data: {json.dumps(self.model_dump())}\n\n"
