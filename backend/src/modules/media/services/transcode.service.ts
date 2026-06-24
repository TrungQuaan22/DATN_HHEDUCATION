import { spawn } from 'child_process'
import { createWriteStream } from 'fs'
import { promises as fs } from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffprobeInstaller from '@ffprobe-installer/ffprobe'
import type { MediaRepositoryPort } from '../ports/media-repository.port'
import type { MediaStoragePort } from '../ports/media-storage.port'
import type { MediaTranscoderPort } from '../ports/media-transcoder.port'

const ffmpegPath = ffmpegInstaller.path
const ffprobePath = ffprobeInstaller.path

const HLS_PLAYLIST_CONTENT_TYPE = 'application/vnd.apple.mpegurl'
const HLS_SEGMENT_CONTENT_TYPE = 'video/MP2T'

const getVideoDuration = (filePath: string): Promise<number | null> => {
  return new Promise((resolve) => {
    const ffprobe = spawn(ffprobePath, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath
    ])

    let output = ''

    ffprobe.stdout.on('data', (data) => {
      output += data.toString()
    })

    ffprobe.on('close', (code) => {
      if (code !== 0) {
        resolve(null)
        return
      }

      const duration = Math.round(Number.parseFloat(output.trim()))
      resolve(Number.isFinite(duration) ? duration : null)
    })

    ffprobe.on('error', () => {
      resolve(null)
    })
  })
}

const runFfmpegHls = (inputFile: string, hlsDir: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      ffmpegPath,
      [
        '-i',
        inputFile,
        '-codec:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-profile:v',
        'main',
        '-preset',
        'veryfast',
        '-codec:a',
        'aac',
        '-b:a',
        '128k',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        'segment_%03d.ts',
        'index.m3u8'
      ],
      {
        cwd: hlsDir
      }
    )

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`FFmpeg exited with code ${code}`))
    })

    ffmpeg.on('error', reject)
  })
}

const prepareTranscodeWorkspace = async (
  mediaId: string,
  mediaObjectKey: string
): Promise<{ jobDir: string; hlsDir: string; tempInputFile: string }> => {
  const tempRoot = path.join(process.cwd(), 'temp')
  const jobDir = path.join(tempRoot, `transcode_${mediaId}`)
  const hlsDir = path.join(jobDir, 'hls')
  const sourceExtension = path.extname(mediaObjectKey) || '.mp4'
  const tempInputFile = path.join(jobDir, `source${sourceExtension}`)

  await fs.mkdir(hlsDir, { recursive: true })

  return { jobDir, hlsDir, tempInputFile }
}

const downloadSourceVideo = async (
  storage: MediaStoragePort,
  mediaObjectKey: string,
  tempInputFile: string
): Promise<void> => {
  const sourceObject = await storage.getObject(mediaObjectKey)

  if (!sourceObject) {
    throw new Error('Uploaded video object is empty')
  }

  await pipeline(sourceObject.body, createWriteStream(tempInputFile))
}

const uploadHlsFiles = async (
  storage: MediaStoragePort,
  hlsDir: string,
  targetFolder: string
): Promise<void> => {
  const files = await fs.readdir(hlsDir)

  for (const fileName of files) {
    const filePath = path.join(hlsDir, fileName)
    const fileContent = await fs.readFile(filePath)
    const contentType = fileName.endsWith('.m3u8')
      ? HLS_PLAYLIST_CONTENT_TYPE
      : HLS_SEGMENT_CONTENT_TYPE

    await storage.putObject({
      objectKey: `${targetFolder}/${fileName}`,
      body: fileContent,
      contentType
    })
  }
}

export class TranscodeService implements MediaTranscoderPort {
  constructor(
    private readonly repository: MediaRepositoryPort,
    private readonly storage: MediaStoragePort
  ) {}

  async startHlsTranscoding(mediaId: string): Promise<void> {
    const media = await this.repository.findMediaById(mediaId)

    if (!media || media.type !== 'video' || media.status === 'deleted') {
      return
    }

    const locked = await this.repository.lockMediaForTranscoding(mediaId)
    if (!locked) {
      return
    }

    const { jobDir, hlsDir, tempInputFile } = await prepareTranscodeWorkspace(
      mediaId,
      media.objectKey
    )

    try {
      await downloadSourceVideo(this.storage, media.objectKey, tempInputFile)

      const durationSec = await getVideoDuration(tempInputFile)

      await runFfmpegHls(tempInputFile, hlsDir)

      const targetFolder = `uploads/videos/hls/${mediaId}`
      await uploadHlsFiles(this.storage, hlsDir, targetFolder)

      const playlistObjectKey = `${targetFolder}/index.m3u8`
      await this.repository.markMediaReady({
        mediaId,
        playlistObjectKey,
        durationSec
      })
    } catch (error) {
      console.error(`[Transcode HLS Failed] MediaId ${mediaId}:`, error)
      await this.repository.markMediaFailed(mediaId)
    } finally {
      await fs.rm(jobDir, { recursive: true, force: true }).catch((error) => {
        console.error(`[Transcode Cleanup Failed] MediaId ${mediaId}:`, error)
      })
    }
  }
}
