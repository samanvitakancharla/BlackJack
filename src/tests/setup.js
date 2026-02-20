import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/dom'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
