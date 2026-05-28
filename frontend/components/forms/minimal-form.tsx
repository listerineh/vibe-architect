'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Check, Zap } from 'lucide-react';
import { TechPreferences, refineDescription } from '@/lib/api';
import { useError } from '@/components/providers';
import { 
  NextJsIcon, 
  ReactIcon, 
  AstroIcon, 
  TypeScriptIcon, 
  JavaScriptIcon, 
  FirebaseIcon, 
  SupabaseIcon, 
  TailwindIcon, 
  SassIcon, 
  PythonIcon,
  NodeIcon,
  GolangIcon,
  PostgresIcon,
  MongoIcon,
  MySQLIcon
} from '@/components/ui';

interface MinimalFormProps {
  onPreview: (description: string, techPrefs: TechPreferences) => void;
  onGenerate: (description: string, techPrefs: TechPreferences) => void;
  isLoading: boolean;
  hasProcessed: boolean;
}

export function MinimalForm({ onPreview, onGenerate, isLoading, hasProcessed }: MinimalFormProps) {
  const { showError } = useError();
  const [description, setDescription] = useState('');
  const [backend, setBackend] = useState<'firebase' | 'supabase' | 'none'>('supabase');
  const [framework, setFramework] = useState<'nextjs' | 'react' | 'astro'>('nextjs');
  const [language, setLanguage] = useState<'typescript' | 'javascript'>('typescript');
  const [css, setCss] = useState<'tailwind' | 'scss'>('tailwind');
  const [isRefining, setIsRefining] = useState(false);

  const techPrefs: TechPreferences = { 
    framework, 
    language, 
    css,
    backend_service: backend
  };

  const handleRefine = async () => {
    if (!description.trim()) return;
    setIsRefining(true);
    try {
      const result = await refineDescription({
        description,
        tech_preferences: techPrefs,
      });
      console.log('Refined description:', result.refined);
      console.log('Refined length:', result.refined?.length);
      setDescription(result.refined || '');
    } catch (error) {
      console.error('Refine error:', error);
      showError('Failed to refine description. Please try again.');
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Description */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Project Description
        </label>
        <div className="relative group">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to build..."
            className="w-full h-36 px-5 py-4 bg-zinc-900/80 border border-zinc-800/50 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 resize-none transition-all duration-200 font-light text-base leading-relaxed"
            disabled={isLoading}
          />
          {description.trim() && (
            <button
              onClick={handleRefine}
              disabled={isRefining || isLoading}
              className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              {isRefining ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin" />
                  Refining
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Refine
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tech Stack Selection */}
      <div className="space-y-6">
        {/* Framework */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Framework</label>
          <div className="w-full grid grid-cols-3 gap-3">
            {[
              { value: 'nextjs', label: 'Next.js', icon: NextJsIcon },
              { value: 'react', label: 'React', icon: ReactIcon },
              { value: 'astro', label: 'Astro', icon: AstroIcon }
            ].map((fw) => (
              <button
                key={fw.value}
                onClick={() => setFramework(fw.value as typeof framework)}
                className={`
                  relative px-4 py-3.5 text-sm rounded-xl border transition-all duration-200 group
                  ${framework === fw.value
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 shadow-lg shadow-zinc-900/50'
                    : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700/70 hover:bg-zinc-900/70'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <fw.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${framework === fw.value ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-xs font-medium">{fw.label}</span>
                </div>
                {framework === fw.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Language</label>
          <div className="w-full grid grid-cols-2 gap-3">
            {[
              { value: 'typescript', label: 'TypeScript', icon: TypeScriptIcon },
              { value: 'javascript', label: 'JavaScript', icon: JavaScriptIcon }
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => setLanguage(lang.value as typeof language)}
                className={`
                  relative px-4 py-3.5 text-sm rounded-xl border transition-all duration-200 group
                  ${language === lang.value
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 shadow-lg shadow-zinc-900/50'
                    : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700/70 hover:bg-zinc-900/70'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <lang.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${language === lang.value ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="text-xs font-medium">{lang.label}</span>
                </div>
                {language === lang.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Backend & Styling */}
        <div className="space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Backend</label>
            <div className="space-y-2">
              <div className="w-full grid grid-cols-3 gap-3">
                {[
                  { value: 'firebase' as const, label: 'Firebase', icon: FirebaseIcon, disabled: false },
                  { value: 'supabase' as const, label: 'Supabase', icon: SupabaseIcon, disabled: false },
                  { value: 'none' as const, label: 'None', icon: () => <span className="text-lg">∅</span>, disabled: false }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => !option.disabled && setBackend(option.value)}
                    disabled={option.disabled}
                    className={`
                      relative px-4 py-3.5 text-sm rounded-xl border transition-all duration-200 group
                      ${backend === option.value
                        ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 shadow-lg shadow-zinc-900/50'
                        : option.disabled
                        ? 'bg-zinc-900/30 border-zinc-800/50 text-zinc-600 cursor-not-allowed'
                        : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700/70 hover:bg-zinc-900/70'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <option.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${backend === option.value ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <span className="text-xs font-medium">{option.label}</span>
                    </div>
                    {backend === option.value && (
                      <div className="absolute top-2 right-2">
                        <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Coming Soon - Custom Backends */}
              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-zinc-500">Custom Backends</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                    Coming Soon
                  </span>
                </div>
                <div className="w-full grid grid-cols-3 gap-3">
                  {[
                    { label: 'Python', icon: PythonIcon },
                    { label: 'Node.js', icon: NodeIcon },
                    { label: 'Go', icon: GolangIcon }
                  ].map((option) => (
                    <button
                      key={option.label}
                      disabled
                      className="px-3 py-2 text-sm rounded-lg border border-zinc-800/50 bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-center justify-center gap-2 min-h-5">
                        {typeof option.icon === 'string' ? (
                          <span className="text-base">{option.icon}</span>
                        ) : (
                          <option.icon className="w-5 h-5" />
                        )}
                        <span className="truncate text-xs">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Coming Soon - Custom Databases */}
              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-zinc-500">Custom Databases</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                    Coming Soon
                  </span>
                </div>
                <div className="w-full grid grid-cols-3 gap-3">
                  {[
                    { label: 'PostgreSQL', icon: PostgresIcon },
                    { label: 'MongoDB', icon: MongoIcon },
                    { label: 'MySQL', icon: MySQLIcon }
                  ].map((option) => (
                    <button
                      key={option.label}
                      disabled
                      className="px-3 py-2 text-sm rounded-lg border border-zinc-800/50 bg-zinc-900/30 text-zinc-600 cursor-not-allowed opacity-60"
                    >
                      <div className="flex items-center justify-center gap-2 min-h-5">
                        {typeof option.icon === 'string' ? (
                          <span className="text-base">{option.icon}</span>
                        ) : (
                          <option.icon className="w-5 h-5" />
                        )}
                        <span className="truncate text-xs">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Styling</label>
            <div className="w-full grid grid-cols-2 gap-3">
              {[
                { value: 'tailwind', label: 'Tailwind', icon: TailwindIcon },
                { value: 'scss', label: 'SCSS', icon: SassIcon }
              ].map((style) => (
                <button
                  key={style.value}
                  onClick={() => setCss(style.value as typeof css)}
                  className={`
                    relative px-4 py-3.5 text-sm rounded-xl border transition-all duration-200 group
                    ${css === style.value
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 shadow-lg shadow-zinc-900/50'
                      : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700/70 hover:bg-zinc-900/70'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <style.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 ${css === style.value ? 'scale-110' : 'group-hover:scale-105'}`} />
                    <span className="text-xs font-medium">{style.label}</span>
                  </div>
                  {css === style.value && (
                    <div className="absolute top-2 right-2">
                      <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <AnimatePresence>
        {description.trim() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-zinc-500 font-medium">
                <span className="text-zinc-400 uppercase tracking-wider">Stack:</span>{' '}
                <span className="text-zinc-300">
                  {framework === 'nextjs' ? 'Next.js' : framework.charAt(0).toUpperCase() + framework.slice(1)}
                  {' • '}
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                  {' • '}
                  {backend === 'firebase' ? 'Firebase' : backend === 'supabase' ? 'Supabase' : 'No Backend'}
                  {' • '}
                  {css === 'tailwind' ? 'Tailwind CSS' : 'SCSS'}
                </span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onPreview(description, techPrefs)}
          disabled={!description.trim() || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-100 text-zinc-900 rounded-xl text-sm font-semibold hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/20"
        >
          <Zap className="w-4 h-4" />
          {hasProcessed ? 'Re-Process' : 'Process'}
        </button>
        
        <AnimatePresence>
          {hasProcessed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -10 }}
              onClick={() => onGenerate(description, techPrefs)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800/80 border border-zinc-700 rounded-xl text-sm font-semibold text-zinc-100 hover:bg-zinc-800 hover:border-zinc-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-900/50"
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 text-sm text-zinc-500"
          >
            <Sparkles className="w-4 h-4 animate-spin" />
            Generating...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
