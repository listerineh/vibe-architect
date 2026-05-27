from abc import ABC, abstractmethod
from src.domain.entities.project import TechPreferences
from src.domain.entities.project_analysis import ProjectAnalysis


class AIServicePort(ABC):
    """Port for AI service interactions (Vertex AI, OpenAI, etc.)"""
    
    @abstractmethod
    def analyze_project_complexity(
        self, 
        description: str, 
        tech_preferences: TechPreferences
    ) -> ProjectAnalysis:
        """Analyze project complexity and generate file tree structure"""
        pass
