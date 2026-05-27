'use client';

import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface GenerationProgressProps {
  progress: number;
  message: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  currentStep?: string;
}

export function GenerationProgress({
  progress,
  message,
  status,
  currentStep
}: GenerationProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />;
      case 'success':
        return <Check className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'from-indigo-500 to-purple-500';
      case 'success': return 'from-green-500 to-emerald-500';
      case 'error': return 'from-red-500 to-orange-500';
      default: return 'from-zinc-500 to-zinc-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="text-zinc-100 font-semibold">{message}</p>
            {currentStep && (
              <p className="text-xs text-zinc-400 mt-1">{currentStep}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-zinc-100">{progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-zinc-800/30 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getStatusColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        
        {/* Shimmer effect */}
        {status === 'loading' && progress < 100 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}
      </div>

      {/* Steps indicator */}
      {status === 'loading' && (
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
          <span className={progress >= 10 ? 'text-indigo-400' : ''}>Analyzing</span>
          <span className={progress >= 30 ? 'text-indigo-400' : ''}>Architecture</span>
          <span className={progress >= 60 ? 'text-indigo-400' : ''}>Templates</span>
          <span className={progress >= 80 ? 'text-indigo-400' : ''}>Generating</span>
          <span className={progress >= 95 ? 'text-indigo-400' : ''}>Finalizing</span>
        </div>
      )}
    </motion.div>
  );
}
