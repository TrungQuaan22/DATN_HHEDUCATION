export interface CreatePresignedUploadRequest {
  resourceType: 'image' | 'video' | 'document';
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface CreatePresignedUploadResponse {
  mediaId: string;
  uploadUrl: string;
  objectKey: string;
  method: 'PUT';
}

export interface CompleteUploadRequest {
  mediaId: string;
}

export interface CompleteUploadResponse {
  mediaId: string;
  objectKey: string;
  status: 'pending_upload' | 'uploaded' | 'processing' | 'ready' | 'failed' | 'deleted';
  contentType: string | null;
  fileSize: number | null;
  etag: string | null;
  publicUrl: string | null;
}

