import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { r2Client, r2Config } from '~/config/r2'

import type { MediaStoragePort, StoredObject, StoredObjectMetadata } from '../ports/media-storage.port'

export class R2MediaStorageAdapter implements MediaStoragePort {
  async createPresignedPutUrl(data: {
    objectKey: string
    contentType: string
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: r2Config.bucketName,
      Key: data.objectKey,
      ContentType: data.contentType
    })

    return getSignedUrl(r2Client, command, {
      expiresIn: r2Config.presignedUrlExpiresInSeconds
    })
  }

  async createPresignedGetUrl(data: {
    objectKey: string
    expiresInSeconds?: number
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: r2Config.bucketName,
      Key: data.objectKey
    })

    return getSignedUrl(r2Client, command, {
      expiresIn: data.expiresInSeconds ?? r2Config.presignedUrlExpiresInSeconds
    })
  }

  async headObject(objectKey: string): Promise<StoredObjectMetadata | null> {
    try {
      const metadata = await r2Client.send(
        new HeadObjectCommand({
          Bucket: r2Config.bucketName,
          Key: objectKey
        })
      )

      return {
        contentType: metadata.ContentType,
        contentLength: metadata.ContentLength,
        etag: metadata.ETag
      }
    } catch {
      return null
    }
  }

  async deleteObject(objectKey: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: r2Config.bucketName,
        Key: objectKey
      })
    )
  }

  async getObject(objectKey: string): Promise<StoredObject | null> {
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
      body: object.Body as NodeJS.ReadableStream
    }
  }

  async putObject(data: {
    objectKey: string
    body: Buffer
    contentType: string
  }): Promise<void> {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: r2Config.bucketName,
        Key: data.objectKey,
        Body: data.body,
        ContentType: data.contentType
      })
    )
  }
}

export const mediaStorage = new R2MediaStorageAdapter()
