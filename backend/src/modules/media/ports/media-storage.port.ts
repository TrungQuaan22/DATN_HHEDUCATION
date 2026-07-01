export type StoredObjectMetadata = {
  contentType?: string
  contentLength?: number
  etag?: string
}

export type StoredObject = {
  body: NodeJS.ReadableStream
}

export interface MediaStoragePort {
  createPresignedPutUrl(data: {
    objectKey: string
    contentType: string
  }): Promise<string>
  createPresignedGetUrl(data: {
    objectKey: string
    expiresInSeconds?: number
  }): Promise<string>
  headObject(objectKey: string): Promise<StoredObjectMetadata | null>
  deleteObject(objectKey: string): Promise<void>
  getObject(objectKey: string): Promise<StoredObject | null>
  putObject(data: {
    objectKey: string
    body: Buffer
    contentType: string
  }): Promise<void>
}
