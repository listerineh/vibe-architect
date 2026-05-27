const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

export interface ProjectAnalysis {
  size: 'small' | 'medium' | 'large';
  reasoning: string;
  tree: string[];
  estimated_files: number;
  complexity_score: number;
  required_base_files: string[];
}

export interface ArchitectureProposal {
  name: string;
  reasoning: string;
  complexity: 'low' | 'medium' | 'high';
  pros: string[];
  cons: string[];
  estimated_files: number;
  example_structure: string[];
}

export interface ArchitectureAnalysis {
  project_size: 'small' | 'medium' | 'large';
  complexity_score: number;
  reasoning: string;
  proposed_architectures: ArchitectureProposal[];
  recommended: string;
}

export async function previewBoilerplate(request: ProjectRequest): Promise<BoilerplateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate boilerplate');
  }

  return response.json();
}

export async function generateBoilerplate(
  request: ProjectRequest,
  sessionId?: string
): Promise<Blob> {
  const body = sessionId
    ? { session_id: sessionId }
    : request;

  const response = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate boilerplate');
  }

  return response.blob();
}

export async function refineDescription(request: ProjectRequest): Promise<{
  original: string;
  refined: string;
  google_mode: boolean;
  tech_preferences: TechPreferences;
}> {
  const response = await fetch(`${API_BASE_URL}/api/refine-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to refine description');
  }

  return response.json();
}

export async function analyzeProject(request: ProjectRequest): Promise<ProjectAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/analyze-project`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze project');
  }

  return response.json();
}

export async function proposeArchitectures(request: ProjectRequest): Promise<ArchitectureAnalysis> {
  const response = await fetch(`${API_BASE_URL}/api/propose-architectures`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to propose architectures');
  }

  return response.json();
}

export function downloadZip(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
