export type HlsFileObject = {
  body: NodeJS.ReadableStream
  contentLength?: number
}

export interface HlsStoragePort {
  getObject(objectKey: string): Promise<HlsFileObject | null>
}
