import type { Annotation, ApiResponse, FileListResponse, SaveRequest, SyncRequest } from '../../shared/types/annotation.js';

const API_BASE = '/api';

class ApiService {
  private async fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getFiles(): Promise<FileListResponse> {
    const response = await this.fetchJson<ApiResponse<FileListResponse>>(`${API_BASE}/files`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch files');
    }
    return response.data;
  }

  async saveAnnotations(filename: string, data: Annotation[]): Promise<void> {
    const request: SaveRequest = { filename, data };
    const response = await this.fetchJson<ApiResponse<{ path: string }>>(`${API_BASE}/save-json`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save annotations');
    }
  }

  async loadAnnotations(filename: string): Promise<any[]> {
    console.log(`📁 Loading annotations for: ${filename}`);
    const response = await this.fetchJson<ApiResponse<any[]>>(`${API_BASE}/annotations/${filename}`);
    if (!response.success || !response.data) {
      console.error(`❌ Failed to load annotations for ${filename}:`, response.error);
      throw new Error(response.error || 'Failed to load annotations');
    }
    console.log(`✅ Successfully loaded ${response.data.length} annotations for ${filename}`);
    console.log(`First annotation sample:`, response.data[0]);
    return response.data;
  }

  async syncFile(filename: string): Promise<void> {
    const request: SyncRequest = { filename };
    const response = await this.fetchJson<ApiResponse<{ s3Key: string }>>(`${API_BASE}/sync`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to sync file to S3');
    }
  }

  async getFileInfo(filename: string, type: 'pdf' | 'json') {
    const response = await this.fetchJson<ApiResponse<any>>(`${API_BASE}/file-info/${type}/${filename}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get file info');
    }
    return response.data;
  }
}

export const apiService = new ApiService();
