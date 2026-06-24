export type IdempotencyRecord = {
  scope: string
  key: string
  userId: string
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
  findByScopeKeyAndUser(data: {
    scope: string
    key: string
    userId: string
  }): Promise<IdempotencyRecord | null>
  markProcessing(data: {
    scope: string
    key: string
    userId: string
    processingAt: Date
    staleProcessingAt: Date | null
  }): Promise<boolean>
  deleteByScopeKeyAndUser(data: { scope: string; key: string; userId: string }): Promise<void>
  saveResponse(data: {
    scope: string
    key: string
    userId: string
    statusCode: number
    responseBody: unknown
  }): Promise<void>
}
