from src.domain.entities.project import ProjectRequest, Boilerplate
from src.domain.ports.ai_service import AIServicePort


class PreviewBoilerplateUseCase:
    """Use case for previewing boilerplate structure without downloading"""
    
    def __init__(self, ai_service: AIServicePort):
        self._ai_service = ai_service
    
    async def execute(self, request: ProjectRequest) -> Boilerplate:
        """
        Generate boilerplate structure for preview
        
        Args:
            request: Project specifications
            
        Returns:
            Boilerplate: Complete project structure
        """
        return await self._ai_service.generate_boilerplate(request)
