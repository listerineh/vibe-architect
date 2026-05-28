import os
import json
import asyncio
from typing import List, Dict
from pathlib import Path
import google.generativeai as genai
from json_repair import repair_json
from loguru import logger

from src.domain.entities.project import (
    Boilerplate,
    ProjectMetadata,
    FileStructure,
    Dependencies,
    CursorRules,
    ProjectRequest,
    StackType
)
from src.domain.ports.ai_service import AIServicePort
from src.infrastructure.services.template_service import TemplateService
from src.infrastructure.config.settings import settings

class VertexAIAdapter(AIServicePort):
    """Adapter for Vertex AI (Gemini) integration - Singleton pattern"""
    
    _instance = None
    _lock = None
    
    def __new__(cls):
        """Singleton pattern to reuse the same instance"""
        if cls._instance is None:
            if cls._lock is None:
                import threading
                cls._lock = threading.Lock()
            
            with cls._lock:
                # Double-check locking pattern
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._singleton_initialized = False
        return cls._instance
    
    def __init__(self):
        # Skip initialization if already done (Singleton pattern)
        if self._singleton_initialized:
            return
        
        self._settings = settings  # Store settings reference
        self._initialized = False
        self._api_key = "vertex-ai"  # Mark as using Vertex AI
        
        # Initialize template service
        backend_dir = Path(__file__).parent.parent.parent.parent
        template_dir = backend_dir / "templates"
        self._template_service = TemplateService(template_dir)
        
        if not settings.gcp_project_id:
            logger.warning("⚠️  No GCP_PROJECT_ID configured - running in MOCK MODE")
            logger.info("   Configure .env to use real Vertex AI")
            self._singleton_initialized = True
            return
        
        try:
            import os
            import vertexai
            from vertexai.generative_models import GenerativeModel
            
            # Configure credentials if specified
            if settings.google_application_credentials:
                credentials_path = Path(settings.google_application_credentials)
                if not credentials_path.is_absolute():
                    # If relative, make it relative to backend directory
                    credentials_path = backend_dir / settings.google_application_credentials
                
                if credentials_path.exists():
                    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = str(credentials_path)
                    logger.info(f"🔑 Using credentials: {credentials_path.name}")
                else:
                    logger.warning(f"⚠️  Credentials file not found: {credentials_path}")
                    logger.info("   Running in MOCK MODE")
                    self._singleton_initialized = True
                    return
            
            vertexai.init(
                project=settings.gcp_project_id,
                location=settings.gcp_location
            )
            
            self._model_name = settings.vertex_ai_model
            self._model = GenerativeModel(self._model_name)
            self._initialized = True
            self._retry_delay = 0  # Track retry delay for rate limiting
            logger.info(f"✅ Vertex AI initialized: {self._model_name}")
        except ImportError:
            logger.error("⚠️  vertexai not installed")
            logger.info("   Install with: pip install google-cloud-aiplatform")
        except Exception as e:
            logger.error(f"⚠️  Vertex AI initialization failed: {e}")
            logger.warning("   Running in MOCK MODE for development")
        finally:
            # Mark as initialized regardless of success/failure
            self._singleton_initialized = True
    
    def _call_with_retry(self, prompt: str, generation_config: dict, max_retries: int = 2):
        """Call Gemini API with automatic retry on rate limit"""
        import time
        
        for attempt in range(max_retries + 1):
            try:
                response = self._model.generate_content(prompt, generation_config=generation_config)
                return response
            except Exception as e:
                error_str = str(e)
                
                # Check if it's a rate limit error
                if "429" in error_str or "quota" in error_str.lower():
                    if attempt < max_retries:
                        # Extract retry delay from error message or use exponential backoff
                        retry_delay = 20  # Default 20 seconds
                        if "retry_delay" in error_str:
                            try:
                                import re
                                match = re.search(r'seconds: (\d+)', error_str)
                                if match:
                                    retry_delay = int(match.group(1)) + 1
                            except:
                                pass
                        
                        logger.warning(f"⏳ Rate limit hit, retrying in {retry_delay}s (attempt {attempt + 1}/{max_retries + 1})")
                        time.sleep(retry_delay)
                        continue
                
                # If not rate limit or max retries reached, raise the error
                raise e
        
        raise Exception("Max retries exceeded")
    
    def analyze_project_complexity(self, description: str, tech_preferences, architecture: str = None) -> 'ProjectAnalysis':
        """Analyze project complexity and generate file tree structure"""
        from src.domain.entities.project_analysis import ProjectAnalysis, ProjectSize
        
        logger.info(f"🔍 Analyzing project complexity for architecture: {architecture or 'auto'}...")
        
        # Load analysis prompt
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "analyze-complexity.md"
        
        if not prompt_path.exists():
            logger.error(f"Analysis prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format prompt with project details
        backend_service = tech_preferences.backend_service.value if tech_preferences.backend_service else "none"
        css_framework = tech_preferences.css.value if tech_preferences.css else "none"
        
        prompt = prompt_template.replace("{{DESCRIPTION}}", description)
        prompt = prompt.replace("{{FRAMEWORK}}", tech_preferences.framework)
        prompt = prompt.replace("{{LANGUAGE}}", tech_preferences.language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service)
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", css_framework)
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture or "auto")
        
        logger.debug(f"Analysis prompt length: {len(prompt)} chars")
        
        # Call AI
        generation_config = {
            "temperature": 0.3,
            "max_output_tokens": 4096,
        }
        
        # Log the prompt being sent (DEBUG only)
        logger.debug("=" * 80)
        logger.debug("PROMPT SENT TO AI (analyze_project_complexity):")
        logger.debug(prompt)
        logger.debug("=" * 80)
        
        try:
            response = self._call_with_retry(prompt, generation_config)
            raw_response = response.text.strip()
            
            # Log the raw response (DEBUG only)
            logger.debug("=" * 80)
            logger.debug("RAW AI RESPONSE (analyze_project_complexity):")
            logger.debug(raw_response)
            logger.debug("=" * 80)
            logger.debug(f"Raw AI response length: {len(raw_response)} chars")
            
            # Clean response (remove markdown code blocks if present)
            if raw_response.startswith("```"):
                # Remove ```json and ``` markers
                raw_response = raw_response.split("```")[1]
                if raw_response.startswith("json"):
                    raw_response = raw_response[4:].strip()
            
            # Parse JSON response
            try:
                analysis_data = json.loads(raw_response)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode failed, attempting repair: {e}")
                repaired = repair_json(raw_response)
                analysis_data = json.loads(repaired)
            
            # Validate and create ProjectAnalysis
            # Use defaults for missing fields (in case JSON was truncated)
            tree = analysis_data.get("tree", [])
            estimated_files = analysis_data.get("estimated_files", len(tree) if tree else 10)
            
            analysis = ProjectAnalysis(
                size=ProjectSize(analysis_data["size"].lower()),
                reasoning=analysis_data.get("reasoning", "Analysis based on project description"),
                tree=tree,
                estimated_files=estimated_files,
                complexity_score=analysis_data.get("complexity_score", 5),
                required_base_files=analysis_data.get("required_base_files", [])
            )
            
            logger.info(f"✅ Analysis complete: {analysis.size.upper()} project ({analysis.estimated_files} files)")
            logger.debug(f"Complexity score: {analysis.complexity_score}/10")
            logger.debug(f"Required base files: {len(analysis.required_base_files)}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Failed to analyze project complexity: {str(e)}")
            logger.exception("Full traceback:")
            raise
    
    def propose_architectures(self, description: str, tech_preferences) -> 'ArchitectureAnalysis':
        """Propose appropriate architectures for the project"""
        from src.domain.entities.architecture_proposal import ArchitectureAnalysis, ArchitectureProposal, ArchitectureComplexity
        
        logger.info("🏗️  Proposing architectures...")
        
        # Load architecture proposal prompt
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "propose-architectures.md"
        
        if not prompt_path.exists():
            logger.error(f"Architecture proposal prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format prompt
        backend_service = tech_preferences.backend_service.value if tech_preferences.backend_service else "none"
        css_framework = tech_preferences.css.value if tech_preferences.css else "none"
        
        prompt = prompt_template.replace("{{DESCRIPTION}}", description)
        prompt = prompt.replace("{{FRAMEWORK}}", tech_preferences.framework)
        prompt = prompt.replace("{{LANGUAGE}}", tech_preferences.language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service)
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", css_framework)
        
        logger.debug(f"Architecture proposal prompt length: {len(prompt)} chars")
        
        # Call AI
        generation_config = {
            "temperature": 0.4,
            "max_output_tokens": 8192,  # Increased to allow complete architecture proposals
        }
        
        # Log the prompt being sent (DEBUG only)
        logger.debug("=" * 80)
        logger.debug("PROMPT SENT TO AI (propose_architectures):")
        logger.debug(prompt)
        logger.debug("=" * 80)
        
        try:
            response = self._call_with_retry(prompt, generation_config)
            raw_response = response.text.strip()
            
            # Log the raw response (DEBUG only)
            logger.debug("=" * 80)
            logger.debug("RAW AI RESPONSE (propose_architectures):")
            logger.debug(raw_response)
            logger.debug("=" * 80)
            logger.debug(f"Raw AI response length: {len(raw_response)} chars")
            
            # Clean response - remove markdown code blocks
            if raw_response.startswith("```"):
                raw_response = raw_response.split("```")[1]
                if raw_response.startswith("json"):
                    raw_response = raw_response[4:].strip()
            
            # Remove any trailing markdown
            if raw_response.endswith("```"):
                raw_response = raw_response[:-3].strip()
            
            # Parse JSON
            try:
                response_data = json.loads(raw_response)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode failed: {e}")
                logger.debug(f"Problematic JSON (first 500 chars): {raw_response[:500]}")
                try:
                    # Try to repair the JSON
                    repaired = repair_json(raw_response)
                    response_data = json.loads(repaired)
                    logger.info("✅ JSON repaired successfully")
                except Exception as repair_error:
                    logger.error(f"❌ JSON repair also failed: {repair_error}")
                    logger.error(f"Full response: {raw_response}")
                    raise
            
            # Convert to ArchitectureAnalysis
            proposals = []
            for arch_data in response_data.get("proposed_architectures", []):
                # Normalize complexity value (handle "low-medium" -> "medium", etc.)
                complexity_str = arch_data["complexity"].lower()
                if "medium" in complexity_str:
                    complexity_value = "medium"
                elif "high" in complexity_str:
                    complexity_value = "high"
                else:
                    complexity_value = "low"
                
                # Truncate example_structure to max 15 items (Pydantic validation)
                example_structure = arch_data["example_structure"]
                if len(example_structure) > 15:
                    logger.warning(f"Truncating example_structure from {len(example_structure)} to 15 items")
                    example_structure = example_structure[:15]
                
                proposals.append(ArchitectureProposal(
                    name=arch_data["name"],
                    reasoning=arch_data["reasoning"],
                    complexity=ArchitectureComplexity(complexity_value),
                    pros=arch_data["pros"],
                    cons=arch_data["cons"],
                    estimated_files=arch_data["estimated_files"],
                    example_structure=example_structure
                ))
            
            # Get recommended index (default to 0 if not provided)
            recommended_idx = response_data.get("recommended", 0)
            
            analysis = ArchitectureAnalysis(
                project_size=response_data["project_size"],
                complexity_score=response_data["complexity_score"],
                reasoning=response_data["reasoning"],
                proposed_architectures=proposals,
                recommended=recommended_idx
            )
            
            logger.info(f"✅ Proposed {len(proposals)} architectures for {analysis.project_size.upper()} project")
            logger.debug(f"Recommended: {analysis.recommended}")
            
            return analysis
            
        except Exception as e:
            logger.error(f"❌ Failed to propose architectures: {str(e)}")
            logger.exception("Full traceback:")
            raise
    
    def generate_files(
        self, 
        files_to_generate: List[str], 
        project_context: Dict
    ) -> List['FileStructure']:
        """
        Generate file contents using AI for files not found in templates.
        Automatically chunks large requests to avoid token limits.
        
        Args:
            files_to_generate: List of file paths to generate
            project_context: Dict with description, size, tree, tech preferences
        
        Returns:
            List of FileStructure objects with generated content
        """
        from src.domain.entities.project import FileStructure
        
        if not files_to_generate:
            logger.info("No files to generate")
            return []
        
        # Chunking strategy: divide into batches to avoid token limits
        CHUNK_SIZE = 7  # Generate max 7 files per request (safe for 16K tokens)
        total_files = len(files_to_generate)
        
        if total_files > CHUNK_SIZE:
            logger.info(f"🔄 Large batch detected ({total_files} files) - splitting into chunks of {CHUNK_SIZE}")
            all_generated_files = []
            
            # Split into chunks
            for i in range(0, total_files, CHUNK_SIZE):
                chunk = files_to_generate[i:i + CHUNK_SIZE]
                chunk_num = (i // CHUNK_SIZE) + 1
                total_chunks = (total_files + CHUNK_SIZE - 1) // CHUNK_SIZE
                
                logger.info(f"📦 Generating chunk {chunk_num}/{total_chunks} ({len(chunk)} files)...")
                
                # Generate this chunk
                chunk_files = self._generate_files_batch(chunk, project_context)
                all_generated_files.extend(chunk_files)
                
                logger.info(f"✅ Chunk {chunk_num}/{total_chunks} complete ({len(chunk_files)}/{len(chunk)} files)")
            
            logger.info(f"🎉 All chunks complete: {len(all_generated_files)}/{total_files} files generated")
            return all_generated_files
        
        # Small batch - generate directly
        logger.info(f"🤖 Generating {len(files_to_generate)} files with AI...")
        logger.debug(f"Files to generate: {', '.join(files_to_generate)}")
        
        return self._generate_files_batch(files_to_generate, project_context)
    
    def _generate_files_batch(
        self,
        files_to_generate: List[str],
        project_context: Dict
    ) -> List['FileStructure']:
        """
        Generate a single batch of files (internal method)
        """
        from src.domain.entities.project import FileStructure
        
        # Load generation prompt
        # Prompts are in /prompts/ at project root (not /backend/prompts/)
        # From: backend/src/infrastructure/adapters/vertex_ai_adapter.py
        # To: prompts/generate-files.md
        project_root = Path(__file__).parent.parent.parent.parent.parent  # Go up to VibeArchitect/
        prompt_path = project_root / "prompts" / "generate-files.md"
        
        if not prompt_path.exists():
            logger.error(f"Generation prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format files list
        files_list = "\n".join(f"- {file}" for file in files_to_generate)
        
        # Format tree
        tree_str = "\n".join(project_context.get("tree", []))
        
        # Format prompt
        prompt = prompt_template.replace("{{SIZE}}", project_context.get("size", "medium").upper())
        prompt = prompt.replace("{{DESCRIPTION}}", project_context.get("description", ""))
        prompt = prompt.replace("{{FRAMEWORK}}", project_context.get("tech", {}).get("framework", ""))
        prompt = prompt.replace("{{LANGUAGE}}", project_context.get("tech", {}).get("language", ""))
        prompt = prompt.replace("{{BACKEND_SERVICE}}", project_context.get("tech", {}).get("backend_service", "none"))
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", project_context.get("tech", {}).get("css", ""))
        prompt = prompt.replace("{{ARCHITECTURE}}", project_context.get("architecture", "auto"))
        prompt = prompt.replace("{{TREE}}", tree_str)
        prompt = prompt.replace("{{FILES_TO_GENERATE}}", files_list)
        
        logger.debug(f"Generation prompt length: {len(prompt)} chars")
        logger.debug(f"Files to generate: {files_to_generate}")
        
        # Call AI
        # Higher token limit for generating multiple files
        # ~500 tokens per file * 15 files = ~7500 tokens + overhead
        generation_config = {
            "temperature": 0.3,  # Lower temp for more consistent, concise code
            "max_output_tokens": 16384,  # Increased to handle more files
        }
        
        # Log the prompt being sent
        logger.debug("=" * 80)
        logger.debug("PROMPT SENT TO AI (generate_files):")
        logger.debug(prompt[:1000] + "..." if len(prompt) > 1000 else prompt)
        logger.debug("=" * 80)
        
        try:
            response = self._call_with_retry(prompt, generation_config)
            raw_response = response.text.strip()
            
            # Log the raw response
            logger.debug("=" * 80)
            logger.debug("RAW AI RESPONSE (generate_files):")
            logger.debug(raw_response[:2000] + "..." if len(raw_response) > 2000 else raw_response)
            logger.debug("=" * 80)
            logger.debug(f"Raw AI response length: {len(raw_response)} chars")
            
            # Clean response
            if raw_response.startswith("```"):
                raw_response = raw_response.split("```")[1]
                if raw_response.startswith("json"):
                    raw_response = raw_response[4:].strip()
            
            # Parse JSON
            try:
                response_data = json.loads(raw_response)
            except json.JSONDecodeError as e:
                logger.warning(f"JSON decode failed, attempting repair: {e}")
                logger.debug(f"Raw response (first 1000 chars): {raw_response[:1000]}")
                repaired = repair_json(raw_response)
                response_data = json.loads(repaired)
                logger.debug(f"Repaired JSON successfully")
            
            # Convert to FileStructure objects
            generated_files = []
            skipped_files = []
            
            for file_data in response_data.get("files", []):
                # Validate required fields
                if "path" not in file_data:
                    logger.warning(f"Skipping file without path: {file_data}")
                    skipped_files.append("unknown (no path)")
                    continue
                
                if "content" not in file_data:
                    logger.warning(f"Skipping file without content: {file_data.get('path', 'unknown')}")
                    skipped_files.append(file_data.get('path', 'unknown'))
                    continue
                
                generated_files.append(FileStructure(
                    path=file_data["path"],
                    content=file_data["content"],
                    description=f"AI-generated {Path(file_data['path']).name}"
                ))
            
            # Log results
            expected_count = len(files_to_generate)
            actual_count = len(generated_files)
            generated_paths = [f.path for f in generated_files]
            missing_files = [f for f in files_to_generate if f not in generated_paths]
            
            if skipped_files:
                logger.warning(f"⚠️  Skipped {len(skipped_files)} files due to missing data: {', '.join(skipped_files)}")
            
            if actual_count < expected_count:
                logger.warning(f"⚠️  Generated {actual_count}/{expected_count} files - {expected_count - actual_count} files were lost during generation")
                logger.warning(f"📋 Expected files: {', '.join(files_to_generate)}")
                logger.warning(f"✅ Generated files: {', '.join(generated_paths)}")
                logger.warning(f"❌ Missing files: {', '.join(missing_files)}")
            else:
                logger.info(f"✅ Generated {actual_count} files successfully")
            
            return generated_files
            
        except Exception as e:
            logger.error(f"❌ Failed to generate files: {str(e)}")
            logger.exception("Full traceback:")
            raise
    
    def _load_system_prompt(self) -> str:
        """Load system prompt from file"""
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "system-prompt.md"
        
        if not prompt_path.exists():
            logger.warning(f"System prompt not found at {prompt_path}")
            return "You are an AI assistant that generates Next.js boilerplates."
        
        with open(prompt_path, "r") as f:
            return f.read()
    
    async def _generate_readme(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str, size: str, complexity: int, tree: list) -> str:
        """Generate README.md using AI with custom prompt"""
        # Load README prompt
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-readme.md"
        
        if not prompt_path.exists():
            logger.error(f"README prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format tree
        tree_str = "\n".join(tree[:30])  # Limit to first 30 lines
        if len(tree) > 30:
            tree_str += f"\n... and {len(tree) - 30} more files"
        
        # Format prompt
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)
        prompt = prompt.replace("{{SIZE}}", size.upper())
        prompt = prompt.replace("{{COMPLEXITY}}", str(complexity))
        prompt = prompt.replace("{{TREE}}", tree_str)
        
        try:
            # Run in thread to allow true parallelization
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 8192,
                }
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate README: {e}")
            return f"# {request.description}\n\nGenerated boilerplate project.\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
    
    async def _generate_architecture(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str, size: str, complexity: int, reasoning: str, tree: list) -> str:
        """Generate ARCHITECTURE.md using AI with custom prompt"""
        # Load ARCHITECTURE prompt
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-architecture.md"
        
        if not prompt_path.exists():
            logger.error(f"ARCHITECTURE prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format tree
        tree_str = "\n".join(tree[:30])
        if len(tree) > 30:
            tree_str += f"\n... and {len(tree) - 30} more files"
        
        # Format prompt
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)
        prompt = prompt.replace("{{SIZE}}", size.upper())
        prompt = prompt.replace("{{COMPLEXITY}}", str(complexity))
        prompt = prompt.replace("{{REASONING}}", reasoning)
        prompt = prompt.replace("{{TREE}}", tree_str)
        
        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 8192,
                }
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate ARCHITECTURE: {e}")
            return f"# Architecture\n\n{tree_str}\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
    
    async def _generate_cursorrules(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str, size: str, complexity: int, tree: list) -> str:
        """Generate .cursorrules using AI with custom prompt"""
        # Load .cursorrules prompt
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-cursorrules.md"
        
        if not prompt_path.exists():
            logger.error(f".cursorrules prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format tree
        tree_str = "\n".join(tree[:30])
        if len(tree) > 30:
            tree_str += f"\n... and {len(tree) - 30} more files"
        
        # Format prompt
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)
        prompt = prompt.replace("{{SIZE}}", size.upper())
        prompt = prompt.replace("{{COMPLEXITY}}", str(complexity))
        prompt = prompt.replace("{{TREE}}", tree_str)
        
        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 8192,
                }
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate .cursorrules: {e}")
            return f"# {request.description}\n\n## Tech Stack\n- {framework}\n- {language}\n\n## Focus Areas\n- Type safety\n- Performance\n- AI comprehension"
    
    def _extract_dependencies_from_package_json(self, files: List[FileStructure]) -> Dependencies:
        """Extract dependencies from package.json file"""
        for file in files:
            if file.path == "package.json":
                try:
                    package_data = json.loads(file.content)
                    main_deps = []
                    dev_deps = []
                    
                    # Extract main dependencies
                    if "dependencies" in package_data:
                        for name, version in package_data["dependencies"].items():
                            main_deps.append(f"{name}@{version.lstrip('^~')}")
                    
                    # Extract dev dependencies
                    if "devDependencies" in package_data:
                        for name, version in package_data["devDependencies"].items():
                            dev_deps.append(f"{name}@{version.lstrip('^~')}")
                    
                    logger.info(f"📦 Extracted {len(main_deps)} main + {len(dev_deps)} dev dependencies from package.json")
                    return Dependencies(main=main_deps, dev=dev_deps)
                except Exception as e:
                    logger.warning(f"Could not extract dependencies from package.json: {e}")
        
        # Fallback to default dependencies
        logger.warning("package.json not found, using default dependencies")
        return Dependencies(
            main=["next@15.0.0", "react@19.0.0", "react-dom@19.0.0"],
            dev=["typescript@5.4.5", "@types/react@18.3.1", "tailwindcss@3.4.3"]
        )
    
    async def _generate_metadata(self, request: ProjectRequest, framework: str, backend_service: str) -> dict:
        """Generate AI metadata (focus_areas, known_limitations, cost_optimizations)"""
        prompt = f"""Generate AI metadata for this project:

**Project Description:** {request.description}
**Framework:** {framework}
**Backend Service:** {backend_service if backend_service != "none" else "None"}

Return ONLY a JSON object with these fields:

{{
  "focus_areas": ["3-5 areas like type-safety, performance, accessibility, testing, scalability"],
  "known_limitations": ["2-4 limitations like 'Authentication not configured', 'Database schema needs setup'"],
  "cost_optimizations": ["3-6 optimizations like 'Use {backend_service} free tier', 'Implement caching', 'Optimize images'"]
}}

Be specific and relevant to the project description and tech stack.
Output ONLY valid JSON, no markdown wrapper."""

        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 8192,  # Maximum for Gemini 2.5 Flash
                }
            )
            
            response_text = response.text.strip()
            # Clean markdown wrapper if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            # Parse JSON
            metadata = json.loads(response_text)
            logger.info(f"✅ Metadata generated: {len(metadata.get('focus_areas', []))} focus areas, {len(metadata.get('known_limitations', []))} limitations, {len(metadata.get('cost_optimizations', []))} optimizations")
            return metadata
        except Exception as e:
            logger.error(f"Failed to generate metadata: {e}")
            # Fallback to sensible defaults
            return {
                "focus_areas": ["type-safety", "performance", "accessibility", "ai-comprehension"],
                "known_limitations": [
                    f"{backend_service.capitalize()} configuration required" if backend_service != "none" else "Backend service not configured",
                    "Environment variables need to be set",
                    "Authentication not implemented"
                ],
                "cost_optimizations": [
                    f"Use {backend_service} free tier for development" if backend_service != "none" else "Optimize for serverless deployment",
                    "Implement caching strategies",
                    "Optimize images with Next.js Image component",
                    "Enable code splitting and lazy loading"
                ]
            }
    
    def _generate_mock_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        """Generate mock boilerplate using templates + mock docs"""
        import re
        from datetime import datetime
        
        # Create slug from description (remove special chars, limit length)
        slug = re.sub(r'[^a-z0-9]+', '-', request.description.lower())
        slug = re.sub(r'-+', '-', slug).strip('-')[:40]
        
        # Add timestamp for uniqueness
        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
        project_name = f"{slug}-{timestamp}"
        
        # Get template based on framework and language
        framework = request.tech_preferences.framework if hasattr(request.tech_preferences, 'framework') else "nextjs"
        language = request.tech_preferences.language if hasattr(request.tech_preferences, 'language') else "typescript"
        backend_service = request.tech_preferences.backend_service if hasattr(request.tech_preferences, 'backend_service') else "none"
        css_framework = request.tech_preferences.css if hasattr(request.tech_preferences, 'css') else "tailwind"
        
        template_name = self._template_service.get_template_name(framework, language, backend_service, css_framework)
        
        logger.info(f"📦 Using template: {template_name} ({framework} + {language} + {backend_service} + {css_framework})")
        
        # Generate project structure for AI context
        project_structure = self._template_service.get_project_structure(
            framework, language, backend_service, css_framework
        )
        logger.debug(f"📋 Generated project structure context ({len(project_structure)} chars)")
        
        # Load template files
        template_files = self._template_service.load_template_files(template_name)
        
        # Add backend-specific files if selected
        if backend_service != "none":
            backend_files = self._template_service.get_backend_config_files(backend_service, language)
            # Map backend files to src/lib/ instead of infrastructure/services/
            for file in backend_files:
                if file.path.startswith('.env'):
                    # Keep .env files in root
                    template_files.append(file)
                else:
                    # Extract filename and put in src/lib/
                    filename = file.path.split('/')[-1]
                    mapped_file = FileStructure(
                        path=f"src/lib/{filename}",
                        content=file.content,
                        description=file.description
                    )
                    template_files.append(mapped_file)
            logger.info(f"✅ Added {len(backend_files)} {backend_service} configuration files")
        
        # Add CSS framework files if SCSS is selected
        if css_framework == "scss":
            css_files = self._template_service.get_css_config_files(css_framework)
            template_files.extend(css_files)
            logger.info(f"✅ Added {len(css_files)} SCSS configuration files")
        
        # Replace placeholders in template files
        replacements = {
            "PROJECT_NAME": request.description,
            "PROJECT_DESCRIPTION": f"A {framework} application for {request.description}"
        }
        template_files = self._template_service.replace_placeholders(template_files, replacements)
        
        # Update package.json with additional dependencies
        template_files = self._template_service.update_package_json_dependencies(
            template_files,
            backend_service,
            css_framework
        )
        logger.debug(f"✅ Updated package.json with dependencies for {backend_service} and {css_framework}")
        
        # Generate dynamic README content
        framework_display = framework.capitalize()
        language_display = language.capitalize()
        css_display = "Tailwind CSS" if css_framework == "tailwind" else "SCSS"
        backend_display = backend_service.capitalize() if backend_service != "none" else "None"
        
        # Framework-specific badges
        framework_badges = {
            "nextjs": '[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)',
            "react": '[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)',
            "astro": '[![Astro](https://img.shields.io/badge/Astro-4.0-ff5d01)](https://astro.build/)'
        }
        
        language_badge = '[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)' if language == "typescript" else '[![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)'
        
        css_badge = '[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)' if css_framework == "tailwind" else '[![SCSS](https://img.shields.io/badge/SCSS-1.69-cc6699)](https://sass-lang.com/)'
        
        backend_badge = ''
        backend_setup = ''
        if backend_service == "firebase":
            backend_badge = '[![Firebase](https://img.shields.io/badge/Firebase-10.0-orange)](https://firebase.google.com/)'
            backend_setup = '''
### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Storage
3. Copy your Firebase config to `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   ```
4. Initialize Firebase in your project (already configured in `src/infrastructure/services/firebase.ts`)
'''
        elif backend_service == "supabase":
            backend_badge = '[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.com/)'
            backend_setup = '''
### Supabase Setup

1. Create a Supabase project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Get your project URL and anon key from Settings > API
3. Copy your Supabase config to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Initialize Supabase client (already configured in `src/infrastructure/services/supabase.ts`)
'''
        
        # Add documentation files with ultra-detailed content
        doc_files = [
            FileStructure(
                path="README.md",
                content=rf"""# {request.description}

> An AI-optimized {framework_display} boilerplate designed for rapid development with Cursor and Windsurf

{framework_badges.get(framework, framework_badges["nextjs"])}
{language_badge}
{css_badge}
{backend_badge}

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm/yarn/pnpm
{f'- {backend_display} project' if backend_service != "none" else ''}

### Installation

\`\`\`bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
{f'# See {backend_display} setup instructions below' if backend_service != "none" else ''}

# Run development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your application.
{backend_setup}

## 📦 Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router for optimal performance
- **TypeScript 5** - Type-safe development with strict mode enabled
- **React 19** - Latest React with Server Components support

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **CSS Modules** - Component-scoped styles when needed
- **Dark Mode** - Built-in theme switching support

### Backend & Database
{'- **Firebase Auth** - Secure authentication with multiple providers\n- **Firestore** - NoSQL database with real-time capabilities\n- **Cloud Storage** - File storage and CDN\n- **Cloud Functions** - Serverless backend logic' if request.google_mode else '- **Supabase Auth** - Authentication with Row Level Security\n- **PostgreSQL** - Relational database via Supabase\n- **Supabase Storage** - File storage\n- **Edge Functions** - Serverless Deno functions'}

### Development Tools
- **ESLint** - Code linting with Next.js config
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Git Hooks** - Pre-commit validation

## 📁 Project Structure

\`\`\`
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page
│   │   ├── globals.css         # Global styles
│   │   └── (routes)/           # Route groups
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                 # Base UI components (Button, Input, etc.)
│   │   ├── layout/             # Layout components (Header, Footer, etc.)
│   │   └── shared/             # Shared business components
│   │
│   ├── features/               # Feature modules (Feature-Sliced Design)
│   │   └── [feature]/          # Each feature is self-contained
│   │       ├── components/     # Feature-specific components
│   │       ├── hooks/          # Feature-specific hooks
│   │       ├── types/          # Feature-specific types
│   │       └── utils/          # Feature-specific utilities
│   │
│   ├── lib/                    # Shared utilities and services
│   │   ├── {'firebase/' if request.google_mode else 'supabase/'}          # {'Firebase' if request.google_mode else 'Supabase'} configuration and helpers
│   │   ├── utils/              # Utility functions
│   │   └── constants/          # App-wide constants
│   │
│   ├── hooks/                  # Shared React hooks
│   │   ├── useAuth.ts          # Authentication hook
│   │   └── useTheme.ts         # Theme management hook
│   │
│   └── types/                  # Shared TypeScript types
│       └── index.ts            # Global type definitions
│
├── public/                     # Static assets
│   ├── images/                 # Image files
│   └── fonts/                  # Custom fonts
│
├── .cursorrules                # AI coding guidelines for Cursor/Windsurf
├── ARCHITECTURE.md             # Architecture decisions and patterns
├── KNOWLEDGE_GRAPH.md          # Dependency map for AI navigation
└── CONTRIBUTING.md             # Development guidelines
\`\`\`

## 🎯 Key Features

### AI-Optimized Development
- **Clear Structure** - Semantic folder organization for AI comprehension
- **Comprehensive Docs** - Every module documented for AI context
- **Type Safety** - Strict TypeScript for better AI suggestions
- **.cursorrules** - Custom guidelines for Cursor/Windsurf

### Performance
- **Server Components** - Default to server-side rendering
- **Image Optimization** - Automatic image optimization with next/image
- **Code Splitting** - Automatic route-based code splitting
- **Edge Runtime** - Deploy to edge for low latency

### Developer Experience
- **Hot Reload** - Instant feedback during development
- **Type Safety** - Catch errors before runtime
- **Linting** - Consistent code style
- **Git Hooks** - Automated quality checks

## 🛠️ Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
\`\`\`

## 🔐 Environment Variables

Create a \`.env.local\` file with:

\`\`\`env
{'# Firebase Configuration\nNEXT_PUBLIC_FIREBASE_API_KEY=your_api_key\nNEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id\nNEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com\nNEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id\nNEXT_PUBLIC_FIREBASE_APP_ID=your_app_id' if request.google_mode else '# Supabase Configuration\nNEXT_PUBLIC_SUPABASE_URL=your_project_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key\nSUPABASE_SERVICE_ROLE_KEY=your_service_role_key'}
\`\`\`

## 📚 Documentation

- [Architecture Decisions](./ARCHITECTURE.md) - Design patterns and rationale
- [Knowledge Graph](./KNOWLEDGE_GRAPH.md) - Module dependencies for AI
- [Contributing Guide](./CONTRIBUTING.md) - Development workflow

## 🚢 Deployment

### Recommended Platforms

{'- **Firebase App Hosting** - Optimized for Firebase projects\n- **Vercel** - Zero-config deployment\n- **Netlify** - Alternative hosting option' if request.google_mode else '- **Vercel** - Optimized for Next.js\n- **Netlify** - Alternative hosting\n- **Supabase Edge Functions** - For serverless functions'}

### Build Command

\`\`\`bash
npm run build
\`\`\`

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT License - feel free to use this boilerplate for your projects!

---

**Built with ❤️ using VibeArchitect** - The AI-First Boilerplate Generator
""",
                description="Comprehensive project overview with badges, detailed setup, and documentation links"
            ),
            FileStructure(
                path="ARCHITECTURE.md",
                content=rf"""# Architecture Documentation

{project_structure}

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [Architecture Pattern](#architecture-pattern)
4. [Folder Structure Rationale](#folder-structure-rationale)
5. [Data Flow](#data-flow)
6. [Key Design Decisions](#key-design-decisions)
7. [Performance Optimizations](#performance-optimizations)
8. [Security Considerations](#security-considerations)

## Overview

This project implements a **Feature-Sliced Design (FSD)** architecture pattern, specifically optimized for AI-assisted development with tools like Cursor and Windsurf. The structure prioritizes:

- **Semantic clarity** - Every folder and file has a clear, single purpose
- **AI comprehension** - Naming and organization optimized for LLM understanding
- **Scalability** - Easy to add new features without refactoring
- **Type safety** - Strict TypeScript throughout the codebase

## Design Philosophy

### 1. AI-First Development

This boilerplate is designed with AI coding assistants in mind:

- **Clear naming conventions** - No abbreviations, descriptive names
- **Comprehensive documentation** - Every module has context
- **Consistent patterns** - Predictable structure for AI suggestions
- **Type-driven development** - Types guide AI autocomplete

### 2. Feature-Sliced Design

Features are organized as independent, self-contained modules:

\`\`\`
src/features/[feature-name]/
  ├── components/     # Feature-specific UI
  ├── hooks/          # Feature-specific logic
  ├── types/          # Feature-specific types
  ├── utils/          # Feature-specific utilities
  └── index.ts        # Public API
\`\`\`

**Benefits:**
- Features can be developed independently
- Easy to understand feature scope
- Simple to remove or replace features
- Clear boundaries prevent coupling

### 3. Separation of Concerns

\`\`\`
Presentation Layer (components/)
       ↓
Business Logic Layer (hooks/, features/)
       ↓
Data Layer (lib/{'firebase' if request.google_mode else 'supabase'}/)
       ↓
External Services ({'Firebase' if request.google_mode else 'Supabase'})
\`\`\`

## Architecture Pattern

### Next.js App Router

We use the **App Router** (not Pages Router) for:

- **Server Components by default** - Better performance
- **Streaming** - Progressive page rendering
- **Layouts** - Shared UI across routes
- **Loading & Error states** - Built-in UX patterns

### Component Hierarchy

\`\`\`
app/layout.tsx (Root Layout)
  ├── Providers (Auth, Theme, etc.)
  └── app/page.tsx (Route)
      ├── Layout Components (Header, Footer)
      ├── Feature Components (from features/)
      └── UI Components (from components/ui/)
\`\`\`

## Folder Structure Rationale

### `/src/app` - Next.js App Router

**Purpose:** Route definitions and page components

**Rules:**
- Each folder is a route segment
- `page.tsx` defines the UI for that route
- `layout.tsx` wraps child routes
- Use route groups `(group)` for organization without affecting URL

**Example:**
\`\`\`
app/
  ├── (marketing)/      # Route group (doesn't affect URL)
  │   ├── about/
  │   │   └── page.tsx  # /about
  │   └── contact/
  │       └── page.tsx  # /contact
  └── (app)/
      └── dashboard/
          └── page.tsx  # /dashboard
\`\`\`

### `/src/components` - Reusable Components

**Purpose:** Shared UI components used across features

**Organization:**
- `ui/` - Base components (Button, Input, Card)
- `layout/` - Layout components (Header, Footer, Sidebar)
- `shared/` - Business components used in multiple features

**Rules:**
- Components should be pure and reusable
- No feature-specific logic
- Props-driven, no global state
- Documented with JSDoc

### `/src/features` - Feature Modules

**Purpose:** Self-contained feature implementations

**Structure:**
\`\`\`
features/auth/
  ├── components/       # AuthForm, LoginButton, etc.
  ├── hooks/            # useAuth, useSession
  ├── types/            # User, Session types
  ├── utils/            # auth helpers
  └── index.ts          # Public exports
\`\`\`

**Rules:**
- Features don't import from other features
- All exports go through index.ts
- Feature-specific types stay in the feature
- Can use shared components and hooks

### `/src/lib` - Shared Utilities

**Purpose:** Application-wide utilities and services

**Organization:**
- `{'firebase/' if request.google_mode else 'supabase/'}` - Backend SDK configuration
- `utils/` - Helper functions (formatters, validators)
- `constants/` - App-wide constants

**Rules:**
- Pure functions only
- No React hooks here
- Well-tested utilities
- Type-safe exports

### `/src/hooks` - Shared React Hooks

**Purpose:** Reusable React hooks used across features

**Examples:**
- `useAuth.ts` - Authentication state
- `useTheme.ts` - Theme management
- `useMediaQuery.ts` - Responsive helpers

**Rules:**
- Hooks must start with `use`
- Document hook parameters and return values
- Handle loading and error states
- Memoize expensive computations

## Data Flow

### 1. User Interaction

\`\`\`
User clicks button
  → Component event handler
  → Calls custom hook
  → Hook updates state
  → Component re-renders
\`\`\`

### 2. Data Fetching (Server Components)

\`\`\`
Page component (Server)
  → Fetches data from {'Firebase' if request.google_mode else 'Supabase'}
  → Passes data as props
  → Client component renders
\`\`\`

### 3. Mutations (Client Components)

\`\`\`
User submits form
  → Client component
  → Calls API route or {'Firebase' if request.google_mode else 'Supabase'} SDK
  → Updates database
  → Revalidates cache
  → UI updates
\`\`\`

## Key Design Decisions

### 1. Server Components by Default

**Decision:** Use Server Components unless interactivity is needed

**Rationale:**
- Better performance (less JavaScript to client)
- Direct database access (no API routes needed)
- Automatic code splitting
- SEO-friendly

**When to use Client Components:**
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)

### 2. TypeScript Strict Mode

**Decision:** Enable strict TypeScript configuration

**Rationale:**
- Catch errors at compile time
- Better AI autocomplete
- Self-documenting code
- Easier refactoring

**Configuration:** Strict mode enabled with noUncheckedIndexedAccess and noImplicitReturns

### 3. {'Firebase' if request.google_mode else 'Supabase'} for Backend

**Decision:** Use {'Firebase' if request.google_mode else 'Supabase'} as primary backend

**Rationale:**
{'- Real-time database capabilities\n- Built-in authentication\n- Generous free tier\n- Serverless architecture\n- Global CDN' if request.google_mode else '- PostgreSQL (familiar SQL)\n- Row Level Security\n- Real-time subscriptions\n- Open source\n- Self-hostable'}

**Trade-offs:**
{'- Vendor lock-in (mitigated by abstraction layer)\n- NoSQL learning curve\n- Pricing at scale' if request.google_mode else '- Requires PostgreSQL knowledge\n- More setup than Firebase\n- Smaller ecosystem'}

### 4. Tailwind CSS for Styling

**Decision:** Use Tailwind CSS as primary styling solution

**Rationale:**
- Utility-first approach
- No CSS naming conflicts
- Excellent with AI autocomplete
- Built-in responsive design
- Tree-shaking (only used classes)

**Alternatives considered:**
- CSS Modules (too verbose)
- Styled Components (runtime cost)
- Vanilla CSS (hard to maintain)

## Performance Optimizations

### 1. Image Optimization

- Use `next/image` for all images
- Automatic WebP conversion
- Lazy loading by default
- Responsive images

### 2. Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy load below-the-fold content

### 3. Caching Strategy

- Static data: Revalidate daily (86400 seconds)
- Dynamic data: Always fresh with force-dynamic
- Partial prerendering: Enabled for optimal performance

### 4. Bundle Size

- Tree-shaking enabled
- No unused dependencies
- Analyze bundle with `@next/bundle-analyzer`

## Security Considerations

### 1. Authentication

{'- Firebase Auth handles security\n- JWT tokens validated server-side\n- Secure cookie-based sessions\n- CSRF protection built-in' if request.google_mode else '- Supabase Auth with RLS\n- JWT tokens validated\n- Row Level Security policies\n- Secure session management'}

### 2. Environment Variables

- Never commit `.env.local`
- Use `NEXT_PUBLIC_` prefix for client vars
- Validate env vars at build time

### 3. API Security

- Rate limiting on API routes
- Input validation with Zod
- CORS configuration
- Content Security Policy

## Conclusion

This architecture balances:
- **Developer Experience** - Easy to understand and extend
- **AI Compatibility** - Optimized for AI-assisted development
- **Performance** - Fast load times and smooth UX
- **Maintainability** - Clear patterns and documentation

For questions or suggestions, see [CONTRIBUTING.md](./CONTRIBUTING.md).
""",
                description="Comprehensive architecture documentation with design decisions, patterns, and rationale"
            ),
            FileStructure(
                path="KNOWLEDGE_GRAPH.md",
                content=rf"""# Knowledge Graph

{project_structure}

---

## Module Dependencies

### Core Structure

\`\`\`
src/app/
  ├─ layout.{language == 'typescript' and 'tsx' or 'jsx'} → Global layout and providers
  └─ page.{language == 'typescript' and 'tsx' or 'jsx'} → Home page

src/components/
  ├─ ui/ → Reusable UI components
  └─ layout/ → Layout components

src/features/
  └─ [feature]/ → Feature modules (self-contained)

src/lib/
  └─ utils/ → Shared utilities

src/infrastructure/
  └─ services/ → Backend services (Clean Architecture)
{f'      ├─ {backend_service}.{language == "typescript" and "ts" or "js"} → {backend_service.capitalize()} client' if backend_service != "none" else ''}
{f'      ├─ {backend_service}.auth.{language == "typescript" and "ts" or "js"} → Authentication' if backend_service != "none" else ''}
{f'      ├─ {backend_service}.helpers.{language == "typescript" and "ts" or "js"} → CRUD operations' if backend_service != "none" else ''}
{f'      └─ {backend_service}.types.ts → Type definitions' if backend_service != "none" and language == "typescript" else ''}
```

## Key Relationships

- **App** depends on components and features
- **Features** are independent modules
- **Components** use lib utilities
{f'- **{backend_service.capitalize()}** services in src/infrastructure/services/ (Clean Architecture)' if backend_service != "none" else ''}
- **Styles** use {css_display} for consistent theming
- **Infrastructure** layer handles external services and APIs

## Backend Integration

{f'''### {backend_service.capitalize()} Files (Infrastructure Layer)

- `src/infrastructure/services/{backend_service}.{language == "typescript" and "ts" or "js"}` - Client initialization
- `src/infrastructure/services/{backend_service}.auth.{language == "typescript" and "ts" or "js"}` - Authentication (signUp, signIn, signOut, etc.)
- `src/infrastructure/services/{backend_service}.helpers.{language == "typescript" and "ts" or "js"}` - Database operations (CRUD)
{f"- `src/infrastructure/services/{backend_service}.types.ts` - TypeScript type definitions" if language == "typescript" else ""}
- `.env.{backend_service}` - Environment variables template

### Usage Example

```{language}
// Import auth helpers
import {{ signIn, signUp }} from '@/infrastructure/services/{backend_service}.auth';

// Import CRUD helpers  
import {{ createDocument, getDocument }} from '@/infrastructure/services/{backend_service}.helpers';
```

### Clean Architecture Benefits

- **Separation of Concerns**: Backend services isolated in infrastructure layer
- **Testability**: Easy to mock external services
- **Maintainability**: Clear boundaries between layers
- **Flexibility**: Easy to swap backend providers
''' if backend_service != "none" else ''}
""",
                description="Dependency map for AI navigation with project structure"
            ),
            FileStructure(
                path=".cursorrules",
                content=rf"""# {request.description}

## Tech Stack
- Next.js 15 (App Router)
- TypeScript 5
- Tailwind CSS
- {'Firebase (Auth, Firestore)' if request.google_mode else 'Supabase'}

## Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Utilities: camelCase (formatDate.ts)
- Types: PascalCase with Type suffix (UserType)

## Patterns
- Use Server Components by default
- Client Components only when needed
- Colocate related files in features/
- Keep components small (<200 lines)

## Focus Areas
- Type safety (strict TypeScript)
- Performance (lazy loading, optimization)
- Accessibility (ARIA, keyboard navigation)
- AI comprehension (clear structure, docs)

## Avoid
- Any types (use proper TypeScript)
- Inline styles (use Tailwind)
- Large components (split into smaller ones)
""",
                description="AI coding guidelines"
            ),
            FileStructure(
                path="CONTRIBUTING.md",
                content=self._generate_contributing_md(framework, language, backend_service),
                description="AI-friendly contribution guidelines with best practices and workflows"
            ),
            FileStructure(
                path="package.json",
                content="""{
  "name": "mock-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/node": "20.12.7",
    "@types/react": "18.3.1",
    "@types/react-dom": "18.3.0",
    "tailwindcss": "3.4.3",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.38"
  }
}""",
                description="Package configuration with dependencies"
            )
        ]
        
        # Combine template files + documentation (remove package.json from doc_files to avoid duplicates)
        doc_files_filtered = [f for f in doc_files if f.path != "package.json"]
        all_files = template_files + doc_files_filtered
        
        # Log file count for debugging
        logger.info(f"📊 Total files: {len(all_files)}")
        logger.debug(f"   - Template files: {len(template_files)}")
        logger.debug(f"   - Doc files: {len(doc_files_filtered)}")
        backend_file_count = len([f for f in all_files if backend_service in f.path])
        if backend_service != "none":
            logger.info(f"   - {backend_service.capitalize()} files: {backend_file_count}")
        
        # Log sample paths to verify src/ is included
        src_files = [f.path for f in all_files if f.path.startswith('src/')]
        logger.info(f"   - Files in src/: {len(src_files)}")
        if src_files:
            logger.debug(f"   - Sample src/ files: {src_files[:3]}")
        else:
            logger.warning("⚠️  No files found in src/ directory!")
        
        # Log all file paths for detailed debugging
        logger.debug("All file paths:")
        for f in all_files[:10]:  # First 10 files
            logger.debug(f"  - {f.path}")
        if len(all_files) > 10:
            logger.debug(f"  ... and {len(all_files) - 10} more files")
        
        # Generate dynamic known_limitations based on backend
        known_limitations = [
            "Template-based structure with mock documentation",
            "Configure Gemini API for AI-generated custom docs"
        ]
        if backend_service == "firebase":
            known_limitations.append("Firebase configuration required - see .env.firebase for setup")
        elif backend_service == "supabase":
            known_limitations.append("Supabase project required - see .env.supabase for setup")
        
        # Generate dynamic cost_optimizations based on backend
        cost_optimizations = [
            "Optimize images with Next.js Image component for automatic compression",
            "Enable caching strategies to reduce API calls and improve performance",
            "Use Server Components by default to reduce client-side JavaScript bundle"
        ]
        if backend_service == "firebase":
            cost_optimizations.extend([
                "Use Firebase free tier (50K reads/day, 20K writes/day) for development",
                "Implement Firebase caching to reduce Firestore reads",
                "Use Firebase Storage for static assets instead of Firestore"
            ])
        elif backend_service == "supabase":
            cost_optimizations.extend([
                "Use Supabase free tier (500MB database, 1GB file storage) for development",
                "Implement Row Level Security to reduce unnecessary queries",
                "Use Supabase Edge Functions for serverless backend logic"
            ])
        
        return Boilerplate(
            project_metadata=ProjectMetadata(
                name=project_name,
                stack_type=StackType.GOOGLE_MODE if request.google_mode else StackType.AGNOSTIC,
                explanation=f"Template-based boilerplate with AI-generated documentation for: {request.description}"
            ),
            file_structure=all_files,
            dependencies=Dependencies(
                main=["next@15.0.0", "react@19.0.0", "react-dom@19.0.0"],
                dev=["typescript@5.4.5", "@types/react@18.3.1", "tailwindcss@3.4.3"]
            ),
            cursor_rules=CursorRules(
                content="# AI Coding Guidelines\n- TypeScript strict mode\n- Component-first architecture\n- Feature-Sliced Design",
                focus_areas=["type-safety", "performance", "ai-comprehension", "accessibility"]
            ),
            known_limitations=known_limitations,
            cost_optimizations=cost_optimizations
        )
    
    async def _generate_contributing(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str) -> str:
        """Generate CONTRIBUTING.md using AI with custom prompt"""
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-contributing.md"
        
        if not prompt_path.exists():
            logger.error(f"CONTRIBUTING prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)
        
        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 8192,
                }
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate CONTRIBUTING: {e}")
            return f"# Contributing\n\nThank you for contributing to this project!\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
    
    async def _generate_knowledge_graph(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str, size: str, tree: list) -> str:
        """Generate KNOWLEDGE_GRAPH.md using AI with custom prompt"""
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-knowledge-graph.md"
        
        if not prompt_path.exists():
            logger.error(f"KNOWLEDGE_GRAPH prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        tree_str = "\n".join(tree[:50])
        if len(tree) > 50:
            tree_str += f"\n... and {len(tree) - 50} more files"
        
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)
        prompt = prompt.replace("{{SIZE}}", size.upper())
        prompt = prompt.replace("{{TREE}}", tree_str)
        
        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 8192,
                }
            )
            return response.text.strip()
        except Exception as e:
            logger.error(f"Failed to generate KNOWLEDGE_GRAPH: {e}")
            return f"# Knowledge Graph\n\n{tree_str}\n\n---\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*"
    
    async def _generate_metadata(self, request: ProjectRequest, framework: str, language: str, backend_service: str, architecture: str) -> dict:
        """Generate AI metadata (focus_areas, known_limitations, cost_optimizations) using custom prompt"""
        project_root = Path(__file__).parent.parent.parent.parent.parent
        prompt_path = project_root / "prompts" / "generate-metadata.md"
        
        if not prompt_path.exists():
            logger.error(f"Metadata prompt not found at {prompt_path}")
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
        
        with open(prompt_path, "r") as f:
            prompt_template = f.read()
        
        # Format prompt with project details
        prompt = prompt_template.replace("{{DESCRIPTION}}", request.description)
        prompt = prompt.replace("{{FRAMEWORK}}", framework)
        prompt = prompt.replace("{{LANGUAGE}}", language)
        prompt = prompt.replace("{{BACKEND_SERVICE}}", backend_service if backend_service != "none" else "None")
        prompt = prompt.replace("{{CSS_FRAMEWORK}}", request.tech_preferences.css.value if request.tech_preferences.css else "None")
        prompt = prompt.replace("{{ARCHITECTURE}}", architecture)

        try:
            response = await asyncio.to_thread(
                self._call_with_retry,
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 2048,
                }
            )
            
            response_text = response.text.strip()
            # Clean markdown wrapper if present
            if response_text.startswith("```json"):
                response_text = response_text.replace("```json", "").replace("```", "").strip()
            elif response_text.startswith("```"):
                response_text = response_text.replace("```", "").strip()
            
            metadata = json.loads(response_text)
            logger.info(f"✅ Metadata generated: {len(metadata.get('focus_areas', []))} focus areas, {len(metadata.get('known_limitations', []))} limitations, {len(metadata.get('cost_optimizations', []))} optimizations")
            return metadata
        except Exception as e:
            logger.error(f"Failed to generate metadata: {e}")
            return {
                "focus_areas": ["type-safety", "performance", "accessibility", "ai-comprehension"],
                "known_limitations": [
                    f"{backend_service.capitalize()} configuration required" if backend_service != "none" else "Backend service not configured",
                    "Environment variables need to be set",
                    "Authentication not implemented"
                ],
                "cost_optimizations": [
                    f"Use {backend_service} free tier for development" if backend_service != "none" else "Optimize for serverless deployment",
                    "Implement caching strategies",
                    "Optimize images with Next.js Image component",
                    "Enable code splitting and lazy loading"
                ]
            }
