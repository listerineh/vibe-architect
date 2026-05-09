'use client';

import { useState } from 'react';
import { MinimalForm } from '@/components/forms';
import { StreamingPreview, ProjectSummary } from '@/components/preview';
import { previewBoilerplate, generateBoilerplate, TechPreferences, BoilerplateResponse } from '@/lib/api';
import { FileCode, Package, Target, AlertTriangle, DollarSign, ArrowLeft } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useError } from '@/components/providers';

function downloadZip(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

interface FileItem {
  path: string;
  content: string;
  description: string;
}

interface DependenciesData {
  main?: string[];
  dev?: string[];
}

type SectionData = FileItem[] | DependenciesData | string[];

interface StreamingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'generating' | 'complete';
  data?: SectionData;
}

export default function GeneratorPage() {
  const { showError } = useError();
  const [preview, setPreview] = useState<BoilerplateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [streamingSections, setStreamingSections] = useState<StreamingSection[]>([
    { id: 'file_structure', title: 'File Structure', icon: <FileCode className="w-4 h-4" />, status: 'pending' },
    { id: 'dependencies', title: 'Dependencies', icon: <Package className="w-4 h-4" />, status: 'pending' },
    { id: 'focus_areas', title: 'Focus Areas', icon: <Target className="w-4 h-4" />, status: 'pending' },
    { id: 'limitations', title: 'Known Limitations', icon: <AlertTriangle className="w-4 h-4" />, status: 'pending' },
    { id: 'cost_optimizations', title: 'Cost Optimizations', icon: <DollarSign className="w-4 h-4" />, status: 'pending' },
  ]);

  const handlePreview = async (description: string, techPrefs: TechPreferences) => {
    setIsLoading(true);
    setPreview(null);
    setHasProcessed(false);
    
    setStreamingSections(sections => 
      sections.map(s => ({ ...s, status: 'pending' as const, data: undefined }))
    );

    try {
      const result = await previewBoilerplate({
        description,
        tech_preferences: techPrefs,
      });

      // Update sections with the result data
      setStreamingSections(sections => 
        sections.map(section => {
          let data: SectionData | undefined;
          
          if (section.id === 'file_structure') {
            data = result.file_structure;
          } else if (section.id === 'dependencies') {
            data = result.dependencies;
          } else if (section.id === 'focus_areas') {
            data = result.cursor_rules.focus_areas;
          } else if (section.id === 'limitations') {
            data = result.known_limitations;
          } else if (section.id === 'cost_optimizations') {
            data = result.cost_optimizations || [];
          }
          
          return { ...section, status: 'complete' as const, data };
        })
      );

      setPreview(result);
      setHasProcessed(true);
    } catch (err) {
      showError(err);
      console.error('Preview error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (description: string, techPrefs: TechPreferences) => {
    setIsLoading(true);

    try {
      // If we have a preview with session_id, use it to download the cached boilerplate
      // Otherwise, generate a fresh one
      const blob = preview?.session_id
        ? await generateBoilerplate({ description, tech_preferences: techPrefs }, preview.session_id)
        : await generateBoilerplate({ description, tech_preferences: techPrefs });

      const filename = `${preview?.project_metadata.name || 'boilerplate'}.zip`;
      downloadZip(blob, filename);
    } catch (err) {
      showError(err);
      console.error('Generate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 w-full relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div id="main-content" className="relative w-full px-6 md:px-8 lg:px-16 xl:px-20 py-12 md:py-16">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10 md:mb-12"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-10 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-3">
            Generate Your Boilerplate
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl">
            Describe your project and get a production-ready codebase in seconds
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
                    v0.1.0-alpha
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
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <MinimalForm
              onPreview={handlePreview}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              hasProcessed={hasProcessed}
            />
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {preview && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <ProjectSummary preview={preview} />
              </motion.div>
            )}

            <StreamingPreview
              isGenerating={isLoading}
              sections={streamingSections}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
