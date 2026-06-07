import { api } from '@/lib/api/axios';
import axios from 'axios';
import {
  CreatePresignedUploadRequest,
  CreatePresignedUploadResponse,
  CompleteUploadRequest,
  CompleteUploadResponse
} from './types';

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export const createPresignedUpload = async (
  data: CreatePresignedUploadRequest
): Promise<CreatePresignedUploadResponse> => {
  const response = await api.post<ApiEnvelope<CreatePresignedUploadResponse>>('/uploads/presign', data);
  return response.data.data;
};

export const completeUpload = async (
  data: CompleteUploadRequest
): Promise<CompleteUploadResponse> => {
  const response = await api.post<ApiEnvelope<CompleteUploadResponse>>('/uploads/complete', data);
  return response.data.data;
};

export const uploadFileDirectly = async (
  uploadUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  // Safe Content-Type fallback matching the presign request values
  const isVideo = file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov');
  const contentType = file.type || (isVideo ? 'video/mp4' : 'image/jpeg');

  // Use a clean axios instance to avoid sending our app's JWT token to R2/S3 (causes CORS issues/security leaks)
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': contentType,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });
};
