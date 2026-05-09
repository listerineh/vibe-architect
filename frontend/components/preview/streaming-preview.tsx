'use client';

import { useState, useEffect, useRef } from 'react';
import { FileCode, CheckCircle2, Loader2 } from 'lucide-react';

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

interface StreamingPreviewProps {
  isGenerating: boolean;
  sections: StreamingSection[];
}

export function StreamingPreview({ isGenerating, sections }: StreamingPreviewProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const prevGeneratingRef = useRef(isGenerating);

  useEffect(() => {
    // Only reset logs when transitioning from not generating to generating
    if (isGenerating && !prevGeneratingRef.current) {
      setLogs([]);
    }
    prevGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const logMessages = [
      'Initializing Vertex AI...',
      'Analyzing project description...',
      'Determining optimal architecture...',
      'Generating file structure...',
      'Creating dependency graph...',
      'Optimizing for AI comprehension...',
      'Finalizing boilerplate...',
      'Waiting for Vertex AI...'
    ];

    let index = 0;
    let intervalId: NodeJS.Timeout | null = null;
    
    intervalId = setInterval(() => {
      if (index < logMessages.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logMessages[index]}`]);
        index++;
      } else {
        if (intervalId) clearInterval(intervalId);
      }
    }, 800);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGenerating]);

  return (
    <div className="w-full space-y-6">
      {/* AI Terminal */}
      {isGenerating && (
        <div className="bg-black/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-3 text-green-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-semibold">AI Terminal</span>
          </div>
          <div className="space-y-1 overflow-y-auto">
            {logs.filter(log => 
              log && 
              typeof log === 'string' && 
              log.trim() && 
              !log.includes('undefined')
            ).map((log, idx) => (
              <div key={idx} className="text-green-400/80">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streaming Sections */}
      <div className="space-y-4">
        {/* File Structure - Full Width */}
        {sections
          .filter(section => section.id === 'file_structure' && (section.status === 'generating' || section.status === 'complete'))
          .map((section) => (
            <StreamingCard key={section.id} section={section} />
          ))}
        
        {/* Other Sections - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections
            .filter(section => section.id !== 'file_structure' && (section.status === 'generating' || section.status === 'complete'))
            .map((section) => (
              <StreamingCard key={section.id} section={section} />
            ))}
        </div>
      </div>
    </div>
  );
}

function StreamingCard({ section }: { section: StreamingSection }) {
  const getStatusColor = () => {
    switch (section.status) {
      case 'pending':
        return 'border-zinc-800 bg-zinc-900/50';
      case 'generating':
        return 'border-blue-500/50 bg-blue-500/5 animate-pulse';
      case 'complete':
        return 'border-green-500/50 bg-green-500/5';
    }
  };

  const getStatusIcon = () => {
    switch (section.status) {
      case 'pending':
        return <div className="w-2 h-2 rounded-full bg-zinc-600" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className={`p-6 rounded-lg border transition-all duration-500 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-800 rounded-md">
            {section.icon}
          </div>
          <h3 className="text-lg font-semibold text-zinc-100">{section.title}</h3>
        </div>
        {getStatusIcon()}
      </div>

      {section.status === 'generating' && (
        <div className="space-y-2">
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-linear-to-r from-blue-500 to-purple-500 animate-pulse" style={{ width: '60%' }} />
          </div>
          <p className="text-xs text-zinc-500">Generating...</p>
        </div>
      )}

      {section.status === 'complete' && section.data && (
        <div className="space-y-2">
          {renderSectionData(section.id, section.data)}
        </div>
      )}

      {section.status === 'pending' && (
        <p className="text-sm text-zinc-600">Waiting...</p>
      )}
    </div>
  );
}

function renderSectionData(sectionId: string, data: SectionData) {
  console.log(`Rendering ${sectionId}:`, data);
  switch (sectionId) {
    case 'file_structure':
      if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'path' in data[0]) {
        const files = data as FileItem[];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-300">{files.length} files generated</p>
              <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                {files.filter(f => f.path.startsWith('src/')).length} in src/
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {files.map((file, idx) => (
                <div 
                  key={idx} 
                  className="group text-xs font-mono flex items-start gap-2 p-2 rounded hover:bg-zinc-800/50 transition-colors"
                >
                  <FileCode className="w-3 h-3 mt-0.5 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-400 truncate group-hover:text-zinc-300">{file.path}</p>
                    {file.description && (
                      <p className="text-zinc-600 text-[10px] mt-0.5 line-clamp-1">{file.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    
    case 'dependencies':
      if (!Array.isArray(data)) {
        const deps = data as DependenciesData;
        const mainDeps = deps.main || [];
        const devDeps = deps.dev || [];
        const totalDeps = mainDeps.length + devDeps.length;
        
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  <span className="text-xs text-zinc-400">{mainDeps.length} main</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  <span className="text-xs text-zinc-400">{devDeps.length} dev</span>
                </div>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded">
                {totalDeps} total
              </span>
            </div>
            
            {mainDeps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-purple-300">Production</p>
                <div className="flex flex-wrap gap-1.5">
                  {mainDeps.map((dep, idx) => {
                    const [name, version] = dep.split('@');
                    return (
                      <div 
                        key={idx} 
                        className="group relative text-xs bg-purple-500/10 text-purple-300 px-2.5 py-1.5 rounded-md border border-purple-500/20 font-mono hover:bg-purple-500/20 transition-colors"
                      >
                        <span className="font-medium">{name}</span>
                        {version && (
                          <span className="ml-1 text-purple-400/60">@{version}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {devDeps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-blue-300">Development</p>
                <div className="flex flex-wrap gap-1.5">
                  {devDeps.map((dep, idx) => {
                    const [name, version] = dep.split('@');
                    return (
                      <div 
                        key={idx} 
                        className="text-xs bg-blue-500/10 text-blue-300 px-2.5 py-1.5 rounded-md border border-blue-500/20 font-mono hover:bg-blue-500/20 transition-colors"
                      >
                        <span className="font-medium">{name}</span>
                        {version && (
                          <span className="ml-1 text-blue-400/60">@{version}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      }
      return null;
    
    case 'focus_areas':
      if (Array.isArray(data)) {
        const areas = data as string[];
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-300">{areas.length} focus areas</p>
            <div className="grid grid-cols-1 gap-2">
              {areas.map((area, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"></div>
                  <span className="text-xs text-green-300 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    
    case 'limitations':
      if (Array.isArray(data)) {
        const limitations = data as string[];
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-300">{limitations.length} known limitations</p>
            <div className="space-y-2">
              {limitations.map((limitation, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-500/5 border border-orange-500/20"
                >
                  <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5 shrink-0"></div>
                  <p className="text-xs text-orange-300 leading-relaxed">{limitation}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    
    case 'cost_optimizations':
      if (Array.isArray(data)) {
        const optimizations = data as string[];
        return (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-300">{optimizations.length} optimizations</p>
            <div className="space-y-2">
              {optimizations.map((opt, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/30 transition-colors"
                >
                  <span className="text-base shrink-0">💰</span>
                  <p className="text-xs text-green-300 leading-relaxed">{opt}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return null;
    
    default:
      return <p className="text-xs text-zinc-500">Data loaded</p>;
  }
}
