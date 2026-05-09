'use client';

import { BoilerplateResponse } from '@/lib/api';
import { FileCode, Package, Target, AlertTriangle } from 'lucide-react';

interface PreviewPanelProps {
  data: BoilerplateResponse | null;
}

export function PreviewPanel({ data }: PreviewPanelProps) {
  if (!data) {
    return (
      <div className="w-full max-w-4xl p-8 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
        <p className="text-zinc-500">
          Preview will appear here after you click &quot;Preview&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2">
          {data.project_metadata.name}
        </h2>
        <div className="flex items-center gap-2 mb-4">
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            data.project_metadata.stack_type === 'google_mode'
              ? 'bg-blue-900 text-blue-200'
              : 'bg-purple-900 text-purple-200'
          }`}>
            {data.project_metadata.stack_type === 'google_mode' ? 'Google Cloud' : 'Cloud Agnostic'}
          </span>
        </div>
        <p className="text-zinc-400">{data.project_metadata.explanation}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileCode className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-zinc-100">File Structure</h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.file_structure.slice(0, 10).map((file, idx) => (
              <div key={idx} className="text-sm">
                <code className="text-green-400">{file.path}</code>
                <p className="text-xs text-zinc-500 mt-1">{file.description}</p>
              </div>
            ))}
            {data.file_structure.length > 10 && (
              <p className="text-xs text-zinc-500 italic">
                ... and {data.file_structure.length - 10} more files
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-zinc-100">Dependencies</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-zinc-400 mb-2">Production ({data.dependencies.main.length})</p>
              <div className="flex flex-wrap gap-1">
                {data.dependencies.main.slice(0, 6).map((dep, idx) => (
                  <span key={idx} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                    {dep.split('@')[0]}
                  </span>
                ))}
                {data.dependencies.main.length > 6 && (
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-500 text-xs rounded">
                    +{data.dependencies.main.length - 6}
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-400 mb-2">Development ({data.dependencies.dev.length})</p>
              <div className="flex flex-wrap gap-1">
                {data.dependencies.dev.slice(0, 6).map((dep, idx) => (
                  <span key={idx} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded">
                    {dep.split('@')[0]}
                  </span>
                ))}
                {data.dependencies.dev.length > 6 && (
                  <span className="px-2 py-1 bg-zinc-800 text-zinc-500 text-xs rounded">
                    +{data.dependencies.dev.length - 6}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-zinc-100">Focus Areas</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.cursor_rules.focus_areas.map((area, idx) => (
              <span key={idx} className="px-3 py-1 bg-yellow-900/30 text-yellow-300 text-sm rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-zinc-100">Known Limitations</h3>
          </div>
          <ul className="space-y-2 text-sm text-zinc-400">
            {data.known_limitations.map((limitation, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-orange-400">•</span>
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-lg md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-zinc-100">Cost Optimizations</h3>
          </div>
          {data.cost_optimizations && data.cost_optimizations.length > 0 ? (
            <ul className="space-y-2 text-sm text-zinc-300">
              {data.cost_optimizations.map((optimization, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-green-400">💰</span>
                  <span>{optimization}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 italic">
              No cost optimizations available. The AI will suggest ways to reduce costs in production.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
