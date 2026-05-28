'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/auth-context';
import { Download, Calendar, FileCode, Loader2, ArrowLeft, Folder, Code2 } from 'lucide-react';
import { FileTree } from '@/components/ui/file-tree';

interface ProjectDetails {
  id: string;
  name: string;
  framework: string;
  architecture: string;
  file_count: number;
  zip_size: number;
  metadata: {
    description?: string;
    tree?: string[];
    project_size?: string;
    complexity_score?: number;
    tech_stack?: {
      framework?: string;
      language?: string;
      css?: string;
      backend_service?: string;
    };
    focus_areas?: string[];
    known_limitations?: string[];
    cost_optimizations?: string[];
  };
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const projectId = params.id as string;

  const fetchProject = useCallback(async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    void fetchProject();
  }, [user, router, fetchProject]);

  const handleDownload = async () => {
    if (!user || !project) return;

    setDownloading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error downloading project:', err);
      alert('Failed to download project');
    } finally {
      setDownloading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-zinc-400 mb-6">{error || 'This project does not exist or you do not have access to it.'}</p>
            <button
              onClick={() => router.push('/projects')}
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          {project.metadata?.description && (
            <p className="text-zinc-400 text-lg">{project.metadata.description}</p>
          )}
          
          <div className="flex items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm">
                {project.framework}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                {project.architecture}
              </span>
              {project.metadata?.project_size && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {project.metadata.project_size}
                </span>
              )}
            </div>
            
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-medium text-zinc-400">Files</h3>
            </div>
            <p className="text-2xl font-bold">{project.file_count}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Folder className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-medium text-zinc-400">Size</h3>
            </div>
            <p className="text-2xl font-bold">{formatSize(project.zip_size)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-medium text-zinc-400">Created</h3>
            </div>
            <p className="text-sm font-medium">{formatDate(project.created_at)}</p>
          </motion.div>
        </div>

        {/* File Structure */}
        {project.metadata?.tree && project.metadata.tree.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <FileCode className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">File Structure</h2>
            </div>
            <FileTree files={project.metadata.tree} />
          </motion.div>
        )}

        {/* Tech Stack */}
        {project.metadata?.tech_stack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <Code2 className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold">Tech Stack</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {project.metadata.tech_stack.framework && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Framework</p>
                  <p className="text-sm font-medium">{project.metadata.tech_stack.framework}</p>
                </div>
              )}
              {project.metadata.tech_stack.language && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Language</p>
                  <p className="text-sm font-medium">{project.metadata.tech_stack.language}</p>
                </div>
              )}
              {project.metadata.tech_stack.css && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">CSS</p>
                  <p className="text-sm font-medium">{project.metadata.tech_stack.css}</p>
                </div>
              )}
              {project.metadata.tech_stack.backend_service && project.metadata.tech_stack.backend_service !== 'none' && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Backend</p>
                  <p className="text-sm font-medium">{project.metadata.tech_stack.backend_service}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Focus Areas */}
        {project.metadata?.focus_areas && project.metadata.focus_areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Focus Areas</h2>
            <div className="flex flex-wrap gap-2">
              {project.metadata.focus_areas.map((area, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Known Limitations */}
        {project.metadata?.known_limitations && project.metadata.known_limitations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Known Limitations</h2>
            <ul className="space-y-2">
              {project.metadata.known_limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-yellow-500 mt-1">•</span>
                  <span>{limitation}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Cost Optimizations */}
        {project.metadata?.cost_optimizations && project.metadata.cost_optimizations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">Cost Optimizations</h2>
            <ul className="space-y-2">
              {project.metadata.cost_optimizations.map((optimization, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-zinc-400">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{optimization}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
