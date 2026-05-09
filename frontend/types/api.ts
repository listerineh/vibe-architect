export interface TechPreferences {
  framework: 'nextjs' | 'react' | 'astro';
  language: 'typescript' | 'javascript';
  css: 'tailwind' | 'scss';
  database?: string;
  backend_service?: string;
}

export interface ProjectRequest {
  description: string;
  tech_preferences: TechPreferences;
}

export interface ProjectMetadata {
  name: string;
  stack_type: 'google_mode' | 'agnostic';
  explanation: string;
}

export interface FileStructure {
  path: string;
  content: string;
  description: string;
}

export interface Dependencies {
  main: string[];
  dev: string[];
}

export interface CursorRules {
  content: string;
  focus_areas: string[];
}

export interface BoilerplateResponse {
  session_id: string;
  project_metadata: ProjectMetadata;
  file_structure: FileStructure[];
  dependencies: Dependencies;
  cursor_rules: CursorRules;
  known_limitations: string[];
  cost_optimizations?: string[];
}

export interface RefineDescriptionResponse {
  original: string;
  refined: string;
  google_mode: boolean;
  tech_preferences: TechPreferences;
}
