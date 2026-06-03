import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeText } from './search'

describe('normalizeText', () => {
  it('converts Vietnamese d with stroke to plain d', () => {
    assert.equal(normalizeText('điện'), 'dien')
  })
})
