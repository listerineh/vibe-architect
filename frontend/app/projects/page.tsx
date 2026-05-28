'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/auth-context';
import { useProjects } from '@/hooks/use-projects';
import { Download, Trash2, FolderOpen, Calendar, FileCode, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog, AlertDialog } from '@/components/ui/dialog';

export default function ProjectsPage() {
  const { user } = useAuth();
  const { projects, loading, deleteProject, getDownloadUrl } = useProjects();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; projectId: string; projectName: string }>({ isOpen: false, projectId: '', projectName: '' });
  const [errorDialog, setErrorDialog] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const router = useRouter();

  const handleDownload = async (projectId: string, projectName: string) => {
    setDownloadingId(projectId);
    try {
      const url = await getDownloadUrl(projectId);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${projectName}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      setErrorDialog({ isOpen: true, message: 'Failed to download project. Please try again.' });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setDeleteDialog({ isOpen: true, projectId, projectName });
  };

  const handleDeleteConfirm = async () => {
    const { projectId } = deleteDialog;
    setDeletingId(projectId);
    try {
      await deleteProject(projectId);
    } catch (error) {
      console.error('Delete failed:', error);
      setErrorDialog({ isOpen: true, message: 'Failed to delete project. Please try again.' });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
            <p className="text-zinc-400">You need to be signed in to view your projects</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-zinc-950 to-purple-950/20 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">My Projects</h1>
          <p className="text-zinc-400">Manage your generated boilerplates</p>
        </motion.div>

        {/* Loading State */}
        {loading && projects.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
            <h2 className="text-2xl font-bold mb-2">No projects yet</h2>
            <p className="text-zinc-400 mb-6">Generate your first boilerplate to get started</p>
            <button
              onClick={() => router.push('/generator')}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all"
            >
              Create Project
            </button>
          </motion.div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all group cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                {/* Project Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h3>
                  {project.metadata?.description && (
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                      {project.metadata.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                      {project.framework}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                      {project.architecture}
                    </span>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="space-y-2 mb-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    <span>{project.file_count} files</span>
                    <span className="mx-1">•</span>
                    <span>{formatSize(project.zip_size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects/${project.id}`);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">View Details</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(project.id, project.name);
                    }}
                    disabled={downloadingId === project.id}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === project.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project.id, project.name);
                    }}
                    disabled={deletingId === project.id}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === project.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, projectId: '', projectName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete "${deleteDialog.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        type="warning"
      />

      {/* Error Dialog */}
      <AlertDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ isOpen: false, message: '' })}
        title="Error"
        description={errorDialog.message}
        type="error"
      />
    </div>
  );
}
