'use client';

import { useState } from 'react';
import { Sparkles, Download, Eye, Wand2 } from 'lucide-react';
import { GoogleModeToggle } from './google-mode-toggle';
import { TechPreferences, refineDescription } from '@/lib/api';

interface ProjectFormProps {
  onPreview: (description: string, googleMode: boolean, techPrefs: TechPreferences) => void;
  onGenerate: (description: string, googleMode: boolean, techPrefs: TechPreferences) => void;
  isLoading: boolean;
}

export function ProjectForm({ onPreview, onGenerate, isLoading }: ProjectFormProps) {
  const [description, setDescription] = useState('');
  const [googleMode, setGoogleMode] = useState(true);
  const [framework, setFramework] = useState<'nextjs' | 'react' | 'astro'>('nextjs');
  const [language, setLanguage] = useState<'typescript' | 'javascript'>('typescript');
  const [css, setCss] = useState<'tailwind' | 'scss'>('tailwind');
  const [database, setDatabase] = useState('');
  const [backendService, setBackendService] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefined, setShowRefined] = useState(false);

  const techPrefs: TechPreferences = {
    framework,
    language,
    css,
    database: database || undefined,
    backend_service: backendService || undefined,
  };

  const handleRefine = async () => {
    if (!description.trim()) return;
    
    setIsRefining(true);
    try {
      const result = await refineDescription({
        description,
        google_mode: googleMode,
        tech_preferences: techPrefs,
      });
      setDescription(result.refined);
      setShowRefined(true);
      setTimeout(() => setShowRefined(false), 3000); // Hide message after 3s
    } catch (error) {
      console.error('Refine error:', error);
      alert('Failed to refine description. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  const handlePreview = () => {
    if (description.trim()) {
      onPreview(description, googleMode, techPrefs);
    }
  };

  const handleGenerate = () => {
    if (description.trim()) {
      onGenerate(description, googleMode, techPrefs);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
          Project Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., E-commerce platform for selling vintage vinyl records with payment integration..."
          className="w-full h-32 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between">
          {description.trim() ? (
            <p className="text-xs text-green-500">
              ✓ Description entered ({description.length} characters)
            </p>
          ) : (
            <p className="text-xs text-yellow-500 flex items-center gap-1">
              <span>⚠️</span>
              <span>Enter a description to enable Preview and Generate buttons</span>
            </p>
          )}
          
          {description.trim() && (
            <button
              onClick={handleRefine}
              disabled={isRefining || isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-md hover:bg-purple-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Use AI to refine and clarify your description"
            >
              {isRefining ? (
                <>
                  <Sparkles className="w-3 h-3 animate-spin" />
                  Refining...
                </>
              ) : (
                <>
                  <Wand2 className="w-3 h-3" />
                  Refine with AI
                </>
              )}
            </button>
          )}
        </div>
        
        {showRefined && (
          <p className="text-xs text-purple-400 animate-pulse">
            ✨ Description refined! Review and adjust if needed.
          </p>
        )}
      </div>

      {/* Framework and Language Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="framework" className="block text-sm font-medium text-zinc-300">
            Framework
          </label>
          <select
            id="framework"
            value={framework}
            onChange={(e) => setFramework(e.target.value as 'nextjs' | 'react' | 'astro')}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="nextjs">Next.js</option>
            <option value="react">React (Vite)</option>
            <option value="astro">Astro</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="language" className="block text-sm font-medium text-zinc-300">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'typescript' | 'javascript')}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>
      </div>

      <GoogleModeToggle
        enabled={googleMode}
        onToggle={setGoogleMode}
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="css" className="block text-sm font-medium text-zinc-300">
            CSS Framework
          </label>
          <select
            id="css"
            value={css}
            onChange={(e) => setCss(e.target.value as 'tailwind' | 'scss')}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="tailwind">Tailwind CSS</option>
            <option value="scss">Custom SCSS</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="database" className="block text-sm font-medium text-zinc-300">
            Database (Optional)
          </label>
          <input
            id="database"
            type="text"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            placeholder={googleMode ? 'firestore' : 'mongodb'}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="backend" className="block text-sm font-medium text-zinc-300">
            Backend (Optional)
          </label>
          <input
            id="backend"
            type="text"
            value={backendService}
            onChange={(e) => setBackendService(e.target.value)}
            placeholder={googleMode ? 'firebase' : 'supabase'}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePreview}
          disabled={isLoading || !description.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-100 rounded-lg font-medium transition-colors"
          title={!description.trim() ? 'Please enter a project description' : ''}
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !description.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:text-blue-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          title={!description.trim() ? 'Please enter a project description' : ''}
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download ZIP
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-zinc-500 text-center mt-2">
        💡 Tip: Click Preview first! The ZIP will contain exactly what you see in the preview.
      </p>
    </div>
  );
}
