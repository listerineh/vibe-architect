'use client';

import { motion } from 'framer-motion';
import { ArchitectureProposal } from '@/lib/api';
import { Check, Zap, AlertCircle, FileCode } from 'lucide-react';

interface ArchitectureSelectorProps {
  architectures: ArchitectureProposal[];
  recommended: string;
  onSelect: (architecture: string) => void;
  selectedArchitecture?: string;
}

export function ArchitectureSelector({
  architectures,
  recommended,
  onSelect,
  selectedArchitecture
}: ArchitectureSelectorProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'low': return <Zap className="w-4 h-4" />;
      case 'medium': return <FileCode className="w-4 h-4" />;
      case 'high': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-zinc-100 mb-2">
          Choose Your Architecture
        </h3>
        <p className="text-zinc-400">
          Select the architecture that best fits your project
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {architectures.map((arch, index) => {
          const isRecommended = arch.name === recommended;
          const isSelected = arch.name === selectedArchitecture;

          return (
            <motion.div
              key={arch.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelect(arch.name)}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-zinc-800/50 bg-zinc-900/30 hover:border-indigo-500/50 hover:bg-zinc-900/50'
                }
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-3 -right-3">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-zinc-100 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Recommended
                  </div>
                </div>
              )}

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-zinc-100" />
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-zinc-100">{arch.name}</h4>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getComplexityColor(arch.complexity)}`}>
                    {getComplexityIcon(arch.complexity)}
                    {arch.complexity.toUpperCase()}
                  </div>
                </div>
                <p className="text-sm text-zinc-400">{arch.reasoning}</p>
              </div>

              {/* Files Estimate */}
              <div className="mb-4 flex items-center gap-2 text-sm text-zinc-300">
                <FileCode className="w-4 h-4" />
                <span>~{arch.estimated_files} files</span>
              </div>

              {/* Pros */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-green-400 mb-2">✓ Pros</p>
                <ul className="space-y-1">
                  {arch.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="text-xs text-zinc-300 flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <p className="text-xs font-semibold text-red-400 mb-2">✗ Cons</p>
                <ul className="space-y-1">
                  {arch.cons.slice(0, 2).map((con, i) => (
                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Example Structure Preview */}
              {arch.example_structure.length > 0 && (
                <details 
                  className="mt-4 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300">
                    View example structure
                  </summary>
                  <div className="mt-2 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/30">
                    <pre className="text-zinc-400 text-xs overflow-x-auto">
                      {arch.example_structure.slice(0, 8).map((file, i) => (
                        <div key={i}>{file}</div>
                      ))}
                      {arch.example_structure.length > 8 && (
                        <div className="text-zinc-500">... and {arch.example_structure.length - 8} more</div>
                      )}
                    </pre>
                  </div>
                </details>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
