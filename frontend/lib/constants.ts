import { FileCode, Package, Target, AlertTriangle, DollarSign } from 'lucide-react';

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    PREVIEW: '/api/preview',
    GENERATE: '/api/generate',
    REFINE: '/api/refine-description',
  },
  TIMEOUT: 30000, // 30 seconds
} as const;

export const TECH_OPTIONS = {
  FRAMEWORKS: [
    { value: 'nextjs', label: 'Next.js', description: 'React framework with SSR' },
    { value: 'react', label: 'React', description: 'UI library' },
    { value: 'astro', label: 'Astro', description: 'Content-focused framework' },
  ],
  LANGUAGES: [
    { value: 'typescript', label: 'TypeScript', description: 'Type-safe JavaScript' },
    { value: 'javascript', label: 'JavaScript', description: 'Dynamic scripting' },
  ],
  CSS: [
    { value: 'tailwind', label: 'Tailwind CSS', description: 'Utility-first CSS' },
    { value: 'scss', label: 'SCSS', description: 'Sass preprocessor' },
  ],
  DATABASES: [
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'mysql', label: 'MySQL' },
  ],
  BACKEND_SERVICES: [
    { value: 'none', label: 'None' },
    { value: 'firebase', label: 'Firebase' },
    { value: 'supabase', label: 'Supabase' },
  ],
} as const;

export const STREAMING_SECTIONS = [
  { 
    id: 'file_structure', 
    title: 'File Structure', 
    icon: FileCode as any, 
    status: 'pending' as const 
  },
  { 
    id: 'dependencies', 
    title: 'Dependencies', 
    icon: Package as any, 
    status: 'pending' as const 
  },
  { 
    id: 'focus_areas', 
    title: 'Focus Areas', 
    icon: Target as any, 
    status: 'pending' as const 
  },
  { 
    id: 'limitations', 
    title: 'Known Limitations', 
    icon: AlertTriangle as any, 
    status: 'pending' as const 
  },
  { 
    id: 'cost_optimizations', 
    title: 'Cost Optimizations', 
    icon: DollarSign as any, 
    status: 'pending' as const 
  },
];

export const VALIDATION = {
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
} as const;

export const MESSAGES = {
  ERRORS: {
    NETWORK: 'Network error. Please check your connection and try again.',
    SERVER: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    PREVIEW_FAILED: 'Failed to preview boilerplate',
    GENERATE_FAILED: 'Failed to generate boilerplate',
    REFINE_FAILED: 'Failed to refine description',
  },
  SUCCESS: {
    PREVIEW_GENERATED: 'Preview generated successfully',
    BOILERPLATE_DOWNLOADED: 'Boilerplate downloaded successfully',
  },
  LOADING: {
    PREVIEWING: 'Generating preview...',
    GENERATING: 'Generating boilerplate...',
    REFINING: 'Refining description...',
  },
} as const;
