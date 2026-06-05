export type IdempotencyRecord = {
  scope: string
  key: string
  userId: string | null
  requestHash: string
  statusCode: number | null
  responseBody: unknown
  processingAt: Date | null
  expiresAt: Date
  createdAt: Date
}

export interface IdempotencyRepositoryPort {
  tryCreateProcessingKey(data: {
    scope: string
    key: string
    userId: string
    requestHash: string
    processingAt: Date
    expiresAt: Date
  }): Promise<boolean>
  findByScopeAndKey(data: { scope: string; key: string }): Promise<IdempotencyRecord | null>
  markProcessing(data: { scope: string; key: string; processingAt: Date }): Promise<void>
  deleteByScopeAndKey(data: { scope: string; key: string }): Promise<void>
  saveResponse(data: {
    scope: string
    key: string
    statusCode: number
    responseBody: unknown
  }): Promise<void>
}
