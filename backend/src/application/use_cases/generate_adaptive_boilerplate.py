import re
from pathlib import Path
from typing import List
from datetime import datetime
from loguru import logger

from src.domain.entities.project import ProjectRequest, Boilerplate, FileStructure, ProjectMetadata, Dependencies, CursorRules, StackType
from src.domain.entities.project_analysis import ProjectAnalysis
from src.infrastructure.adapters.vertex_ai_adapter import VertexAIAdapter
from src.infrastructure.services.template_matcher_service import TemplateMatcherService


class GenerateAdaptiveBoilerplateUseCase:
    """
    Generate boilerplate with adaptive architecture based on project complexity
    
    Flow:
    1. Analyze project complexity → Get size + file tree
    2. Match files with templates → Separate found vs to_generate
    3. Copy template files (with customization if needed)
    4. Generate missing files with AI
    5. Generate documentation (README, ARCHITECTURE, .cursorrules)
    6. Combine everything → Return Boilerplate
    """
    
    def __init__(self, ai_adapter: VertexAIAdapter, templates_path: Path):
        self.ai_adapter = ai_adapter
        self.template_matcher = TemplateMatcherService(templates_path)
    
    def execute(self, request: ProjectRequest, selected_architecture: str = None, event_queue = None) -> Boilerplate:
        """Execute adaptive boilerplate generation with optional streaming support"""
        logger.info("🎯 === ADAPTIVE BOILERPLATE GENERATION ===")
        logger.info(f"Description: {request.description[:50]}...")
        logger.info(f"Tech: {request.tech_preferences.framework}/{request.tech_preferences.language}")
        logger.info(f"Architecture: {selected_architecture or 'auto'}")
        
        # Step 1: Analyze project complexity
        logger.info("📊 Step 1: Analyzing project complexity...")
        analysis = self.ai_adapter.analyze_project_complexity(
            description=request.description,
            tech_preferences=request.tech_preferences,
            architecture=selected_architecture
        )
        logger.info(f"✅ Analysis: {analysis.size.upper()} project with {analysis.estimated_files} files")
        
        # Step 2: Match files with templates
        logger.info("🔍 Step 2: Matching files with templates...")
        matched = self.template_matcher.match_files(
            tree=analysis.tree,
            framework=request.tech_preferences.framework,
            language=request.tech_preferences.language
        )
        logger.info(f"✅ Matched: {len(matched['found'])} found, {len(matched['to_generate'])} to generate")
        
        # Step 3: Load template files
        logger.info("📁 Step 3: Loading template files...")
        template_files = self._load_template_files(matched['found'], request, analysis)
        logger.info(f"✅ Loaded {len(template_files)} template files")
        
        # Step 4: Generate missing files with AI
        logger.info("🤖 Step 4: Generating missing files with AI...")
        generated_files = []
        if matched['to_generate']:
            project_context = {
                "description": request.description,
                "size": analysis.size.value if hasattr(analysis.size, 'value') else analysis.size,
                "tree": analysis.tree,
                "architecture": selected_architecture or "auto",
                "tech": {
                    "framework": request.tech_preferences.framework,
                    "language": request.tech_preferences.language,
                    "backend_service": request.tech_preferences.backend_service.value if request.tech_preferences.backend_service else "none",
                    "css": request.tech_preferences.css.value if request.tech_preferences.css else "none"
                }
            }
            generated_files = self.ai_adapter.generate_files(
                files_to_generate=matched['to_generate'],
                project_context=project_context
            )
            logger.info(f"✅ Generated {len(generated_files)} files with AI")
        else:
            logger.info("✅ No files to generate - all found in templates")
        
        # Step 5: Generate documentation
        logger.info("📚 Step 5: Generating documentation...")
        
        # Create callback for streaming events
        def emit_event(event_type, message):
            if event_queue:
                try:
                    event_queue.put_nowait((event_type, message))
                except Exception as e:
                    logger.warning(f"Failed to emit event: {e}")
        
        doc_files = self._generate_documentation(request, analysis, selected_architecture, emit_event)
        logger.info(f"✅ Generated {len(doc_files)} documentation files")
        
        # Step 6: Combine all files
        all_files = template_files + generated_files + doc_files
        logger.info(f"📦 Total files: {len(all_files)}")
        
        # Step 7: Extract dependencies from package.json
        dependencies = self._extract_dependencies(all_files)
        
        # Step 8: Create boilerplate with AI-generated metadata
        # Generate clean project name: slug + timestamp for uniqueness
        # Create slug from description (remove special chars, limit length)
        slug = re.sub(r'[^a-z0-9]+', '-', request.description.lower())
        slug = re.sub(r'-+', '-', slug).strip('-')[:40]  # Clean up multiple dashes
        
        # Add timestamp for uniqueness
        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
        project_name = f"{slug}-{timestamp}"
        
        # Get metadata from documentation generation
        metadata = getattr(self, '_last_metadata', {
            "focus_areas": ["type-safety", "performance", "accessibility"],
            "known_limitations": ["Configuration required"],
            "cost_optimizations": ["Optimize for production"]
        })
        
        boilerplate = Boilerplate(
            project_metadata=ProjectMetadata(
                name=project_name,
                stack_type=StackType.GOOGLE_MODE if request.tech_preferences.backend_service else StackType.AGNOSTIC,
                explanation=f"AI-optimized {analysis.size} {request.tech_preferences.framework} boilerplate"
            ),
            file_structure=all_files,
            cursor_rules=self._extract_cursor_rules(doc_files, metadata.get("focus_areas", [])),
            dependencies=dependencies,
            known_limitations=metadata.get("known_limitations", []),
            cost_optimizations=metadata.get("cost_optimizations", [])
        )
        
        logger.info("✅ === ADAPTIVE GENERATION COMPLETE ===")
        logger.info(f"Project: {project_name}")
        logger.info(f"Size: {analysis.size.upper()}")
        logger.info(f"Files: {len(all_files)}")
        logger.info(f"Complexity: {analysis.complexity_score}/10")
        
        return boilerplate
    
    def _load_template_files(
        self, 
        found_files: List[dict], 
        request: ProjectRequest,
        analysis: ProjectAnalysis
    ) -> List[FileStructure]:
        """Load and customize template files"""
        files = []
        
        # Create clean slug for project context
        slug = re.sub(r'[^a-z0-9]+', '-', request.description.lower())
        slug = re.sub(r'-+', '-', slug).strip('-')[:40]
        
        project_context = {
            "name": slug,
            "description": request.description
        }
        
        for file_info in found_files:
            try:
                content = self.template_matcher.load_template_content(file_info["template_path"])
                
                # Customize if needed
                if file_info.get("needs_customization"):
                    content = self.template_matcher.customize_template(
                        content=content,
                        file_path=file_info["path"],
                        project_context=project_context
                    )
                
                files.append(FileStructure(
                    path=file_info["path"],
                    content=content,
                    description=f"Template: {Path(file_info['path']).name}"
                ))
                
            except Exception as e:
                logger.warning(f"Failed to load template {file_info['path']}: {e}")
                continue
        
        return files
    
    def _generate_documentation(
        self, 
        request: ProjectRequest,
        analysis: ProjectAnalysis,
        selected_architecture: str = None,
        stream_callback = None
    ) -> List[FileStructure]:
        """Generate README, ARCHITECTURE, and .cursorrules using AI with streaming support"""
        import asyncio
        
        # Extract values
        framework = request.tech_preferences.framework
        language = request.tech_preferences.language
        backend_service = request.tech_preferences.backend_service.value if request.tech_preferences.backend_service else "none"
        size = analysis.size.value if hasattr(analysis.size, 'value') else analysis.size
        complexity = analysis.complexity_score
        reasoning = analysis.reasoning
        tree = analysis.tree
        architecture = selected_architecture or "Flat/Simple"
        
        logger.info(f"📝 Generating documentation with AI for {architecture} architecture...")
        
        # Call AI methods asynchronously
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        # Helper to generate and emit event
        async def generate_with_event(doc_type, coro, event_type, message):
            result = await coro
            if stream_callback and not isinstance(result, Exception):
                try:
                    stream_callback(event_type, message)
                except Exception as e:
                    logger.warning(f"Failed to emit {doc_type} event: {e}")
            return result
        
        # Generate all 5 documents + metadata with streaming events
        readme_content, architecture_content, cursorrules_content, contributing_content, knowledge_graph_content, metadata = loop.run_until_complete(
            asyncio.gather(
                generate_with_event(
                    "README",
                    self.ai_adapter._generate_readme(
                        request, framework, language, backend_service, 
                        architecture, size, complexity, tree
                    ),
                    "doc_readme_generated",
                    "✅ README.md generated"
                ),
                generate_with_event(
                    "ARCHITECTURE",
                    self.ai_adapter._generate_architecture(
                        request, framework, language, backend_service,
                        architecture, size, complexity, reasoning, tree
                    ),
                    "doc_architecture_generated",
                    "✅ ARCHITECTURE.md generated"
                ),
                generate_with_event(
                    ".cursorrules",
                    self.ai_adapter._generate_cursorrules(
                        request, framework, language, backend_service,
                        architecture, size, complexity, tree
                    ),
                    "doc_cursorrules_generated",
                    "✅ .cursorrules generated"
                ),
                generate_with_event(
                    "CONTRIBUTING",
                    self.ai_adapter._generate_contributing(
                        request, framework, language, backend_service, architecture
                    ),
                    "doc_contributing_generated",
                    "✅ CONTRIBUTING.md generated"
                ),
                generate_with_event(
                    "KNOWLEDGE_GRAPH",
                    self.ai_adapter._generate_knowledge_graph(
                        request, framework, language, backend_service,
                        architecture, size, tree
                    ),
                    "doc_knowledge_graph_generated",
                    "✅ KNOWLEDGE_GRAPH.md generated"
                ),
                self.ai_adapter._generate_metadata(request, framework, language, backend_service, architecture),
                return_exceptions=True
            )
        )
        
        # Handle exceptions
        if isinstance(readme_content, Exception):
            logger.error(f"README generation failed: {readme_content}")
            readme_content = f"# {request.description}\n\nGenerated boilerplate project.\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
        
        if isinstance(architecture_content, Exception):
            logger.error(f"ARCHITECTURE generation failed: {architecture_content}")
            architecture_content = f"# Architecture\n\n{reasoning}\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
        
        if isinstance(cursorrules_content, Exception):
            logger.error(f".cursorrules generation failed: {cursorrules_content}")
            cursorrules_content = f"# {request.description}\n\n## Tech Stack\n- {framework}\n- {language}\n\n## Focus Areas\n- Type safety\n- Performance\n- AI comprehension"
        
        if isinstance(contributing_content, Exception):
            logger.error(f"CONTRIBUTING generation failed: {contributing_content}")
            contributing_content = f"# Contributing\n\nThank you for contributing!\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
        
        if isinstance(knowledge_graph_content, Exception):
            logger.error(f"KNOWLEDGE_GRAPH generation failed: {knowledge_graph_content}")
            knowledge_graph_content = f"# Knowledge Graph\n\nProject structure and dependencies.\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
        
        if isinstance(metadata, Exception):
            logger.error(f"Metadata generation failed: {metadata}")
            metadata = {
                "focus_areas": ["type-safety", "performance", "accessibility"],
                "known_limitations": ["Configuration required"],
                "cost_optimizations": ["Optimize for production"]
            }
        
        logger.info("✅ Documentation and metadata generated successfully")
        
        # Store metadata for later use in Boilerplate creation
        self._last_metadata = metadata
        
        return [
            FileStructure(
                path="README.md",
                content=readme_content,
                description="AI-generated project README"
            ),
            FileStructure(
                path=".cursorrules",
                content=cursorrules_content,
                description="AI coding guidelines"
            ),
            FileStructure(
                path="ARCHITECTURE.md",
                content=architecture_content,
                description="Architecture documentation"
            ),
            FileStructure(
                path="CONTRIBUTING.md",
                content=contributing_content,
                description="Contribution guidelines"
            ),
            FileStructure(
                path="KNOWLEDGE_GRAPH.md",
                content=knowledge_graph_content,
                description="Project knowledge graph for AI navigation"
            )
        ]
    
    def _extract_dependencies(self, files: List[FileStructure]) -> Dependencies:
        """Extract dependencies from package.json"""
        for file in files:
            if file.path == "package.json":
                try:
                    import json
                    pkg = json.loads(file.content)
                    
                    main_deps = [f"{k}@{v}" for k, v in pkg.get("dependencies", {}).items()]
                    dev_deps = [f"{k}@{v}" for k, v in pkg.get("devDependencies", {}).items()]
                    
                    return Dependencies(main=main_deps, dev=dev_deps)
                except Exception as e:
                    logger.warning(f"Failed to parse package.json: {e}")
        
        return Dependencies(main=[], dev=[])
    
    def _extract_cursor_rules(self, doc_files: List[FileStructure], focus_areas: List[str] = None) -> CursorRules:
        """Extract cursor rules from documentation with AI-generated focus areas"""
        for file in doc_files:
            if file.path == ".cursorrules":
                return CursorRules(
                    content=file.content,
                    focus_areas=focus_areas or ["type-safety", "performance", "ai-comprehension"]
                )
        
        return CursorRules(content="", focus_areas=focus_areas or [])
    
    def _generate_limitations(
        self, 
        request: ProjectRequest,
        analysis: ProjectAnalysis
    ) -> List[str]:
        """Generate known limitations based on project"""
        limitations = []
        
        if request.tech_preferences.backend_service:
            backend = request.tech_preferences.backend_service.value
            limitations.append(f"{backend.capitalize()} cost management requires active monitoring")
        
        size_value = analysis.size.value if hasattr(analysis.size, 'value') else analysis.size
        if size_value.lower() == "small":
            limitations.append("Simple architecture may need refactoring as project grows")
        
        return limitations
    
    def _generate_optimizations(
        self, 
        request: ProjectRequest,
        analysis: ProjectAnalysis
    ) -> List[str]:
        """Generate cost optimization suggestions"""
        optimizations = []
        
        optimizations.append("Use code splitting and lazy loading for better performance")
        optimizations.append("Implement caching strategies for API calls")
        
        if request.tech_preferences.backend_service:
            optimizations.append("Monitor and optimize database queries")
        
        return optimizations
