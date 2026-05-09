from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from loguru import logger
from src.presentation.api.schemas import ProjectRequestDTO, BoilerplateResponseDTO, GenerateRequestDTO, TechPreferencesDTO
from src.presentation.api.mappers import DTOMapper
from src.application.use_cases.generate_boilerplate import GenerateBoilerplateUseCase
from src.application.use_cases.preview_boilerplate import PreviewBoilerplateUseCase
from src.infrastructure.adapters.memory_cache import MemoryCache


def create_router(
    generate_use_case: GenerateBoilerplateUseCase,
    preview_use_case: PreviewBoilerplateUseCase,
    cache: MemoryCache
) -> APIRouter:
    """Factory function to create API router with injected dependencies"""
    
    router = APIRouter(prefix="/api", tags=["boilerplate"])
    
    @router.get("/health")
    async def health():
        """Health check endpoint"""
        return {"status": "healthy", "service": "VibeArchitect API"}
    
    @router.post("/refine-description")
    async def refine_description(request_dto: ProjectRequestDTO):
        """Refine user description with AI to be more specific and clear"""
        logger.info("=== REFINE DESCRIPTION REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            import vertexai
            from vertexai.generative_models import GenerativeModel
            from src.infrastructure.config.settings import settings
            
            logger.debug("Configuring Vertex AI...")
            # Configure Vertex AI
            vertexai.init(
                project=settings.gcp_project_id,
                location=settings.gcp_location
            )
            model = GenerativeModel(settings.vertex_ai_model)
            logger.debug(f"Using model: {settings.vertex_ai_model}")
            
            # Create refinement prompt
            refinement_prompt = f"""You are a technical requirements analyst. The user wants to create a web application and provided this description:

"{request_dto.description}"

Your task: Refine this description to be more specific, clear, and technical. Focus on:
1. Core functionality (what the app does)
2. Key features (main capabilities)
3. User experience (how users interact)
4. Technical requirements (if mentioned)

IMPORTANT: Keep the user's original intent! Don't change what they want to build.

Output ONLY the refined description (2-3 sentences, max 200 words). Be concise and specific.

Refined description:"""
            
            logger.debug(f"Prompt length: {len(refinement_prompt)} characters")
            logger.debug(f"Full prompt:\n{refinement_prompt}")
            
            # Generate refined description
            logger.info("Calling Gemini API for refinement...")
            response = model.generate_content(
                refinement_prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 2048,
                }
            )
            
            logger.debug(f"Raw API response: {response}")
            logger.debug(f"Response candidates: {response.candidates if hasattr(response, 'candidates') else 'N/A'}")
            
            refined = response.text.strip()
            
            logger.info("✅ Refinement successful")
            logger.debug(f"Original description: '{request_dto.description}'")
            logger.debug(f"Refined description: '{refined}'")
            logger.info(f"Length: {len(request_dto.description)} → {len(refined)} characters")
            
            response_data = {
                "original": request_dto.description,
                "refined": refined,
                "tech_preferences": request_dto.tech_preferences
            }
            
            logger.debug(f"Response data: {response_data}")
            logger.info("=== REFINE DESCRIPTION COMPLETE ===\n")
            
            return response_data
            
        except Exception as e:
            logger.error(f"❌ Refinement failed: {str(e)}")
            logger.exception("Full exception traceback:")
            raise HTTPException(status_code=500, detail=f"Failed to refine description: {str(e)}")
    
    @router.post("/preview", response_model=BoilerplateResponseDTO)
    async def preview_boilerplate(request_dto: ProjectRequestDTO):
        """Preview boilerplate structure and generate ZIP for later download"""
        logger.info("=== PREVIEW BOILERPLATE REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            logger.debug("Converting DTO to domain request...")
            domain_request = DTOMapper.to_project_request(request_dto)
            logger.debug(f"Domain request: {domain_request}")
            
            logger.info("Executing preview use case...")
            boilerplate = await preview_use_case.execute(domain_request)
            logger.info(f"✅ Boilerplate generated: {boilerplate.project_metadata.name}")
            logger.debug(f"Files generated: {len(boilerplate.file_structure)}")
            
            # Generate ZIP archive immediately
            logger.info("Generating ZIP archive for caching...")
            zip_buffer = generate_use_case._file_generator.create_archive(boilerplate, domain_request)
            logger.info(f"✅ ZIP archive generated ({zip_buffer.getbuffer().nbytes} bytes)")
            
            # Cache both the boilerplate and ZIP
            session_id = cache.set(boilerplate, zip_buffer)
            logger.info(f"Cached boilerplate and ZIP with session_id: {session_id}")
            
            # Return DTO with session_id
            response_dto = DTOMapper.to_boilerplate_dto(boilerplate)
            response_dto.session_id = session_id
            
            logger.debug(f"Response DTO: {response_dto.model_dump(exclude={'file_structure'})}")
            logger.info("=== PREVIEW COMPLETE ===\n")
            
            return response_dto
        except ValueError as e:
            logger.error(f"❌ Validation error: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            logger.error(f"❌ Preview failed: {str(e)}")
            logger.exception("Full exception traceback:")
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    @router.post("/generate")
    async def generate_boilerplate(request_dto: GenerateRequestDTO):
        """Download pre-generated boilerplate ZIP"""
        logger.info("=== GENERATE BOILERPLATE REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            # Try to use cached ZIP first
            if request_dto.session_id:
                logger.info(f"Attempting to retrieve cached ZIP: {request_dto.session_id}")
                
                # Get cached ZIP
                zip_buffer = cache.get_zip(request_dto.session_id)
                if zip_buffer:
                    # Get boilerplate for filename
                    boilerplate = cache.get(request_dto.session_id)
                    filename = f"{boilerplate.project_metadata.name}.zip" if boilerplate else "boilerplate.zip"
                    
                    logger.info(f"✅ Cache hit! Serving cached ZIP: {filename}")
                    logger.info(f"ZIP size: {zip_buffer.getbuffer().nbytes} bytes")
                    logger.info("=== GENERATE COMPLETE (CACHED) ===\n")
                    
                    # Reset buffer position to beginning
                    zip_buffer.seek(0)
                    
                    return StreamingResponse(
                        zip_buffer,
                        media_type="application/zip",
                        headers={"Content-Disposition": f"attachment; filename={filename}"}
                    )
                else:
                    logger.warning(f"❌ Cache miss for session_id: {request_dto.session_id}")
                    raise HTTPException(status_code=404, detail="Session expired or not found. Please preview again.")
            
            # Fallback: generate fresh boilerplate (should rarely happen)
            if not request_dto.description:
                raise HTTPException(status_code=400, detail="Either session_id or description is required")
            
            logger.warning("⚠️  No session_id provided, generating fresh boilerplate...")
            
            # Convert to ProjectRequestDTO for generation
            project_request_dto = ProjectRequestDTO(
                description=request_dto.description,
                tech_preferences=request_dto.tech_preferences or TechPreferencesDTO()
            )
            domain_request = DTOMapper.to_project_request(project_request_dto)
            zip_buffer = await generate_use_case.execute(domain_request)
            
            filename = f"{domain_request.description.lower().replace(' ', '-')[:30]}.zip"
            
            logger.info("=== GENERATE COMPLETE (FRESH) ===\n")
            
            return StreamingResponse(
                zip_buffer,
                media_type="application/zip",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    
    return router
