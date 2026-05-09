import { API_CONFIG, MESSAGES } from '@/lib/constants';
import type {
  ProjectRequest,
  BoilerplateResponse,
  RefineDescriptionResponse,
} from '@/types/api';

class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type: 'network' | 'server' | 'validation' = 'server'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.detail || MESSAGES.ERRORS.SERVER,
          response.status,
          response.status >= 500 ? 'server' : 'validation'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      
      // Network error
      throw new APIError(
        MESSAGES.ERRORS.NETWORK,
        undefined,
        'network'
      );
    }
  }

  async previewBoilerplate(
    request: ProjectRequest
  ): Promise<BoilerplateResponse> {
    return this.request<BoilerplateResponse>(API_CONFIG.ENDPOINTS.PREVIEW, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateBoilerplate(
    request: ProjectRequest,
    sessionId?: string
  ): Promise<Blob> {
    const body = sessionId ? { session_id: sessionId } : request;
    const url = `${this.baseURL}${API_CONFIG.ENDPOINTS.GENERATE}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new APIError(
          error.detail || MESSAGES.ERRORS.GENERATE_FAILED,
          response.status
        );
      }

      return response.blob();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(MESSAGES.ERRORS.NETWORK, undefined, 'network');
    }
  }

  async refineDescription(
    request: ProjectRequest
  ): Promise<RefineDescriptionResponse> {
    return this.request<RefineDescriptionResponse>(
      API_CONFIG.ENDPOINTS.REFINE,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}

export const apiService = new APIService();
export { APIError };
