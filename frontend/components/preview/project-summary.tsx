'use client';

import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { BoilerplateResponse } from '@/lib/api';

interface ProjectSummaryProps {
  preview: BoilerplateResponse | null;
}

export function ProjectSummary({ preview }: ProjectSummaryProps) {
  if (!preview) return null;
  
  const projectName = preview.project_metadata.name;
  const explanation = preview.project_metadata.explanation;
  const stackType = preview.project_metadata.stack_type;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-5"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-indigo-500/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-100 mb-1">
            AI Understanding
          </h3>
          <p className="text-sm text-zinc-400">
            Here&apos;s what the AI understood about your project
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-medium text-green-400">Analyzed</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Project Name */}
        <div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Project Name
          </div>
          <div className="px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg">
            <p className="text-sm font-medium text-zinc-200">{projectName}</p>
          </div>
        </div>

        {/* AI Explanation */}
        <div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Project Summary
          </div>
          <div className="px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg">
            <p className="text-sm text-zinc-300 leading-relaxed">{explanation}</p>
          </div>
        </div>

        {/* Stack Type Badge */}
        <div className="flex items-center gap-2 pt-2">
          <div className="text-xs font-medium text-zinc-500">Architecture:</div>
          <div className={`px-2.5 py-1 rounded-md text-xs font-medium ${
            stackType === 'google_mode' 
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
          }`}>
            {stackType === 'google_mode' ? 'Google Cloud Optimized' : 'Cloud Agnostic'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
