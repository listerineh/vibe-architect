import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

export interface Project {
  id: string;
  session_id: string;
  name: string;
  framework: string;
  architecture: string;
  file_count: number;
  zip_size: number;
  metadata: {
    description?: string;
    focus_areas: string[];
    known_limitations: string[];
    cost_optimizations: string[];
  };
  created_at: string;
  updated_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = async () => {
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await user.getIdToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${API_URL}/api/v1/projects/`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveProject = async (
    sessionId: string,
    projectName: string,
    framework: string,
    architecture: string
  ) => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/v1/projects/save`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          project_name: projectName,
          framework,
          architecture,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save project');
      }

      const data = await response.json();
      await fetchProjects(); // Refresh list
      return data.project_id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = async (projectId: string): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}/download`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Error getting download URL:', err);
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!user) throw new Error('Not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/api/v1/projects/${projectId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await fetchProjects(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // This is a valid use case - fetching data when user changes
    // eslint-disable-next-line
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    saveProject,
    getDownloadUrl,
    deleteProject,
  };
}
