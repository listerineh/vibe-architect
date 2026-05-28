'use client';

import { useState } from 'react';
import { MinimalForm } from '@/components/forms';
import { ArchitectureSelector, GenerationProgress } from '@/components/preview';
import { useStreamingGeneration } from '@/hooks/use-streaming-generation';
import { TechPreferences, downloadZip } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, AlertTriangle, Save } from 'lucide-react';
import { useError } from '@/components/providers';
import { ConfirmDialog } from '@/components/ui/dialog';
import { Header } from '@/components/layout';

export default function GeneratorPage() {
  const { showError } = useError();
  
  const [description, setDescription] = useState('');
  const [techPreferences, setTechPreferences] = useState<TechPreferences>({
    framework: 'nextjs',
    language: 'typescript',
    css: 'tailwind',
    backend_service: 'none'
  });
  const [selectedArchitecture, setSelectedArchitecture] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const {
    progress,
    message,
    status,
    architectures,
    sessionId,
    metadata,
    startGeneration,
    cancelGeneration
  } = useStreamingGeneration();

  // Derive isSaved directly from metadata (no state needed)
  const isSaved = status === 'success' && metadata && (metadata as any).auto_saved === true;

  const handleGenerate = async (desc: string, prefs: TechPreferences) => {
    if (!desc.trim()) {
      showError('Por favor describe tu proyecto');
      return;
    }

    setDescription(desc);
    setTechPreferences(prefs);
    setShowForm(false);
    setSelectedArchitecture(undefined);

    try {
      startGeneration({
        description: desc,
        tech_preferences: prefs
      });
    } catch (error) {
      const err = error as Error;
      showError(err.message || 'Error starting generation');
      setShowForm(true);
    }
  };

  const handlePreview = async (desc: string, prefs: TechPreferences) => {
    // Por ahora, preview hace lo mismo que generate
    handleGenerate(desc, prefs);
  };

  const handleArchitectureSelect = (architecture: string) => {
    setSelectedArchitecture(architecture);
  };

  const handleApplyArchitecture = () => {
    if (!selectedArchitecture || !description || !techPreferences) return;
    
    startGeneration({
      description,
      tech_preferences: techPreferences,
      architecture: selectedArchitecture
    });
  };

  const handleDownload = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('Error al descargar el boilerplate');
      }

      const blob = await response.blob();
      downloadZip(blob, `${description.toLowerCase().replace(/\s+/g, '-')}.zip`);
    } catch (error) {
      const err = error as Error;
      showError(err.message || 'Error al descargar');
    }
  };


  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    cancelGeneration();
    setShowForm(true);
    setDescription('');
    setSelectedArchitecture(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 w-full relative overflow-hidden">
      <Header />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div id="main-content" className="relative w-full px-6 md:px-8 lg:px-16 xl:px-20 py-12 md:py-16">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-3">
            Generate Your Boilerplate
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl">
            Describe your project and get a production-ready codebase with adaptive architecture
          </p>
        </motion.header>

        {/* Alpha Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 md:mb-16 max-w-4xl mx-auto"
        >
          <div className="p-4 md:p-5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <span className="text-2xl">🚧</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-zinc-100">Alpha Demo</h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                    v0.2.1-alpha
                  </span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  This project is in <span className="text-indigo-400 font-medium">early alpha stage</span> and under active development. 
                  Features may change, and you might encounter bugs. Your feedback is valuable!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="w-full max-w-4xl mx-auto space-y-12">
          <AnimatePresence mode="wait">
            {/* Step 1: Form */}
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <MinimalForm 
                  onPreview={handlePreview}
                  onGenerate={handleGenerate}
                  isLoading={status === 'loading'}
                  hasProcessed={status !== 'idle'}
                />
              </motion.div>
            )}

            {/* Step 2: Generation in Progress OR Waiting for Architecture */}
            {!showForm && (architectures || status !== 'idle') && (
              <motion.div
                key="generation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Analysis Phase - Show analyzing state before architecture selection */}
                {status === 'loading' && !selectedArchitecture && !architectures && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Analyzing Your Project</h3>
                        <p className="text-sm text-zinc-400">AI is studying your requirements...</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-300">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span>Analyzing project complexity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <span>Evaluating technical requirements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <span>Proposing optimal architectures</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress Bar - Only show during actual generation (after architecture selected) */}
                {status === 'loading' && selectedArchitecture && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GenerationProgress
                      progress={progress}
                      message={message}
                      status={status}
                      currentStep={
                        progress < 20 ? 'Analyzing project complexity...' :
                        progress < 40 ? 'Proposing architectures...' :
                        progress < 60 ? 'Matching templates...' :
                        progress < 75 ? 'Generating files...' :
                        progress < 90 ? 'Creating documentation...' :
                        progress < 100 ? 'Finalizing project...' :
                        'Complete!'
                      }
                    />
                  </motion.div>
                )}

                {/* Architecture Selection - Show only when waiting for user choice */}
                {architectures && status === 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm"
                  >
                    <ArchitectureSelector
                      architectures={architectures.proposed_architectures}
                      recommended={architectures.recommended}
                      onSelect={handleArchitectureSelect}
                      selectedArchitecture={selectedArchitecture}
                      onApply={handleApplyArchitecture}
                    />
                  </motion.div>
                )}

                {/* Project Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Project Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Description Card */}
                    <div className="md:col-span-2 p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                      <div className="text-xs text-zinc-500 mb-1">Description</div>
                      <div className="text-sm text-zinc-100 font-medium">{description}</div>
                    </div>

                    {/* Framework */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                      <div className="text-xs text-zinc-500 mb-1">Framework</div>
                      <div className="text-sm text-zinc-100 font-medium capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        {techPreferences.framework}
                      </div>
                    </div>

                    {/* Language */}
                    <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                      <div className="text-xs text-zinc-500 mb-1">Language</div>
                      <div className="text-sm text-zinc-100 font-medium capitalize flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {techPreferences.language}
                      </div>
                    </div>

                    {architectures && (
                      <>
                        {/* Size */}
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                          <div className="text-xs text-zinc-500 mb-1">Project Size</div>
                          <div className="text-sm text-zinc-100 font-medium capitalize flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            {architectures.project_size}
                          </div>
                        </div>

                        {/* Complexity */}
                        <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg">
                          <div className="text-xs text-zinc-500 mb-1">Complexity Score</div>
                          <div className="text-sm text-zinc-100 font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                            {architectures.complexity_score}/10
                          </div>
                        </div>

                        {selectedArchitecture && (
                          <div className="md:col-span-2 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-lg">
                            <div className="text-xs text-indigo-300 mb-1">Selected Architecture</div>
                            <div className="text-sm text-indigo-100 font-semibold flex items-center gap-2">
                              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {selectedArchitecture}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Success State - Download */}
                {status === 'success' && sessionId && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    {/* Success Header */}
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500">
                        <Sparkles className="w-10 h-10 text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-zinc-100">
                        Project Generated!
                      </h2>
                      <p className="text-zinc-400 max-w-md mx-auto">
                        Your boilerplate is ready with {selectedArchitecture} architecture
                      </p>
                    </div>

                    {/* Project Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-indigo-400">
                          {architectures?.project_size.toUpperCase()}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Project Size</div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {architectures?.complexity_score}/10
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Complexity</div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {metadata?.file_count || architectures?.proposed_architectures.find(a => a.name === selectedArchitecture)?.estimated_files || '~15'}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Files</div>
                      </div>
                      <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-400 capitalize">
                          {techPreferences.framework}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">Framework</div>
                      </div>
                    </div>

                    {/* What's Included */}
                    <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                      <h3 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What&apos;s Included
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">Production-ready {selectedArchitecture} structure</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">TypeScript configuration</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">Tailwind CSS setup</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">AI-optimized documentation</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">Component templates</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">✓</span>
                          <span className="text-zinc-300">Best practices & patterns</span>
                        </div>
                      </div>
                    </div>

                    {/* File Structure */}
                    {metadata && metadata.file_count > 0 && (
                      <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            File Structure
                          </h3>
                          <span className="text-sm text-zinc-400 bg-zinc-800/50 px-3 py-1 rounded-full">
                            {metadata.file_count} files
                          </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
                          {/* Group files by directory */}
                          {(() => {
                            const filesByDir: Record<string, string[]> = {};
                            const files = metadata.files || [];

                            files.forEach(file => {
                              const parts = file.split('/');
                              if (parts.length === 1) {
                                if (!filesByDir['root']) filesByDir['root'] = [];
                                filesByDir['root'].push(file);
                              } else {
                                const dir = parts.slice(0, -1).join('/');
                                if (!filesByDir[dir]) filesByDir[dir] = [];
                                filesByDir[dir].push(parts[parts.length - 1]);
                              }
                            });

                            return Object.entries(filesByDir).map(([dir, dirFiles]) => (
                              <div key={dir} className="mb-3">
                                {dir !== 'root' && (
                                  <div className="text-xs font-mono text-purple-400 mb-1 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                    {dir}/
                                  </div>
                                )}
                                {dirFiles.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="group text-xs font-mono flex items-center gap-2 py-1.5 px-3 rounded hover:bg-zinc-800/50 transition-colors"
                                  >
                                    <svg className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-zinc-300 group-hover:text-zinc-100 transition-colors">
                                      {dir === 'root' ? file : file}
                                    </span>
                                    {(file.endsWith('.md') || file.endsWith('.tsx') || file.endsWith('.ts')) && (
                                      <span className="ml-auto text-[10px] text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded">
                                        {file.split('.').pop()?.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Project Metadata */}
                    {metadata && (
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Focus Areas */}
                        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                          <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Focus Areas
                          </h3>
                          <ul className="space-y-2">
                            {metadata.focus_areas.map((area, idx) => (
                              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                                <span className="text-indigo-400 mt-0.5">•</span>
                                <span>{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Known Limitations */}
                        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                          <h3 className="text-sm font-bold text-amber-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Known Limitations
                          </h3>
                          <ul className="space-y-2">
                            {metadata.known_limitations.map((limitation, idx) => (
                              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>{limitation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cost Optimizations */}
                        <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
                          <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Cost Optimizations
                          </h3>
                          <ul className="space-y-2">
                            {metadata.cost_optimizations.map((optimization, idx) => (
                              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">•</span>
                                <span>{optimization}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
                      <h3 className="text-lg font-bold text-zinc-100 mb-3">🚀 Next Steps</h3>
                      <ol className="space-y-2 text-sm text-zinc-300">
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">1.</span>
                          <span>Download and extract the ZIP file</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">2.</span>
                          <span>Run <code className="px-2 py-0.5 bg-zinc-900 rounded text-xs">npm install</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">3.</span>
                          <span>Start developing with <code className="px-2 py-0.5 bg-zinc-900 rounded text-xs">npm run dev</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-indigo-400 font-bold">4.</span>
                          <span>Check README.md for detailed instructions</span>
                        </li>
                      </ol>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                      <button
                        onClick={handleDownload}
                        className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-zinc-100 rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5 group-hover:animate-bounce" />
                        Download Boilerplate
                      </button>
                      
                      {isSaved && (
                        <div className="px-8 py-4 bg-green-500/20 border border-green-500 text-green-400 rounded-xl font-semibold flex items-center justify-center gap-2">
                          <Save className="w-5 h-5" />
                          ✅ Saved to your projects!
                        </div>
                      )}
                      
                      <button
                        onClick={handleCancelConfirm}
                        className="px-8 py-4 bg-zinc-800/50 border border-zinc-700 text-zinc-100 rounded-xl font-semibold hover:bg-zinc-800 transition-all"
                      >
                        Generate Another
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Error State */}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 mb-4">
                      <AlertTriangle className="w-10 h-10 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-zinc-100">
                      Generation Error
                    </h2>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      {message}
                    </p>
                    <button
                      onClick={handleCancelConfirm}
                      className="px-8 py-4 bg-zinc-800/50 text-zinc-100 rounded-xl font-semibold hover:bg-zinc-800 transition-all"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* Cancel Button (only during loading) */}
                {status === 'loading' && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleCancelClick}
                      className="group relative inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/50 hover:bg-red-950/30 border border-zinc-800 hover:border-red-900/50 rounded-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <svg 
                        className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors relative z-10" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm font-medium text-zinc-400 group-hover:text-red-400 transition-colors relative z-10">
                        Cancel Generation
                      </span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Generation"
        description="Are you sure you want to cancel the generation? All progress will be lost."
        confirmText="Cancel Generation"
        cancelText="Continue"
        confirmVariant="danger"
        type="warning"
      />
    </div>
  );
}
