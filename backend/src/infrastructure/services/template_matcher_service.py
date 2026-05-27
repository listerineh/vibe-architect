from pathlib import Path
from typing import List, Dict, Optional
from loguru import logger


class TemplateMatcherService:
    """Service to match project files with template files"""
    
    def __init__(self, templates_base_path: Path):
        self.templates_base_path = templates_base_path
        self.base_files_path = templates_base_path / "base-files"
        self.common_files_path = templates_base_path / "common-files"
        self.component_templates_path = templates_base_path / "component-templates"
    
    def match_files(
        self, 
        tree: List[str], 
        framework: str, 
        language: str
    ) -> Dict[str, List]:
        """
        Match files from project tree with available templates
        
        Args:
            tree: List of file paths from project analysis
            framework: Framework name (nextjs, react, astro)
            language: Language (typescript, javascript)
        
        Returns:
            {
                "found": [
                    {
                        "path": "package.json",
                        "template_path": "templates/base-files/nextjs/package.json",
                        "needs_customization": False
                    }
                ],
                "to_generate": ["src/App.tsx", "src/components/TodoList.tsx"]
            }
        """
        logger.info(f"🔍 Matching {len(tree)} files for {framework}/{language}")
        
        found = []
        to_generate = []
        
        for file_path in tree:
            # 1. Try exact match
            template_path = self._find_exact_match(file_path, framework, language)
            
            if template_path:
                found.append({
                    "path": file_path,
                    "template_path": str(template_path),
                    "needs_customization": False
                })
                logger.debug(f"✓ Exact match: {file_path} → {template_path}")
                continue
            
            # 2. Try pattern match (templates with placeholders)
            template_path = self._find_pattern_match(file_path, framework, language)
            
            if template_path:
                found.append({
                    "path": file_path,
                    "template_path": str(template_path),
                    "needs_customization": True
                })
                logger.debug(f"✓ Pattern match: {file_path} → {template_path}")
                continue
            
            # 3. No match found - needs AI generation
            to_generate.append(file_path)
            logger.debug(f"✗ No match: {file_path} (will generate with AI)")
        
        logger.info(f"📊 Match results: {len(found)} found, {len(to_generate)} to generate")
        
        return {
            "found": found,
            "to_generate": to_generate
        }
    
    def _find_exact_match(
        self, 
        file_path: str, 
        framework: str, 
        language: str
    ) -> Optional[Path]:
        """Find exact template match for a file"""
        file_name = Path(file_path).name
        
        # Check base files (framework-specific configs)
        base_file_path = self.base_files_path / framework / file_name
        if base_file_path.exists():
            return base_file_path
        
        # Check common files (.gitignore, .prettierrc, etc.)
        common_file_path = self.common_files_path / file_name
        if common_file_path.exists():
            return common_file_path
        
        return None
    
    def _find_pattern_match(
        self, 
        file_path: str, 
        framework: str, 
        language: str
    ) -> Optional[Path]:
        """Find template by file pattern/extension"""
        path_obj = Path(file_path)
        ext = path_obj.suffix
        
        # Map extensions to template files
        extension_map = {
            ".tsx": f"{framework}/component.tsx.template",
            ".ts": f"{framework}/hook.ts.template",
            ".jsx": f"{framework}/component.jsx.template",
            ".js": f"{framework}/hook.js.template",
            ".css": "common-files/styles.css.template",
        }
        
        # Special cases for Next.js
        if framework == "nextjs":
            if "page.tsx" in file_path or "page.jsx" in file_path:
                template_name = "page.tsx.template" if language == "typescript" else "page.jsx.template"
                template_path = self.component_templates_path / framework / template_name
                if template_path.exists():
                    return template_path
            
            if "layout.tsx" in file_path or "layout.jsx" in file_path:
                template_name = "layout.tsx.template" if language == "typescript" else "layout.jsx.template"
                template_path = self.component_templates_path / framework / template_name
                if template_path.exists():
                    return template_path
        
        # Try extension-based matching
        template_relative = extension_map.get(ext)
        if template_relative:
            template_path = self.component_templates_path / template_relative
            if template_path.exists():
                return template_path
        
        return None
    
    def load_template_content(self, template_path: str) -> str:
        """Load content from a template file"""
        try:
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load template {template_path}: {e}")
            raise
    
    def customize_template(
        self, 
        content: str, 
        file_path: str, 
        project_context: Dict
    ) -> str:
        """
        Customize template content with placeholders
        
        Placeholders:
            {{COMPONENT_NAME}} - Component name from file path
            {{HOOK_NAME}} - Hook name from file path
            {{PAGE_NAME}} - Page name
            {{APP_NAME}} - Application name
            {{APP_DESCRIPTION}} - App description
        """
        # Extract component/hook name from file path
        file_name = Path(file_path).stem
        
        # Convert file name to PascalCase for component names
        component_name = self._to_pascal_case(file_name)
        
        # Replace placeholders
        content = content.replace("{{COMPONENT_NAME}}", component_name)
        content = content.replace("{{HOOK_NAME}}", file_name)
        content = content.replace("{{PAGE_NAME}}", component_name)
        content = content.replace("{{PAGE_TITLE}}", component_name)
        content = content.replace("{{APP_NAME}}", project_context.get("name", "My App"))
        content = content.replace("{{APP_DESCRIPTION}}", project_context.get("description", ""))
        content = content.replace("{{LAYOUT_NAME}}", component_name or "RootLayout")
        
        return content
    
    def _to_pascal_case(self, text: str) -> str:
        """Convert text to PascalCase"""
        # Remove extensions and special chars
        text = text.replace('.tsx', '').replace('.ts', '').replace('.jsx', '').replace('.js', '')
        
        # Split by common separators
        words = text.replace('-', ' ').replace('_', ' ').split()
        
        # Capitalize each word
        return ''.join(word.capitalize() for word in words)
