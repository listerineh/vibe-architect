"""Template service for loading and processing boilerplate templates"""
from pathlib import Path
from typing import Dict, List
import json
from loguru import logger

from src.domain.entities.project import FileStructure


class TemplateService:
    """Service for managing boilerplate templates"""
    
    def __init__(self, template_dir: Path):
        self.template_dir = template_dir
    
    def get_template_name(
        self, 
        framework: str, 
        language: str,
        backend_service: str = "none",
        css_framework: str = "tailwind"
    ) -> str:
        """Get template directory name based on framework, language, backend, and CSS"""
        # Map framework + language to template directory
        template_map = {
            ("nextjs", "typescript"): "nextjs-ts",
            ("nextjs", "javascript"): "nextjs-js",
            ("react", "typescript"): "react-ts",
            ("react", "javascript"): "react-js",
            ("astro", "typescript"): "astro-ts",
            ("astro", "javascript"): "astro-js",
        }
        
        key = (framework.lower(), language.lower())
        template_name = template_map.get(key, "nextjs-ts")  # Default to nextjs-ts
        
        # Fallback to nextjs-base if specific template doesn't exist
        template_path = self.template_dir / template_name
        if not template_path.exists():
            logger.warning(f"⚠️  Template {template_name} not found, using nextjs-base")
            return "nextjs-base"
        
        return template_name
    
    def get_project_structure(
        self,
        framework: str,
        language: str,
        backend_service: str = "none",
        css_framework: str = "tailwind"
    ) -> str:
        """Generate project structure description for AI context"""
        
        # Get template name
        template_name = self.get_template_name(framework, language, backend_service, css_framework)
        template_path = self.template_dir / template_name
        
        # Build structure tree
        structure_lines = [f"# Project Structure: {framework.capitalize()} + {language.capitalize()}"]
        structure_lines.append("")
        structure_lines.append("```")
        structure_lines.append("project-root/")
        
        # Add base template structure
        if template_path.exists():
            structure_lines.extend(self._build_tree(template_path, prefix="├── ", max_depth=3))
        
        # Add backend-specific files
        if backend_service != "none":
            structure_lines.append("│")
            structure_lines.append(f"├── src/lib/  # {backend_service.capitalize()} Integration")
            if language == "typescript":
                structure_lines.append(f"│   ├── {backend_service}.ts")
                structure_lines.append(f"│   ├── {backend_service}.types.ts")
                structure_lines.append(f"│   └── {backend_service}.helpers.ts")
            else:
                structure_lines.append(f"│   ├── {backend_service}.js")
                structure_lines.append(f"│   └── {backend_service}.helpers.js")
            structure_lines.append(f"├── .env.{backend_service}  # Environment variables template")
        
        # Add CSS framework info
        if css_framework == "scss":
            structure_lines.append("│")
            structure_lines.append("├── src/styles/  # SCSS Styling")
            structure_lines.append("│   ├── main.scss")
            structure_lines.append("│   └── _variables.scss")
        
        structure_lines.append("```")
        structure_lines.append("")
        
        # Add technology stack info
        structure_lines.append("## Technology Stack")
        structure_lines.append(f"- **Framework:** {framework.capitalize()}")
        structure_lines.append(f"- **Language:** {language.capitalize()}")
        structure_lines.append(f"- **Backend:** {backend_service.capitalize() if backend_service != 'none' else 'None'}")
        structure_lines.append(f"- **Styling:** {css_framework.upper() if css_framework == 'scss' else 'Tailwind CSS'}")
        
        # Add backend-specific notes
        if backend_service == "firebase":
            structure_lines.append("")
            structure_lines.append("### Firebase Services Available")
            structure_lines.append("- Authentication (auth)")
            structure_lines.append("- Firestore Database (db)")
            structure_lines.append("- Cloud Storage (storage)")
            structure_lines.append("- Analytics (analytics)")
        elif backend_service == "supabase":
            structure_lines.append("")
            structure_lines.append("### Supabase Services Available")
            structure_lines.append("- Authentication (auth)")
            structure_lines.append("- PostgreSQL Database (from/select/insert/update/delete)")
            structure_lines.append("- Storage (storage)")
            structure_lines.append("- Real-time subscriptions")
        
        return "\n".join(structure_lines)
    
    def _build_tree(self, path: Path, prefix: str = "", max_depth: int = 3, current_depth: int = 0) -> List[str]:
        """Build a tree structure of the directory"""
        if current_depth >= max_depth:
            return []
        
        lines = []
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name))
            
            # Filter out common ignored items
            ignored = {'.git', 'node_modules', '.next', 'dist', 'build', '__pycache__', '.DS_Store'}
            items = [item for item in items if item.name not in ignored]
            
            for i, item in enumerate(items):
                is_last = i == len(items) - 1
                current_prefix = "└── " if is_last else "├── "
                next_prefix = "    " if is_last else "│   "
                
                if item.is_dir():
                    lines.append(f"{prefix}{current_prefix}{item.name}/")
                    # Recursively add subdirectory contents
                    if current_depth < max_depth - 1:
                        sub_lines = self._build_tree(
                            item, 
                            prefix + next_prefix, 
                            max_depth, 
                            current_depth + 1
                        )
                        lines.extend(sub_lines)
                else:
                    lines.append(f"{prefix}{current_prefix}{item.name}")
        except PermissionError:
            pass
        
        return lines
    
    def get_backend_config_files(self, backend_service: str, language: str) -> List[FileStructure]:
        """Get backend-specific configuration files"""
        files = []
        
        if backend_service == "firebase":
            files.extend(self._get_firebase_files(language))
        elif backend_service == "supabase":
            files.extend(self._get_supabase_files(language))
        
        return files
    
    def _get_firebase_files(self, language: str) -> List[FileStructure]:
        """Load Firebase configuration files from templates"""
        files = []
        
        # Path to Firebase config templates
        backend_configs_dir = self.template_dir.parent / "templates" / "backend-configs"
        firebase_dir = backend_configs_dir / "firebase" / language
        
        if not firebase_dir.exists():
            logger.warning(f"⚠️  Firebase config directory not found: {firebase_dir}")
            return files
        
        # Load all files from Firebase config directory
        for file_path in firebase_dir.rglob("*"):
            if file_path.is_file():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Determine destination path
                    relative_path = file_path.relative_to(firebase_dir)
                    
                    # Map files to correct locations (Clean Architecture)
                    if file_path.name.startswith('.env'):
                        dest_path = str(relative_path)
                    elif file_path.suffix in ['.ts', '.js']:
                        # Backend services go to infrastructure layer
                        dest_path = f"src/infrastructure/services/{relative_path}"
                    else:
                        dest_path = str(relative_path)
                    
                    files.append(FileStructure(
                        path=dest_path,
                        content=content,
                        description=f"Firebase configuration: {file_path.name}"
                    ))
                except Exception as e:
                    logger.error(f"⚠️  Could not read {file_path}: {e}")
        
        return files
    
    def _get_supabase_files(self, language: str) -> List[FileStructure]:
        """Load Supabase configuration files from templates"""
        files = []
        
        # Path to Supabase config templates
        backend_configs_dir = self.template_dir.parent / "templates" / "backend-configs"
        supabase_dir = backend_configs_dir / "supabase" / language
        
        if not supabase_dir.exists():
            logger.warning(f"⚠️  Supabase config directory not found: {supabase_dir}")
            return files
        
        # Load all files from Supabase config directory
        for file_path in supabase_dir.rglob("*"):
            if file_path.is_file():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Determine destination path
                    relative_path = file_path.relative_to(supabase_dir)
                    
                    # Map files to correct locations (Clean Architecture)
                    if file_path.name.startswith('.env'):
                        dest_path = str(relative_path)
                    elif file_path.suffix in ['.ts', '.js']:
                        # Backend services go to infrastructure layer
                        dest_path = f"src/infrastructure/services/{relative_path}"
                    else:
                        dest_path = str(relative_path)
                    
                    files.append(FileStructure(
                        path=dest_path,
                        content=content,
                        description=f"Supabase configuration: {file_path.name}"
                    ))
                except Exception as e:
                    logger.error(f"⚠️  Could not read {file_path}: {e}")
        
        return files
    def get_css_config_files(self, css_framework: str) -> List[FileStructure]:
        """Get CSS framework-specific configuration files"""
        files = []
        
        if css_framework == "scss":
            files.extend(self._get_scss_files())
        
        return files
    
    def _get_scss_files(self) -> List[FileStructure]:
        """Generate SCSS configuration files"""
        files = []
        
        # Main SCSS file
        main_scss = '''// Variables
$primary-color: #4F46E5;
$secondary-color: #6B7280;
$background-color: #FFFFFF;
$text-color: #1F2937;

// Mixins
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Global styles
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: $text-color;
  background-color: $background-color;
}
'''
        
        files.append(FileStructure(
            path="src/styles/main.scss",
            content=main_scss,
            description="Main SCSS file with variables and global styles"
        ))
        
        # Variables file
        variables_scss = '''// Colors
$primary-color: #4F46E5;
$secondary-color: #6B7280;
$success-color: #10B981;
$warning-color: #F59E0B;
$error-color: #EF4444;

// Spacing
$spacing-xs: 0.25rem;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
$spacing-lg: 1.5rem;
$spacing-xl: 2rem;

// Breakpoints
$breakpoint-sm: 640px;
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;
$breakpoint-xl: 1280px;
'''
        
        files.append(FileStructure(
            path="src/styles/_variables.scss",
            content=variables_scss,
            description="SCSS variables for colors, spacing, and breakpoints"
        ))
        
        return files
    
    def update_package_json_dependencies(
        self,
        files: List[FileStructure],
        backend_service: str = "none",
        css_framework: str = "tailwind"
    ) -> List[FileStructure]:
        """Update package.json with additional dependencies based on selections"""
        updated_files = []
        dependencies_dir = self.template_dir.parent / "templates" / "dependencies"
        
        for file in files:
            if file.path == "package.json":
                try:
                    # Parse existing package.json
                    package_data = json.loads(file.content)
                    
                    # Load and merge backend dependencies
                    if backend_service != "none":
                        dep_file = dependencies_dir / f"{backend_service}.json"
                        logger.debug(f"📦 Looking for dependencies file: {dep_file}")
                        if dep_file.exists():
                            with open(dep_file, 'r') as f:
                                backend_deps = json.load(f)
                                logger.debug(f"📦 Loaded {backend_service} dependencies: {backend_deps}")
                                package_data["dependencies"].update(backend_deps.get("dependencies", {}))
                                package_data["devDependencies"].update(backend_deps.get("devDependencies", {}))
                                logger.info(f"📦 Added {backend_service} dependencies: {len(backend_deps.get('dependencies', {}))} main + {len(backend_deps.get('devDependencies', {}))} dev")
                        else:
                            logger.warning(f"⚠️  Dependencies file not found: {dep_file}")
                    
                    # Load and merge CSS dependencies
                    if css_framework in ["scss", "tailwind"]:
                        dep_file = dependencies_dir / f"{css_framework}.json"
                        logger.debug(f"📦 Looking for CSS dependencies file: {dep_file}")
                        if dep_file.exists():
                            with open(dep_file, 'r') as f:
                                css_deps = json.load(f)
                                logger.debug(f"📦 Loaded {css_framework} dependencies: {css_deps}")
                                package_data["dependencies"].update(css_deps.get("dependencies", {}))
                                package_data["devDependencies"].update(css_deps.get("devDependencies", {}))
                                logger.info(f"📦 Added {css_framework} dependencies: {len(css_deps.get('dependencies', {}))} main + {len(css_deps.get('devDependencies', {}))} dev")
                        else:
                            logger.warning(f"⚠️  CSS dependencies file not found: {dep_file}")
                    
                    # Update file with new content
                    updated_content = json.dumps(package_data, indent=2)
                    updated_files.append(FileStructure(
                        path=file.path,
                        content=updated_content,
                        description=file.description
                    ))
                except Exception as e:
                    logger.error(f"⚠️  Could not update package.json: {e}")
                    updated_files.append(file)
            else:
                updated_files.append(file)
        
        return updated_files
    
    def load_template_files(self, template_name: str = "nextjs-base") -> List[FileStructure]:
        """Load all files from a template directory"""
        template_path = self.template_dir / template_name
        
        if not template_path.exists():
            logger.warning(f"⚠️  Template not found: {template_path}")
            return []
        
        files = []
        for file_path in template_path.rglob("*"):
            if file_path.is_file() and not file_path.name.startswith('.'):
                # Get relative path from template root
                relative_path = file_path.relative_to(template_path)
                
                # Read file content
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    files.append(FileStructure(
                        path=str(relative_path),
                        content=content,
                        description=f"Template file: {relative_path}"
                    ))
                except Exception as e:
                    logger.error(f"⚠️  Could not read {file_path}: {e}")
        
        return files
    
    def replace_placeholders(
        self, 
        files: List[FileStructure], 
        replacements: Dict[str, str]
    ) -> List[FileStructure]:
        """Replace placeholders in template files"""
        updated_files = []
        
        for file in files:
            content = file.content
            
            # Replace all placeholders
            for placeholder, value in replacements.items():
                content = content.replace(f"{{{{{placeholder}}}}}", value)
            
            updated_files.append(FileStructure(
                path=file.path,
                content=content,
                description=file.description
            ))
        
        return updated_files
