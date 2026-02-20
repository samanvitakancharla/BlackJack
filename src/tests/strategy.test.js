import { describe, it, expect } from 'vitest'

// Import strategy functions
import { getOptimalMove, STRATEGY } from '../main.js'

describe('Strategy Functions', () => {
  describe('getOptimalMove', () => {
    it('should return correct move for hard totals', () => {
      const hand = [{ rank: '8', suit: '♥', value: 8 }, { rank: '7', suit: '♦', value: 7 }]
      const dealerCard = { rank: '6', suit: '♣', value: 6 }
      
      const move = getOptimalMove(hand, dealerCard)
      expect(['H', 'S', 'D', 'P']).toContain(move)
    })

    it('should handle soft hands correctly', () => {
      const hand = [{ rank: 'A', suit: '♥', value: 11 }, { rank: '6', suit: '♦', value: 6 }]
      const dealerCard = { rank: '5', suit: '♣', value: 5 }
      
      const move = getOptimalMove(hand, dealerCard)
      expect(['H', 'S', 'D', 'P']).toContain(move)
    })

    it('should handle pairs correctly', () => {
      const hand = [{ rank: '8', suit: '♥', value: 8 }, { rank: '8', suit: '♦', value: 8 }]
      const dealerCard = { rank: '7', suit: '♣', value: 7 }
      
      const move = getOptimalMove(hand, dealerCard)
      expect(['H', 'S', 'D', 'P']).toContain(move)
    })

    it('should return stand for hard 17+', () => {
      const hand = [{ rank: 'K', suit: '♥', value: 10 }, { rank: '7', suit: '♦', value: 7 }]
      const dealerCard = { rank: '6', suit: '♣', value: 6 }
      
      const move = getOptimalMove(hand, dealerCard)
      expect(move).toBe('S')
    })

    it('should handle 10s correctly as pairs', () => {
      const hand = [{ rank: '10', suit: '♥', value: 10 }, { rank: 'J', suit: '♦', value: 10 }]
      const dealerCard = { rank: '6', suit: '♣', value: 6 }
      
      const move = getOptimalMove(hand, dealerCard)
      expect(move).toBe('S') // Always split 10s
    })
  })

  describe('STRATEGY constants', () => {
    it('should have all required strategy tables', () => {
      expect(STRATEGY).toHaveProperty('HARD')
      expect(STRATEGY).toHaveProperty('SOFT')
      expect(STRATEGY).toHaveProperty('PAIRS')
    })

    it('should have correct hard totals', () => {
      expect(STRATEGY.HARD).toHaveProperty('17')
      expect(STRATEGY.HARD).toHaveProperty('16')
      expect(STRATEGY.HARD).toHaveProperty('8')
    })

    it('should have correct soft hands', () => {
      expect(STRATEGY.SOFT).toHaveProperty('A9')
      expect(STRATEGY.SOFT).toHaveProperty('A8')
      expect(STRATEGY.SOFT).toHaveProperty('A2')
    })

    it('should have correct pairs', () => {
      expect(STRATEGY.PAIRS).toHaveProperty('AA')
      expect(STRATEGY.PAIRS).toHaveProperty('TT')
      expect(STRATEGY.PAIRS).toHaveProperty('22')
    })

    it('should have valid move strings', () => {
      const hard17 = STRATEGY.HARD['17']
      expect(hard17).toHaveLength(10) // One for each dealer upcard
      expect(hard17).toMatch(/^[HSDP]+$/) // Only contains valid moves
    })
  })
})
