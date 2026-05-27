from src.domain.entities.project import ProjectRequest
from src.domain.entities.project_analysis import ProjectAnalysis
from src.domain.ports.ai_service import AIServicePort
import logging

logger = logging.getLogger(__name__)


class AnalyzeProjectUseCase:
    def __init__(self, ai_adapter: AIServicePort):
        self.ai_adapter = ai_adapter
    
    def execute(self, request: ProjectRequest) -> ProjectAnalysis:
        logger.info(f"=== ANALYZING PROJECT COMPLEXITY ===")
        logger.debug(f"Description: {request.description}")
        logger.debug(f"Tech: {request.tech_preferences.framework} + {request.tech_preferences.language}")
        
        try:
            analysis = self.ai_adapter.analyze_project_complexity(
                description=request.description,
                tech_preferences=request.tech_preferences
            )
            
            logger.info(f"✅ Analysis complete: {analysis.size.upper()} project")
            logger.debug(f"Estimated files: {analysis.estimated_files}")
            logger.debug(f"Complexity score: {analysis.complexity_score}/10")
            logger.debug(f"Tree structure: {len(analysis.tree)} paths")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze project: {str(e)}")
            raise
