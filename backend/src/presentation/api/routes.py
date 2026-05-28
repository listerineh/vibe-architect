from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from loguru import logger
from src.presentation.api.middleware.auth_middleware import get_current_user_optional
from src.presentation.api.schemas import (
    ProjectRequestDTO, 
    BoilerplateResponseDTO, 
    GenerateRequestDTO, 
    TechPreferencesDTO,
    ProjectAnalysisResponseDTO,
    ArchitectureAnalysisResponseDTO,
    ArchitectureProposalDTO
)
from src.presentation.api.mappers import DTOMapper
from src.application.use_cases.generate_boilerplate import GenerateBoilerplateUseCase
from src.application.use_cases.preview_boilerplate import PreviewBoilerplateUseCase
from src.application.use_cases.analyze_project import AnalyzeProjectUseCase
from src.application.use_cases.generate_adaptive_boilerplate import GenerateAdaptiveBoilerplateUseCase
from src.infrastructure.adapters.memory_cache import MemoryCache


def create_router(
    generate_use_case: GenerateBoilerplateUseCase,
    preview_use_case: PreviewBoilerplateUseCase,
    analyze_use_case: AnalyzeProjectUseCase,
    adaptive_use_case: GenerateAdaptiveBoilerplateUseCase,
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
    
    @router.post("/analyze-project", response_model=ProjectAnalysisResponseDTO)
    async def analyze_project(request_dto: ProjectRequestDTO):
        """Analyze project complexity and generate file tree structure"""
        logger.info("=== ANALYZE PROJECT REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            # Convert DTO to domain request
            domain_request = DTOMapper.to_project_request(request_dto)
            
            # Execute analysis use case
            analysis = analyze_use_case.execute(domain_request)
            
            # Convert to response DTO
            response = ProjectAnalysisResponseDTO(
                size=analysis.size.value,
                reasoning=analysis.reasoning,
                tree=analysis.tree,
                estimated_files=analysis.estimated_files,
                complexity_score=analysis.complexity_score,
                required_base_files=analysis.required_base_files
            )
            
            logger.info(f"✅ Analysis complete: {response.size.upper()} project")
            logger.debug(f"Response: {response.model_dump()}")
            logger.info("=== ANALYZE PROJECT COMPLETE ===\n")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Analysis failed: {str(e)}")
            logger.exception("Full exception traceback:")
            raise HTTPException(status_code=500, detail=f"Failed to analyze project: {str(e)}")
    
    @router.post("/propose-architectures", response_model=ArchitectureAnalysisResponseDTO)
    async def propose_architectures(request_dto: ProjectRequestDTO):
        """Propose appropriate architectures for the project"""
        logger.info("=== PROPOSE ARCHITECTURES REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            # Convert DTO to domain request
            domain_request = DTOMapper.to_project_request(request_dto)
            
            # Call AI adapter directly (no use case needed for this)
            from src.infrastructure.adapters.vertex_ai_adapter import VertexAIAdapter
            ai_adapter = VertexAIAdapter()
            
            analysis = ai_adapter.propose_architectures(
                description=domain_request.description,
                tech_preferences=domain_request.tech_preferences
            )
            
            # Convert to response DTO
            proposals_dto = [
                ArchitectureProposalDTO(
                    name=prop.name,
                    reasoning=prop.reasoning,
                    complexity=prop.complexity.value,
                    pros=prop.pros,
                    cons=prop.cons,
                    estimated_files=prop.estimated_files,
                    example_structure=prop.example_structure
                )
                for prop in analysis.proposed_architectures
            ]
            
            response = ArchitectureAnalysisResponseDTO(
                project_size=analysis.project_size,
                complexity_score=analysis.complexity_score,
                reasoning=analysis.reasoning,
                proposed_architectures=proposals_dto,
                recommended=analysis.recommended
            )
            
            logger.info(f"✅ Proposed {len(proposals_dto)} architectures")
            logger.debug(f"Recommended: {response.recommended}")
            logger.info("=== PROPOSE ARCHITECTURES COMPLETE ===\n")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ Architecture proposal failed: {str(e)}")
            logger.exception("Full exception traceback:")
            raise HTTPException(status_code=500, detail=f"Failed to propose architectures: {str(e)}")
    
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
    
    @router.post("/preview-adaptive", response_model=BoilerplateResponseDTO)
    async def preview_adaptive_boilerplate(request_dto: ProjectRequestDTO):
        """Preview boilerplate with ADAPTIVE architecture based on complexity"""
        logger.info("=== ADAPTIVE PREVIEW REQUEST ===")
        logger.debug(f"Request DTO: {request_dto.model_dump()}")
        
        try:
            logger.debug("Converting DTO to domain request...")
            domain_request = DTOMapper.to_project_request(request_dto)
            logger.debug(f"Domain request: {domain_request}")
            
            logger.info("Executing ADAPTIVE generation...")
            boilerplate = adaptive_use_case.execute(domain_request)
            logger.info(f"✅ Adaptive boilerplate generated: {boilerplate.project_metadata.name}")
            logger.debug(f"Files generated: {len(boilerplate.file_structure)}")
            
            # Generate ZIP archive
            logger.info("Generating ZIP archive...")
            zip_buffer = generate_use_case._file_generator.create_archive(boilerplate, domain_request)
            logger.info(f"✅ ZIP archive generated ({zip_buffer.getbuffer().nbytes} bytes)")
            
            # Cache both
            session_id = cache.set(boilerplate, zip_buffer)
            logger.info(f"Cached with session_id: {session_id}")
            
            # Return DTO
            response_dto = DTOMapper.to_boilerplate_dto(boilerplate)
            response_dto.session_id = session_id
            
            logger.info("=== ADAPTIVE PREVIEW COMPLETE ===\n")
            
            return response_dto
            
        except Exception as e:
            logger.error(f"❌ Adaptive preview failed: {str(e)}")
            logger.exception("Full exception traceback:")
            raise HTTPException(status_code=500, detail=f"Failed to generate adaptive boilerplate: {str(e)}")
    
    @router.post("/generate-streaming")
    async def generate_streaming(
        request_dto: ProjectRequestDTO,
        current_user: dict = Depends(get_current_user_optional)
    ):
        """Generate boilerplate with real-time progress streaming (SSE)"""
        import json
        import asyncio
        from src.presentation.api.streaming_schemas import StreamEvent, StreamEventType
        
        logger.info("=== STREAMING GENERATION REQUEST ===")
        logger.debug(f"Description: {request_dto.description}")
        logger.debug(f"Tech Preferences: {request_dto.tech_preferences.model_dump()}")
        logger.info(f"Architecture: {request_dto.architecture or 'Not selected (will propose)'}")
        
        async def event_generator():
            try:
                # Step 1: Started
                yield StreamEvent(
                    event=StreamEventType.STARTED,
                    progress=0,
                    message="Starting generation..."
                ).to_sse()
                await asyncio.sleep(0.5)
                
                # Step 2: Propose architectures
                yield StreamEvent(
                    event=StreamEventType.PROGRESS,
                    progress=10,
                    message="Analyzing project and proposing architectures..."
                ).to_sse()
                
                domain_request = DTOMapper.to_project_request(request_dto)
                
                # Call AI to propose architectures
                from src.infrastructure.adapters.vertex_ai_adapter import VertexAIAdapter
                ai_adapter = VertexAIAdapter()
                
                arch_analysis = ai_adapter.propose_architectures(
                    description=domain_request.description,
                    tech_preferences=domain_request.tech_preferences
                )
                
                # Step 3: Architectures proposed
                yield StreamEvent(
                    event=StreamEventType.ARCHITECTURES_PROPOSED,
                    progress=30,
                    message=f"Proposed {len(arch_analysis.proposed_architectures)} architectures",
                    data={
                        "project_size": arch_analysis.project_size,
                        "complexity_score": arch_analysis.complexity_score,
                        "reasoning": arch_analysis.reasoning,
                        "proposed_architectures": [
                            {
                                "name": prop.name,
                                "reasoning": prop.reasoning,
                                "complexity": prop.complexity.value if hasattr(prop.complexity, 'value') else prop.complexity,
                                "pros": prop.pros,
                                "cons": prop.cons,
                                "estimated_files": prop.estimated_files,
                                "example_structure": prop.example_structure
                            }
                            for prop in arch_analysis.proposed_architectures
                        ],
                        "recommended": arch_analysis.recommended
                    }
                ).to_sse()
                
                # STOP HERE if no architecture selected - wait for user choice
                if not request_dto.architecture:
                    logger.info("⏸️  No architecture selected - waiting for user choice")
                    yield StreamEvent(
                        event=StreamEventType.PROGRESS,
                        progress=30,
                        message="Waiting for architecture selection...",
                        data={"waiting": True}
                    ).to_sse()
                    return  # Stop streaming here
                
                # Continue with user-selected architecture
                selected_architecture = request_dto.architecture
                logger.info(f"✅ Architecture selected by user: {selected_architecture}")
                
                yield StreamEvent(
                    event=StreamEventType.ARCHITECTURE_SELECTED,
                    progress=35,
                    message=f"Using architecture: {selected_architecture}",
                    data={"selected": selected_architecture}
                ).to_sse()
                await asyncio.sleep(0.5)
                
                # Step 4: Analyzing project
                yield StreamEvent(
                    event=StreamEventType.ANALYZING,
                    progress=40,
                    message="Analyzing complexity and generating file structure..."
                ).to_sse()
                
                analysis = ai_adapter.analyze_project_complexity(
                    description=domain_request.description,
                    tech_preferences=domain_request.tech_preferences,
                    architecture=selected_architecture
                )
                
                yield StreamEvent(
                    event=StreamEventType.PROGRESS,
                    progress=50,
                    message=f"Structure generated: {analysis.estimated_files} files"
                ).to_sse()
                await asyncio.sleep(0.5)
                
                # Step 5: Matching templates
                yield StreamEvent(
                    event=StreamEventType.MATCHING_TEMPLATES,
                    progress=60,
                    message="Matching template files..."
                ).to_sse()
                
                # Step 6: Generating docs - Start
                yield StreamEvent(
                    event=StreamEventType.GENERATING_DOCS,
                    progress=70,
                    message="Generating AI documentation..."
                ).to_sse()
                await asyncio.sleep(0.3)
                
                # Create queue for doc generation events
                import queue
                import threading
                doc_event_queue = queue.Queue()
                
                # Execute adaptive generation in a thread to allow event consumption
                def run_generation():
                    return adaptive_use_case.execute(
                        domain_request, 
                        selected_architecture=selected_architecture,
                        event_queue=doc_event_queue
                    )
                
                generation_thread = threading.Thread(target=lambda: doc_event_queue.put(("result", run_generation())))
                generation_thread.start()
                
                # Consume events from queue while generation is running
                boilerplate = None
                doc_count = 0
                total_docs = 5  # README, ARCHITECTURE, .cursorrules, CONTRIBUTING, KNOWLEDGE_GRAPH
                
                while generation_thread.is_alive() or not doc_event_queue.empty():
                    try:
                        event_type, data = doc_event_queue.get(timeout=0.1)
                        
                        if event_type == "result":
                            boilerplate = data
                            break
                        elif event_type.startswith("doc_"):
                            doc_count += 1
                            # Keep progress at 70% base, just show completion messages
                            yield StreamEvent(
                                event=StreamEventType[event_type.upper()],
                                progress=70,  # Fixed at 70% during parallel doc generation
                                message=f"{data} ({doc_count}/{total_docs})"
                            ).to_sse()
                            await asyncio.sleep(0.1)
                    except queue.Empty:
                        await asyncio.sleep(0.1)
                        continue
                
                generation_thread.join(timeout=1.0)
                
                if boilerplate is None:
                    raise Exception("Generation failed to produce boilerplate")
                
                yield StreamEvent(
                    event=StreamEventType.PROGRESS,
                    progress=90,
                    message="Documentation generated successfully"
                ).to_sse()
                await asyncio.sleep(0.3)
                
                # Step 7: Creating ZIP
                yield StreamEvent(
                    event=StreamEventType.PROGRESS,
                    progress=95,
                    message="Creating ZIP file..."
                ).to_sse()
                
                zip_buffer = generate_use_case._file_generator.create_archive(boilerplate, domain_request)
                session_id = cache.set(boilerplate, zip_buffer)
                logger.info(f"💾 Session saved to cache: {session_id}")
                logger.debug(f"📦 ZIP buffer size: {zip_buffer.getbuffer().nbytes} bytes")
                
                # Auto-save to Firestore if user is authenticated
                project_id = None
                if current_user:
                    try:
                        user_id = current_user['uid']
                        logger.info(f"🔐 User authenticated: {user_id} - Auto-saving project...")
                        
                        from src.application.services.project_service import ProjectService
                        project_service = ProjectService()
                        
                        # Prepare complete metadata for project details page
                        metadata = {
                            # Project info
                            'description': domain_request.description,
                            'project_size': analysis.size.value if hasattr(analysis.size, 'value') else str(analysis.size),
                            'complexity_score': analysis.complexity_score,
                            
                            # Tech stack
                            'tech_stack': {
                                'framework': domain_request.tech_preferences.framework,
                                'language': domain_request.tech_preferences.language,
                                'css': domain_request.tech_preferences.css.value if domain_request.tech_preferences.css else 'none',
                                'backend_service': domain_request.tech_preferences.backend_service.value if domain_request.tech_preferences.backend_service else 'none',
                            },
                            
                            # Architecture
                            'architecture': selected_architecture,
                            
                            # File structure (complete with descriptions)
                            'file_structure': [
                                {
                                    'path': f.path,
                                    'description': f.description or ''
                                } for f in (boilerplate.file_structure or [])
                            ],
                            
                            # Cursor rules (content is the full .cursorrules file)
                            'cursor_rules': {
                                'content': boilerplate.cursor_rules.content if boilerplate.cursor_rules else '',
                                'focus_areas': boilerplate.cursor_rules.focus_areas if boilerplate.cursor_rules else []
                            } if boilerplate.cursor_rules else {},
                            
                            # Metadata
                            'tree': analysis.tree if analysis else [],
                            'focus_areas': boilerplate.cursor_rules.focus_areas if boilerplate.cursor_rules else [],
                            'known_limitations': boilerplate.known_limitations or [],
                            'cost_optimizations': boilerplate.cost_optimizations or []
                        }
                        
                        file_count = len(boilerplate.file_structure) if boilerplate.file_structure else 0
                        
                        project_id = await project_service.save_project(
                            user_id=user_id,
                            session_id=session_id,
                            project_name=boilerplate.project_metadata.name,
                            framework=domain_request.tech_preferences.framework,
                            architecture=selected_architecture,
                            zip_data=zip_buffer,
                            metadata=metadata,
                            file_count=file_count
                        )
                        
                        logger.info(f"✅ Project auto-saved: {project_id}")
                    except Exception as save_error:
                        logger.warning(f"⚠️  Auto-save failed (non-critical): {save_error}")
                        # Don't fail the generation if auto-save fails
                else:
                    logger.debug("👤 No user authenticated - skipping auto-save")
                
                # Step 8: Complete
                response_dto = DTOMapper.to_boilerplate_dto(boilerplate)
                response_dto.session_id = session_id
                
                completion_data = {
                    "session_id": session_id,
                    "project_name": boilerplate.project_metadata.name,
                    "file_structure": [{"path": f.path} for f in boilerplate.file_structure],
                    "cursor_rules": {
                        "focus_areas": boilerplate.cursor_rules.focus_areas
                    },
                    "known_limitations": boilerplate.known_limitations,
                    "cost_optimizations": boilerplate.cost_optimizations
                }
                
                # Add project_id if auto-saved
                if project_id:
                    completion_data["project_id"] = project_id
                    completion_data["auto_saved"] = True
                
                yield StreamEvent(
                    event=StreamEventType.COMPLETE,
                    progress=100,
                    message="Generation complete!" + (" (Auto-saved)" if project_id else ""),
                    data=completion_data
                ).to_sse()
                
            except Exception as e:
                logger.error(f"❌ Streaming generation failed: {str(e)}")
                logger.exception("Full traceback:")
                yield StreamEvent(
                    event=StreamEventType.ERROR,
                    progress=0,
                    message=f"Error: {str(e)}"
                ).to_sse()
        
        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
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
