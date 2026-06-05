export type IdempotencyRunInput = {
  scope: string
  key: string
  userId: string
  requestHash: string
}

export interface IdempotencyPort {
  run<T>(
    input: IdempotencyRunInput,
    handler: () => Promise<{ statusCode: number; body: T }>
  ): Promise<{ statusCode: number; body: T }>
}
