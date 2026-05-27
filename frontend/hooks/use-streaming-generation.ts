import { useState, useCallback, useRef } from 'react';
import { ArchitectureAnalysis, ProjectRequest } from '@/lib/api';

interface StreamEvent {
  event: string;
  progress: number;
  message: string;
  data?: Record<string, unknown>;
}

interface ProjectMetadata {
  focus_areas: string[];
  known_limitations: string[];
  cost_optimizations: string[];
  file_count: number;
  files: string[];
}

interface UseStreamingGenerationReturn {
  progress: number;
  message: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  architectures: ArchitectureAnalysis | null;
  sessionId: string | null;
  metadata: ProjectMetadata | null;
  startGeneration: (request: ProjectRequest) => void;
  cancelGeneration: () => void;
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [architectures, setArchitectures] = useState<ArchitectureAnalysis | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  const cancelGeneration = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setMessage('');
  }, []);

  const startGeneration = useCallback((request: ProjectRequest) => {
    // Reset state
    setProgress(0);
    setMessage('Iniciando...');
    setStatus('loading');
    setArchitectures(null);
    setSessionId(null);

    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Note: EventSource doesn't support POST directly
    // We need to use fetch with streaming or a different approach
    // For now, we'll use fetch with ReadableStream
    
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    fetch(`${API_BASE_URL}/api/generate-streaming`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to start generation');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('No response body');
        }

        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  try {
                    const event: StreamEvent = JSON.parse(data);
                    
                    // Update progress and message
                    setProgress(event.progress);
                    setMessage(event.message);

                    // Handle specific events
                    switch (event.event) {
                      case 'architectures_proposed':
                        if (event.data) {
                          setArchitectures(event.data as unknown as ArchitectureAnalysis);
                        }
                        break;
                      
                      case 'complete':
                        setStatus('success');
                        if (event.data && typeof event.data === 'object' && 'session_id' in event.data) {
                          setSessionId(event.data.session_id as string);
                        }
                        if (event.data && typeof event.data === 'object') {
                          const data = event.data as Record<string, unknown>;
                          const cursorRules = data.cursor_rules as { focus_areas?: string[] } | undefined;
                          const fileStructure = data.file_structure as Array<{ path: string }> | undefined;
                          
                          setMetadata({
                            focus_areas: cursorRules?.focus_areas || [],
                            known_limitations: (data.known_limitations as string[]) || [],
                            cost_optimizations: (data.cost_optimizations as string[]) || [],
                            file_count: fileStructure?.length || 0,
                            files: fileStructure?.map(f => f.path) || []
                          });
                        }
                        break;
                      
                      case 'error':
                        setStatus('error');
                        setMessage(event.message || 'Generation error');
                        break;
                    }
                  } catch (e) {
                    console.error('Failed to parse SSE data:', e);
                  }
                }
              }
            }
          } catch (error) {
            console.error('Stream reading error:', error);
            setStatus('error');
            setMessage('Error reading stream');
          }
        };

        readStream();
      })
      .catch(error => {
        console.error('Generation error:', error);
        setStatus('error');
        setMessage(error.message || 'Error generating boilerplate');
      });
  }, []);

  return {
    progress,
    message,
    status,
    architectures,
    sessionId,
    metadata,
    startGeneration,
    cancelGeneration
  };
}
