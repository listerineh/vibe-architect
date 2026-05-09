import React from 'react';
import { FileStructure, Dependencies } from './api';

export type SectionData = FileStructure[] | Dependencies | string[];

export interface StreamingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'generating' | 'complete';
  data?: SectionData;
}

export interface FormState {
  description: string;
  techPreferences: {
    framework: 'nextjs' | 'react' | 'astro';
    language: 'typescript' | 'javascript';
    css: 'tailwind' | 'scss';
    database?: string;
    backend_service?: string;
  };
}

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

export interface ErrorState {
  error: string | null;
  errorType?: 'validation' | 'network' | 'server';
}
