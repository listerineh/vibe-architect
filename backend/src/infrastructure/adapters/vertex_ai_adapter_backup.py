import os
import json
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

class GeminiAPIAdapter(AIServicePort):
    """Adapter for Google AI Studio (Gemini API) integration"""
    
    def __init__(self):
        self._settings = settings  # Store settings reference
        self._initialized = False
        self._api_key = settings.gemini_api_key
        
        # Initialize template service
        backend_dir = Path(__file__).parent.parent.parent.parent
        template_dir = backend_dir / "templates"
        self._template_service = TemplateService(template_dir)
        
        if not self._api_key:
            logger.warning("⚠️  No GEMINI_API_KEY configured - running in MOCK MODE")
            logger.info("   Get your API key from: https://aistudio.google.com/app/apikey")
            return
        
        try:
            import google.generativeai as genai
            import time
            
            self._model_name = "gemini-2.5-flash"
            genai.configure(api_key=self._api_key)
            self._model = genai.GenerativeModel(self._model_name)
            self._initialized = True
            self._retry_delay = 0  # Track retry delay for rate limiting
            logger.info(f"✅ Gemini API initialized: {self._model_name}")
        except ImportError:
            logger.error("⚠️  google-generativeai not installed")
            logger.info("   Install with: pip install google-generativeai")
        except Exception as e:
            logger.error(f"⚠️  Gemini API initialization failed: {e}")
            logger.warning("   Running in MOCK MODE for development")
    
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
    
    def _load_system_prompt(self) -> str:
        """Load system prompt from file"""
        backend_dir = Path(__file__).parent.parent.parent.parent
        prompt_path = backend_dir.parent / "prompts" / "system-prompt.md"
        
        if not prompt_path.exists():
            logger.warning(f"System prompt not found at {prompt_path}")
            return "You are an AI assistant that generates Next.js boilerplates."
        
        with open(prompt_path, "r") as f:
            return f.read()
    
    async def _generate_readme(self, request: ProjectRequest, framework: str, language: str, backend_service: str) -> str:
        """Generate README.md using AI"""
        branding_footer = "\n\n---\n\n<div align=\"center\">\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*\n\n</div>"
        
        prompt = f"""Generate a comprehensive README.md for this project:

**Project Description:** {request.description}
**Framework:** {framework}
**Language:** {language}
**Backend Service:** {backend_service if backend_service != "none" else "None"}
**CSS Framework:** {request.tech_preferences.css.value}

Create a professional README.md with:
1. Project title and description
2. Tech stack badges (Next.js, TypeScript, Tailwind, {backend_service if backend_service != "none" else ""}
3. Quick start guide (installation, setup, run)
4. Project structure overview
5. Key features
6. Environment variables needed
7. Deployment instructions

Make it AI-friendly with clear structure and semantic organization.
Output ONLY the markdown content, no JSON wrapper."""

        try:
            response = self._call_with_retry(
                prompt,
                generation_config={
                    "temperature": 0.5,
                    "max_output_tokens": 8192,  # Maximum for Gemini 2.5 Flash
                }
            )
            return response.text.strip() + branding_footer
        except Exception as e:
            logger.error(f"Failed to generate README: {e}")
            return f"# {request.description}\n\nGenerated boilerplate project.{branding_footer}"
    
    async def _generate_architecture(self, request: ProjectRequest, project_structure: str, framework: str, backend_service: str) -> str:
        """Generate ARCHITECTURE.md using AI"""
        branding_footer = "\n\n---\n\n<div align=\"center\">\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*\n\n</div>"
        
        prompt = f"""Generate a comprehensive ARCHITECTURE.md for this project:

**Project Description:** {request.description}
**Framework:** {framework}
**Backend Service:** {backend_service if backend_service != "none" else "None"}

**Project Structure:**
{project_structure}

Create detailed architecture documentation with:
1. Overview and design philosophy
2. Architecture pattern (Feature-Sliced Design)
3. Folder structure rationale
4. Data flow explanation
5. Key design decisions
6. Performance optimizations
7. Security considerations

Make it AI-friendly with clear explanations.
Output ONLY the markdown content, no JSON wrapper."""

        try:
            response = self._call_with_retry(
                prompt,
                generation_config={
                    "temperature": 0.4,
                    "max_output_tokens": 8192,  # Maximum for Gemini 2.5 Flash
                }
            )
            return response.text.strip() + branding_footer
        except Exception as e:
            logger.error(f"Failed to generate ARCHITECTURE: {e}")
            return f"# Architecture\n\n{project_structure}{branding_footer}"
    
    async def _generate_cursorrules(self, request: ProjectRequest, framework: str, language: str, backend_service: str) -> str:
        """Generate .cursorrules using AI"""
        prompt = f"""Generate a .cursorrules file for this project:

**Project Description:** {request.description}
**Framework:** {framework}
**Language:** {language}
**Backend Service:** {backend_service if backend_service != "none" else "None"}
**CSS Framework:** {request.tech_preferences.css.value}

Create AI coding guidelines with:
1. Tech stack summary
2. Naming conventions (components, utilities, types, hooks)
3. Patterns to follow (Server Components, Feature-Sliced Design)
4. Focus areas (type-safety, performance, accessibility)
5. Things to avoid (any types, inline styles, large components)

Make it concise and actionable for AI assistants.
Output ONLY the file content, no markdown wrapper."""

        try:
            response = self._call_with_retry(
                prompt,
                generation_config={
                    "temperature": 0.3,
                    "max_output_tokens": 8192,  # Maximum for Gemini 2.5 Flash
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
            response = self._call_with_retry(
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
    
    async def generate_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        """Generate boilerplate using multiple specialized AI calls"""
        # Use mock if enabled in settings
        if self._settings.use_mock:
            logger.info("🎭 Mock mode enabled, using mock data")
            return self._generate_mock_boilerplate(request)
        
        # For development without API key
        if not self._settings.gemini_api_key or self._settings.gemini_api_key == "your-api-key-here":
            logger.warning("⚠️  No valid API key found, using mock data")
            return self._generate_mock_boilerplate(request)
        
        try:
            # Extract tech preferences
            framework = request.tech_preferences.framework if hasattr(request.tech_preferences, 'framework') else "nextjs"
            language = request.tech_preferences.language if hasattr(request.tech_preferences, 'language') else "typescript"
            backend_service = request.tech_preferences.backend_service if hasattr(request.tech_preferences, 'backend_service') else "none"
            css_framework = request.tech_preferences.css if hasattr(request.tech_preferences, 'css') else "tailwind"
            
            # Generate project structure for context
            project_structure = self._template_service.get_project_structure(
                framework, language, backend_service, css_framework
            )
            
            logger.info("🚀 Starting parallel AI calls for documentation...")
            
            # Make 4 specialized calls in parallel
            import asyncio
            readme, architecture, cursorrules, metadata = await asyncio.gather(
                self._generate_readme(request, framework, language, backend_service),
                self._generate_architecture(request, project_structure, framework, backend_service),
                self._generate_cursorrules(request, framework, language, backend_service),
                self._generate_metadata(request, framework, backend_service),
                return_exceptions=True  # Don't fail if one call fails
            )
            
            logger.info("✅ All AI calls completed")
            
            # Handle exceptions in responses
            if isinstance(readme, Exception):
                logger.error(f"README generation failed: {readme}")
                readme = f"# {request.description}\n\nGenerated boilerplate project."
            if isinstance(architecture, Exception):
                logger.error(f"ARCHITECTURE generation failed: {architecture}")
                architecture = f"# Architecture\n\n{project_structure}"
            if isinstance(cursorrules, Exception):
                logger.error(f".cursorrules generation failed: {cursorrules}")
                cursorrules = f"# {request.description}\n\n## Tech Stack\n- {framework}\n- {language}"
            if isinstance(metadata, Exception):
                logger.error(f"Metadata generation failed: {metadata}")
                metadata = {
                    "focus_areas": ["type-safety", "performance", "accessibility"],
                    "known_limitations": ["Configuration required"],
                    "cost_optimizations": ["Optimize for production"]
                }
            
            # Load template files
            template_name = self._template_service.get_template_name(framework, language, backend_service, css_framework)
            template_files = self._template_service.load_template_files(template_name)
            
            # Add backend files
            if backend_service != "none":
                backend_files = self._template_service.get_backend_config_files(backend_service, language)
                for file in backend_files:
                    if file.path.startswith('.env'):
                        template_files.append(file)
                    else:
                        filename = file.path.split('/')[-1]
                        mapped_file = FileStructure(
                            path=f"src/lib/{filename}",
                            content=file.content,
                            description=file.description
                        )
                        template_files.append(mapped_file)
                logger.info(f"✅ Added {len(backend_files)} {backend_service} configuration files")
            
            # Add CSS files
            if css_framework == "scss":
                css_files = self._template_service.get_css_config_files(css_framework)
                template_files.extend(css_files)
            
            # Add AI-generated documentation files
            ai_doc_files = [
                FileStructure(
                    path="README.md",
                    content=readme,
                    description="Comprehensive project overview with setup instructions"
                ),
                FileStructure(
                    path="ARCHITECTURE.md",
                    content=architecture,
                    description="Architecture decisions and design patterns"
                ),
                FileStructure(
                    path=".cursorrules",
                    content=cursorrules,
                    description="AI coding guidelines and conventions"
                ),
                FileStructure(
                    path="CONTRIBUTING.md",
                    content=self._generate_contributing_md(framework, language, backend_service),
                    description="AI-friendly contribution guidelines"
                ),
                FileStructure(
                    path="KNOWLEDGE_GRAPH.md",
                    content=f"# Knowledge Graph\n\n{project_structure}\n\n## Module Dependencies\n\nSee ARCHITECTURE.md for detailed relationships.",
                    description="Dependency map for AI navigation"
                )
            ]
            
            # Combine all files
            all_files = template_files + ai_doc_files
            
            logger.info(f"📊 Total files: {len(all_files)} ({len(template_files)} template + {len(ai_doc_files)} AI docs)")
            
            # Extract dependencies from updated package.json
            extracted_deps = self._extract_dependencies_from_package_json(all_files)
            
            # Create boilerplate with AI-generated metadata
            project_name = request.description.lower().replace(" ", "-")[:30]
            
            return Boilerplate(
                project_metadata=ProjectMetadata(
                    name=project_name,
                    stack_type=StackType.GOOGLE_MODE if request.google_mode else StackType.AGNOSTIC,
                    explanation=f"AI-optimized {framework} boilerplate for: {request.description}"
                ),
                file_structure=all_files,
                dependencies=extracted_deps,
                cursor_rules=CursorRules(
                    content=cursorrules,
                    focus_areas=metadata.get("focus_areas", ["type-safety", "performance"])
                ),
                known_limitations=metadata.get("known_limitations", []),
                cost_optimizations=metadata.get("cost_optimizations", [])
            )
            
        except Exception as e:
            logger.error(f"Error generating boilerplate: {e}")
            logger.exception("Full traceback:")
            logger.warning("⚠️  Falling back to mock data")
            return self._generate_mock_boilerplate(request)
    
    def _parse_response(self, data: dict, request: ProjectRequest = None) -> Boilerplate:
        """Parse AI response into domain entities with safe defaults"""
        # VibeArchitect branding footer for .md files
        branding_footer = "\n\n---\n\n<div align=\"center\">\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*\n\n</div>"
        
        # Get AI-generated files
        ai_files = []
        for file in data.get("file_structure", []):
            content = file.get("content", "")
            path = file.get("path", "unknown.txt")
            
            # Add branding to .md files
            if path.endswith('.md'):
                content = content + branding_footer
            
            ai_files.append(FileStructure(
                path=path,
                content=content,
                description=file.get("description", "Generated file")
            ))
        
        
        # If request is provided, add template files
        all_files = ai_files
        if request:
            framework = request.tech_preferences.framework if hasattr(request.tech_preferences, 'framework') else "nextjs"
            language = request.tech_preferences.language if hasattr(request.tech_preferences, 'language') else "typescript"
            backend_service = request.tech_preferences.backend_service if hasattr(request.tech_preferences, 'backend_service') else "none"
            css_framework = request.tech_preferences.css if hasattr(request.tech_preferences, 'css') else "tailwind"
            
            template_name = self._template_service.get_template_name(framework, language, backend_service, css_framework)
            template_files = self._template_service.load_template_files(template_name)
            
            # Add backend files
            if backend_service != "none":
                backend_files = self._template_service.get_backend_config_files(backend_service, language)
                for file in backend_files:
                    if file.path.startswith('.env'):
                        template_files.append(file)
                    else:
                        filename = file.path.split('/')[-1]
                        mapped_file = FileStructure(
                            path=f"src/lib/{filename}",
                            content=file.content,
                            description=file.description
                        )
                        template_files.append(mapped_file)
            
            # Add CSS files
            if css_framework == "scss":
                css_files = self._template_service.get_css_config_files(css_framework)
                template_files.extend(css_files)
            
            # Combine template files + AI files (AI files override template files with same path)
            file_map = {f.path: f for f in template_files}
            for ai_file in ai_files:
                file_map[ai_file.path] = ai_file
            
            # Add CONTRIBUTING.md generated by backend (always, not from AI)
            contributing_content = self._generate_contributing_md(framework, language, backend_service)
            file_map["CONTRIBUTING.md"] = FileStructure(
                path="CONTRIBUTING.md",
                content=contributing_content,
                description="AI-friendly contribution guidelines with best practices and workflows"
            )
            
            all_files = list(file_map.values())
            logger.info(f"📊 Combined files: {len(template_files)} template + {len(ai_files)} AI + 1 CONTRIBUTING = {len(all_files)} total")
        
        return Boilerplate(
            project_metadata=ProjectMetadata(
                name=data.get("project_metadata", {}).get("name", "generated-project"),
                stack_type=StackType(data.get("project_metadata", {}).get("stack_type", "agnostic")),
                explanation=data.get("project_metadata", {}).get("explanation", "AI-generated boilerplate")
            ),
            file_structure=all_files,
            dependencies=Dependencies(
                main=data.get("dependencies", {}).get("main", ["next@14", "react@18"]),
                dev=data.get("dependencies", {}).get("dev", ["typescript@5"])
            ),
            cursor_rules=CursorRules(
                content=data.get("cursor_rules", {}).get("content", "# AI Guidelines\n- TypeScript strict mode"),
                focus_areas=data.get("cursor_rules", {}).get("focus_areas", ["type-safety"])
            ),
            known_limitations=data.get("known_limitations", []),
            cost_optimizations=data.get("cost_optimizations", [])
        )
    
    def _generate_contributing_md(self, framework: str, language: str, backend_service: str) -> str:
        """Generate a standard CONTRIBUTING.md file"""
        branding_footer = "\n\n---\n\n<div align=\"center\">\n\n**Generated with ❤️ by [VibeArchitect](https://vibearchitect.dev)**\n\n*AI-First Boilerplate Generator - Optimized for Cursor & Windsurf*\n\n</div>"
        
        return f"""# Contributing to the Project (AI-Friendly Guide)

This document outlines the guidelines and best practices for contributing to this project, specifically tailored to help AI models like Cursor/Windsurf understand the expectations.

## 1. Core Principles for AI Contributions

### **AI-First Mindset**: Prioritize clarity and semantic structure
- Write code that is easy for AI to understand and extend
- Use descriptive variable and function names (no abbreviations)
- Add JSDoc/TSDoc comments for all public functions
- Keep functions small and focused (single responsibility)

### **Type Safety First**
- Always use TypeScript strict mode
- Define interfaces for all data structures
- Avoid `any` types - use `unknown` or proper types
- Export types for reusability

### **Feature-Sliced Design**
- Keep features self-contained in `src/features/[feature-name]/`
- Don't cross-import between features
- Use shared components from `src/components/`
- Keep business logic in hooks, not components

## 2. Development Workflow

### Setting Up Your Environment

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Before Making Changes

1. **Understand the architecture** - Read `ARCHITECTURE.md`
2. **Check the knowledge graph** - Review `KNOWLEDGE_GRAPH.md` for dependencies
3. **Follow the .cursorrules** - AI coding guidelines are in `.cursorrules`

### Making Changes

1. **Create a new branch** (if using Git)
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Write code following patterns**
   - Use existing components as templates
   - Follow naming conventions (see below)
   - Add TODO comments for incomplete features

3. **Test your changes**
   ```bash
   npm run build    # Ensure it builds
   npm run lint     # Check for linting errors
   ```

## 3. Code Style Guidelines

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`, `ProductCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase with Type/Interface suffix (`UserType`, `ProductInterface`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useProducts.ts`)

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
│   ├── ui/          # Base components (Button, Input, Card)
│   └── layout/      # Layout components (Header, Footer)
├── features/        # Feature modules (self-contained)
├── lib/             # Utilities and services
├── hooks/           # Shared React hooks
└── types/           # Shared TypeScript types
```

### Component Structure

```typescript
// 1. Imports (grouped: React, external, internal)
import {{ useState }} from 'react';
import {{ Button }} from '@/components/ui/button';

// 2. Types/Interfaces
interface MyComponentProps {{
  title: string;
  onAction: () => void;
}}

// 3. Component
export function MyComponent({{ title, onAction }}: MyComponentProps) {{
  // 4. Hooks
  const [state, setState] = useState(false);
  
  // 5. Event handlers
  const handleClick = () => {{
    setState(true);
    onAction();
  }};
  
  // 6. Render
  return (
    <div>
      <h1>{{title}}</h1>
      <Button onClick={{handleClick}}>Action</Button>
    </div>
  );
}}
```

## 4. Tech Stack Specific Guidelines

### {framework.capitalize()} Best Practices

{"- Use Server Components by default (no 'use client' unless needed)" if framework == "nextjs" else "- Keep components pure and reusable"}
{"- Use App Router patterns (layouts, loading, error)" if framework == "nextjs" else "- Follow React best practices"}
{"- Leverage Next.js Image component for optimization" if framework == "nextjs" else "- Optimize images and assets"}

### {language.capitalize()} Guidelines

{"- Enable strict mode in tsconfig.json" if language == "typescript" else "- Use JSDoc for type hints"}
{"- Use type inference when possible" if language == "typescript" else "- Add PropTypes for components"}
{"- Avoid type assertions (use type guards)" if language == "typescript" else "- Validate props at runtime"}

### Styling with Tailwind CSS

- Use Tailwind utility classes (avoid inline styles)
- Create reusable components for repeated patterns
- Use `cn()` utility for conditional classes
- Follow mobile-first responsive design

{f'''### {backend_service.capitalize()} Integration

- All backend calls go through `src/lib/{backend_service}.ts`
- Use proper error handling for all API calls
- Implement loading states for async operations
- Cache data when appropriate
''' if backend_service != "none" else ""}

## 5. AI Coding Assistance Tips

### For Cursor/Windsurf Users

1. **Use the knowledge graph** - Reference `KNOWLEDGE_GRAPH.md` for module relationships
2. **Check .cursorrules** - AI guidelines are defined there
3. **Read component docs** - Each component has JSDoc explaining its purpose
4. **Follow existing patterns** - Use similar components as templates

### Effective AI Prompts

**Good prompts:**
- "Create a user profile component following the pattern in UserCard.tsx"
- "Add error handling to the login function in src/lib/auth.ts"
- "Implement a loading state for the products list using Suspense"

**Bad prompts:**
- "Make it work" (too vague)
- "Fix the bug" (no context)
- "Add a feature" (no specification)

## 6. Testing Guidelines

### Manual Testing Checklist

- [ ] Component renders without errors
- [ ] All interactive elements work (buttons, forms, links)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors

### Future: Automated Testing

- Unit tests for utilities and hooks
- Integration tests for features
- E2E tests for critical user flows

## 7. Performance Best Practices

- **Use Server Components** when possible (Next.js)
- **Lazy load** heavy components with `React.lazy()`
- **Optimize images** with next/image or similar
- **Minimize bundle size** - check with bundle analyzer
- **Implement caching** for API responses

## 8. Accessibility (A11Y)

- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Add ARIA labels for interactive elements
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

## 9. Security Considerations

- Never commit `.env.local` or secrets
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for all API calls
- Implement CSRF protection for forms

## 10. Documentation

### Code Comments

- Add JSDoc for all exported functions
- Explain **why**, not **what** (code shows what)
- Document complex algorithms or business logic
- Keep comments up-to-date with code changes

### README Updates

- Update README.md if you add new features
- Document new environment variables
- Add setup instructions for new dependencies

## 11. Common Pitfalls to Avoid

❌ **Don't:**
- Use `any` type in TypeScript
- Create large monolithic components (>200 lines)
- Hardcode values (use constants or env vars)
- Ignore TypeScript errors
- Skip error handling

✅ **Do:**
- Break down complex components
- Use proper TypeScript types
- Handle errors gracefully
- Follow existing patterns
- Write self-documenting code

## 12. Getting Help

### Resources

- **Architecture**: See `ARCHITECTURE.md` for design decisions
- **Dependencies**: Check `KNOWLEDGE_GRAPH.md` for module relationships
- **AI Guidelines**: Review `.cursorrules` for coding standards
- **Framework Docs**: [{framework.capitalize()} Documentation](https://{"nextjs.org" if framework == "nextjs" else "react.dev"})

### Questions?

- Check existing code for similar patterns
- Review the documentation files
- Ask AI (Cursor/Windsurf) with specific context
- Refer to official framework documentation

## Summary

This project is optimized for AI-assisted development. Follow these guidelines to maintain code quality and consistency:

1. **Type safety** - Use TypeScript strictly
2. **Clear structure** - Follow Feature-Sliced Design
3. **Self-documenting** - Write descriptive code
4. **AI-friendly** - Use semantic naming and comments
5. **Performance** - Optimize for speed and bundle size

Happy coding! 🚀{branding_footer}"""
    
    def _generate_mock_boilerplate(self, request: ProjectRequest) -> Boilerplate:
        """Generate mock boilerplate using templates + mock docs"""
        project_name = request.description.lower().replace(" ", "-")[:30]
        
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
\`\`\`

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

\`\`\`{language}
// Import auth helpers
import {{ signIn, signUp }} from '@/infrastructure/services/{backend_service}.auth';

// Import CRUD helpers  
import {{ createDocument, getDocument }} from '@/infrastructure/services/{backend_service}.helpers';
\`\`\`

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
