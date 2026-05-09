from abc import ABC, abstractmethod
from io import BytesIO
from src.domain.entities.project import Boilerplate, ProjectRequest


class FileGeneratorPort(ABC):
    """Port for file generation (ZIP, tar.gz, etc.)"""
    
    @abstractmethod
    def create_archive(self, boilerplate: Boilerplate, request: ProjectRequest = None) -> BytesIO:
        """Create a downloadable archive from boilerplate
        
        Args:
            boilerplate: The generated boilerplate structure
            request: Optional project request with tech preferences for skill selection
        """
        pass
