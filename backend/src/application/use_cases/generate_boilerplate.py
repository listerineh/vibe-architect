from io import BytesIO
from src.domain.entities.project import ProjectRequest, Boilerplate
from src.domain.ports.ai_service import AIServicePort
from src.domain.ports.file_generator import FileGeneratorPort


class GenerateBoilerplateUseCase:
    """Use case for generating a complete boilerplate project"""
    
    def __init__(
        self,
        ai_service: AIServicePort,
        file_generator: FileGeneratorPort
    ):
        self._ai_service = ai_service
        self._file_generator = file_generator
    
    async def execute(self, request: ProjectRequest) -> BytesIO:
        """
        Generate a boilerplate and return it as a downloadable archive
        
        Args:
            request: Project specifications
            
        Returns:
            BytesIO: Archive file ready for download
        """
        boilerplate = await self._ai_service.generate_boilerplate(request)
        archive = self._file_generator.create_archive(boilerplate, request)
        return archive
