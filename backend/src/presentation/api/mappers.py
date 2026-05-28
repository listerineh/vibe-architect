from src.domain.entities.project import (
    ProjectRequest,
    TechPreferences,
    CSSFramework,
    Boilerplate,
    StackType
)
from src.presentation.api.schemas import (
    ProjectRequestDTO,
    TechPreferencesDTO,
    BoilerplateResponseDTO,
    ProjectMetadataDTO,
    FileStructureDTO,
    DependenciesDTO,
    CursorRulesDTO
)


class DTOMapper:
    """Maps between DTOs and domain entities"""
    
    @staticmethod
    def to_project_request(dto: ProjectRequestDTO) -> ProjectRequest:
        """Convert DTO to domain entity"""
        return ProjectRequest(
            description=dto.description,
            tech_preferences=TechPreferences(
                framework=dto.tech_preferences.framework,
                language=dto.tech_preferences.language,
                css=CSSFramework(dto.tech_preferences.css),
                database=dto.tech_preferences.database,
                backend_service=dto.tech_preferences.backend_service
            )
        )
    
    @staticmethod
    def to_boilerplate_dto(boilerplate: Boilerplate) -> BoilerplateResponseDTO:
        """Convert domain entity to DTO"""
        return BoilerplateResponseDTO(
            project_metadata=ProjectMetadataDTO(
                name=boilerplate.project_metadata.name,
                stack_type=boilerplate.project_metadata.stack_type.value,
                explanation=boilerplate.project_metadata.explanation
            ),
            file_structure=[
                FileStructureDTO(
                    path=f.path,
                    content=f.content,
                    description=f.description
                )
                for f in boilerplate.file_structure
            ],
            dependencies=DependenciesDTO(
                main=boilerplate.dependencies.main,
                dev=boilerplate.dependencies.dev
            ),
            cursor_rules=CursorRulesDTO(
                content=boilerplate.cursor_rules.content,
                focus_areas=boilerplate.cursor_rules.focus_areas
            ),
            known_limitations=boilerplate.known_limitations,
            cost_optimizations=boilerplate.cost_optimizations
        )
