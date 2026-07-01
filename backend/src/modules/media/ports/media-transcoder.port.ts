export interface MediaTranscoderPort {
  startHlsTranscoding(mediaId: string): Promise<void>
}
