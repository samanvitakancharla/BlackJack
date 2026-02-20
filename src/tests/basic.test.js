import { describe, it, expect } from 'vitest'

// Import constants to test they're properly exported
import { RANKS, SUITS, VALUES } from '../main.js'

describe('Basic Constants and Exports', () => {
  it('should export RANKS constant', () => {
    expect(RANKS).toEqual(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
  })

  it('should export SUITS constant', () => {
    expect(SUITS).toEqual(['♥', '♦', '♣', '♠'])
  })

  it('should export VALUES constant', () => {
    expect(VALUES).toEqual({ 
      'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10 
    })
  })

  it('should have correct card values', () => {
    expect(VALUES['A']).toBe(11)
    expect(VALUES['K']).toBe(10)
    expect(VALUES['5']).toBe(5)
  })
})
