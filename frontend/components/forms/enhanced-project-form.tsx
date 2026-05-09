'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Wand2, Zap, Code2, Palette, Layers, Database, Paintbrush } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { TechPreferences, refineDescription } from '@/lib/api';

interface EnhancedProjectFormProps {
  onPreview: (description: string, techPrefs: TechPreferences) => void;
  onGenerate: (description: string, techPrefs: TechPreferences) => void;
  isLoading: boolean;
  hasProcessed: boolean;
}

const frameworks = [
  { value: 'nextjs', label: 'Next.js', desc: 'React Framework' },
  { value: 'react', label: 'React', desc: 'UI Library' },
  { value: 'astro', label: 'Astro', desc: 'Static Site' },
];

const languages = [
  { value: 'typescript', label: 'TypeScript', desc: 'Type-safe' },
  { value: 'javascript', label: 'JavaScript', desc: 'Dynamic' },
];

export function EnhancedProjectForm({ onPreview, onGenerate, isLoading, hasProcessed }: EnhancedProjectFormProps) {
  const [description, setDescription] = useState('');
  const [backend, setBackend] = useState<'firebase' | 'supabase' | 'none'>('supabase');
  const [framework, setFramework] = useState<'nextjs' | 'react' | 'astro'>('nextjs');
  const [language, setLanguage] = useState<'typescript' | 'javascript'>('typescript');
  const [css, setCss] = useState<'tailwind' | 'scss'>('tailwind');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefined, setShowRefined] = useState(false);

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
      setDescription(result.refined);
      setShowRefined(true);
      setTimeout(() => setShowRefined(false), 3000);
    } catch (error) {
      console.error('Refine error:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleProcess = () => {
    if (description.trim()) {
      onPreview(description, techPrefs);
    }
  };

  const handleDownload = () => {
    if (description.trim()) {
      onGenerate(description, techPrefs);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Create Your AI-Optimized Boilerplate
        </h2>
        <p className="text-zinc-400 text-sm">
          Describe your project and let AI generate the perfect structure
        </p>
      </motion.div>

      {/* Main Form */}
      <GlassCard className="p-8" delay={0.1}>
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Project Description
            </label>
            <motion.div
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., E-commerce platform for selling vintage vinyl records with payment integration and real-time inventory..."
                className="w-full h-32 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none backdrop-blur-sm transition-all"
                disabled={isLoading}
              />
            </motion.div>

            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait">
                {description.trim() ? (
                  <motion.p
                    key="valid"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-xs text-green-400 flex items-center gap-1"
                  >
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Ready ({description.length} characters)
                  </motion.p>
                ) : (
                  <motion.p
                    key="invalid"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-xs text-yellow-400/70"
                  >
                    Enter a description to continue
                  </motion.p>
                )}
              </AnimatePresence>

              {description.trim() && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRefine}
                  disabled={isRefining || isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
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
                </motion.button>
              )}
            </div>

            <AnimatePresence>
              {showRefined && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-purple-400 flex items-center gap-2"
                >
                  <Sparkles className="w-3 h-3" />
                  Description refined! Review and adjust if needed.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Framework Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-400" />
              Framework & Language
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              {frameworks.map((fw) => (
                <motion.button
                  key={fw.value}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFramework(fw.value as typeof framework)}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${framework === fw.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{fw.icon}</div>
                  <div className="text-sm font-medium text-white">{fw.label}</div>
                  {framework === fw.value && (
                    <motion.div
                      layoutId="framework-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {languages.map((lang) => (
                <motion.button
                  key={lang.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLanguage(lang.value as typeof language)}
                  className={`
                    relative p-3 rounded-xl border-2 transition-all flex items-center gap-3
                    ${language === lang.value
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-black/20 hover:border-white/20'
                    }
                  `}
                >
                  <span className="text-xl">{lang.icon}</span>
                  <span className="text-sm font-medium text-white">{lang.label}</span>
                  {language === lang.value && (
                    <motion.div
                      layoutId="language-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Google Mode Toggle */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-400" />
              Backend Service
            </label>
            
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'firebase' as const, label: 'Firebase', emoji: '🔥', desc: 'Google Cloud' },
                  { value: 'supabase' as const, label: 'Supabase', emoji: '🐘', desc: 'PostgreSQL' },
                  { value: 'none' as const, label: 'None', emoji: '∅', desc: 'No Backend' }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBackend(option.value)}
                    className={`
                      p-3 rounded-xl border-2 transition-all text-center
                      ${backend === option.value
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="text-sm font-medium text-white">{option.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{option.desc}</div>
                  </motion.button>
                ))}
              </div>
              
              {/* Coming Soon - Custom Backends */}
              <div className="pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-zinc-400">Custom Backends</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    Coming Soon
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Python', emoji: '🐍', desc: 'FastAPI' },
                    { label: 'Node.js', emoji: '🟢', desc: 'Express' },
                    { label: 'Go', emoji: '🔷', desc: 'Gin' }
                  ].map((option) => (
                    <div
                      key={option.label}
                      className="p-3 rounded-xl border-2 border-zinc-800/50 bg-zinc-900/30 text-center opacity-50 cursor-not-allowed"
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium text-zinc-500">{option.label}</div>
                      <div className="text-xs text-zinc-600 mt-0.5">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Coming Soon - Custom Databases */}
              <div className="pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-zinc-400">Custom Databases</span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    Coming Soon
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'PostgreSQL', emoji: '🐘', desc: 'Relational' },
                    { label: 'MongoDB', emoji: '🍃', desc: 'NoSQL' },
                    { label: 'MySQL', emoji: '🐬', desc: 'Relational' }
                  ].map((option) => (
                    <div
                      key={option.label}
                      className="p-3 rounded-xl border-2 border-zinc-800/50 bg-zinc-900/30 text-center opacity-50 cursor-not-allowed"
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-sm font-medium text-zinc-500">{option.label}</div>
                      <div className="text-xs text-zinc-600 mt-0.5">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CSS Framework */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              Styling
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCss('tailwind')}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${css === 'tailwind'
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                  }
                `}
              >
                <div className="text-sm font-medium text-white">Tailwind CSS</div>
                <div className="text-xs text-zinc-400 mt-1">Utility-first</div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCss('scss')}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${css === 'scss'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                  }
                `}
              >
                <div className="text-sm font-medium text-white">SCSS</div>
                <div className="text-xs text-zinc-400 mt-1">Preprocessor</div>
              </motion.button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Tech Stack Summary */}
      <AnimatePresence>
        {description.trim() && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-6" delay={0.2}>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">Your Tech Stack</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Framework */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Code2 className="w-3 h-3" />
                      Framework
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <span className="text-lg">
                        {frameworks.find(f => f.value === framework)?.icon}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {frameworks.find(f => f.value === framework)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Code2 className="w-3 h-3" />
                      Language
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <span className="text-lg">
                        {languages.find(l => l.value === language)?.icon}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {languages.find(l => l.value === language)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Database className="w-3 h-3" />
                      Backend
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <span className="text-lg">{backend === 'firebase' ? '🔥' : backend === 'supabase' ? '🐘' : '∅'}</span>
                      <span className="text-sm font-medium text-white">
                        {backend === 'firebase' ? 'Firebase' : backend === 'supabase' ? 'Supabase' : 'None'}
                      </span>
                    </div>
                  </div>

                  {/* Styling */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Paintbrush className="w-3 h-3" />
                      Styling
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <span className="text-lg">{css === 'tailwind' ? '🎨' : '💅'}</span>
                      <span className="text-sm font-medium text-white">
                        {css === 'tailwind' ? 'Tailwind' : 'SCSS'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full Stack Description */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-zinc-400 text-center">
                    Building with{' '}
                    <span className="text-blue-400 font-medium">
                      {frameworks.find(f => f.value === framework)?.label}
                    </span>
                    {' + '}
                    <span className="text-purple-400 font-medium">
                      {languages.find(l => l.value === language)?.label}
                    </span>
                    {' + '}
                    <span className="text-orange-400 font-medium">
                      {backend === 'firebase' ? 'Firebase' : backend === 'supabase' ? 'Supabase' : 'No Backend'}
                    </span>
                    {' + '}
                    <span className="text-cyan-400 font-medium">
                      {css === 'tailwind' ? 'Tailwind CSS' : 'SCSS'}
                    </span>
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="grid gap-4" style={{ gridTemplateColumns: hasProcessed ? '1fr 1fr' : '1fr' }}>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleProcess}
          disabled={!description.trim() || isLoading}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <Zap className="w-5 h-5" />
          {hasProcessed ? 'Re-Process' : 'Process'}
        </motion.button>

        <AnimatePresence>
          {hasProcessed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Download className="w-5 h-5" />
              Download ZIP
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Loading indicator */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-sm text-blue-400">Generating your boilerplate...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
