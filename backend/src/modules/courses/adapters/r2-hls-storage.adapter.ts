import { GetObjectCommand } from '@aws-sdk/client-s3'

import { r2Client, r2Config } from '~/config/r2'

import type { HlsFileObject, HlsStoragePort } from '../ports/hls-storage.port'

export class R2HlsStorageAdapter implements HlsStoragePort {
  async getObject(objectKey: string): Promise<HlsFileObject | null> {
    const object = await r2Client.send(
      new GetObjectCommand({
        Bucket: r2Config.bucketName,
        Key: objectKey
      })
    )

    if (!object.Body) {
      return null
    }

    return {
      body: object.Body as NodeJS.ReadableStream,
      contentLength: object.ContentLength
    }
  }
}

export const hlsStorage = new R2HlsStorageAdapter()
