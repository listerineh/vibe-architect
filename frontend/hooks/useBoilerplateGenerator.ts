import { useState, useCallback } from 'react';
import { apiService, APIError } from '@/services/api.service';
import type { 
  TechPreferences, 
  BoilerplateResponse,
  ProjectRequest 
} from '@/types/api';
import type { StreamingSection } from '@/types/ui';
import { STREAMING_SECTIONS } from '@/lib/constants';

interface UseBoilerplateGeneratorReturn {
  preview: BoilerplateResponse | null;
  isLoading: boolean;
  error: string | null;
  hasProcessed: boolean;
  streamingSections: StreamingSection[];
  handlePreview: (description: string, techPrefs: TechPreferences) => Promise<void>;
  handleGenerate: (description: string, techPrefs: TechPreferences) => Promise<void>;
  resetState: () => void;
}

export function useBoilerplateGenerator(): UseBoilerplateGeneratorReturn {
  const [preview, setPreview] = useState<BoilerplateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [streamingSections, setStreamingSections] = useState<StreamingSection[]>(
    STREAMING_SECTIONS.map(section => section)
  );

  const resetState = useCallback(() => {
    setPreview(null);
    setError(null);
    setHasProcessed(false);
    setStreamingSections(sections =>
      sections.map(s => ({ ...s, status: 'pending' as const, data: undefined }))
    );
  }, []);

  const handlePreview = useCallback(
    async (description: string, techPrefs: TechPreferences) => {
      setIsLoading(true);
      setError(null);
      resetState();

      try {
        const request: ProjectRequest = {
          description,
          tech_preferences: techPrefs,
        };

        const result = await apiService.previewBoilerplate(request);

        // Update sections with result data
        setStreamingSections(sections =>
          sections.map(section => {
            let data;

            switch (section.id) {
              case 'file_structure':
                data = result.file_structure;
                break;
              case 'dependencies':
                data = result.dependencies;
                break;
              case 'focus_areas':
                data = result.cursor_rules.focus_areas;
                break;
              case 'limitations':
                data = result.known_limitations;
                break;
              case 'cost_optimizations':
                data = result.cost_optimizations || [];
                break;
            }

            return { ...section, status: 'complete' as const, data };
          })
        );

        setPreview(result);
        setHasProcessed(true);
      } catch (err) {
        const errorMessage =
          err instanceof APIError
            ? err.message
            : 'Failed to preview boilerplate';
        setError(errorMessage);
        console.error('Preview error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [resetState]
  );

  const handleGenerate = useCallback(
    async (description: string, techPrefs: TechPreferences) => {
      setIsLoading(true);
      setError(null);

      try {
        const request: ProjectRequest = {
          description,
          tech_preferences: techPrefs,
        };

        const blob = await apiService.generateBoilerplate(request, preview?.session_id);

        // Download the ZIP file
        const filename = `${preview?.project_metadata.name || 'boilerplate'}.zip`;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        const errorMessage =
          err instanceof APIError
            ? err.message
            : 'Failed to generate boilerplate';
        setError(errorMessage);
        console.error('Generate error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [preview]
  );

  return {
    preview,
    isLoading,
    error,
    hasProcessed,
    streamingSections,
    handlePreview,
    handleGenerate,
    resetState,
  };
}
