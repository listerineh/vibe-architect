from abc import ABC, abstractmethod
from src.domain.entities.project import ProjectRequest, Boilerplate


class AIServicePort(ABC):
    """Port for AI service interactions (Vertex AI, OpenAI, etc.)"""
    
    @abstractmethod
    async def generate_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        """Generate a boilerplate project structure using AI"""
        pass
