import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Import the functions we want to test
import { 
  drawCard, getHandTotal, renderCard, RANKS, SUITS, VALUES 
} from '../main.js'

// Set up global variables for testing
global.runningCount = 0

describe('Card Functions', () => {
  let dom

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
    global.document = dom.window.document
    global.window = dom.window
    global.runningCount = 0 // Reset count for each test
  })

  describe('drawCard', () => {
    it('should return a card with valid rank and suit', () => {
      const card = drawCard()
      
      expect(card).toHaveProperty('rank')
      expect(card).toHaveProperty('suit')
      expect(card).toHaveProperty('value')
      
      expect(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']).toContain(card.rank)
      expect(['♥', '♦', '♣', '♠']).toContain(card.suit)
    })

    it('should increment running count for 5s', () => {
      const initialCount = global.runningCount || 0
      drawCard() // Draw multiple cards to get a 5
      const card = drawCard()
      if (card.rank === '5') {
        expect(global.runningCount).toBe(initialCount + 1)
      }
    })

    it('should decrement running count for Aces', () => {
      const initialCount = global.runningCount || 0
      const card = drawCard()
      if (card.rank === 'A') {
        expect(global.runningCount).toBe(initialCount - 1)
      }
    })
  })

  describe('getHandTotal', () => {
    it('should calculate simple hand total', () => {
      const hand = [
        { rank: '7', suit: '♥', value: 7 },
        { rank: 'K', suit: '♦', value: 10 }
      ]
      expect(getHandTotal(hand)).toBe(17)
    })

    it('should handle soft aces correctly', () => {
      const hand = [
        { rank: 'A', suit: '♥', value: 11 },
        { rank: '6', suit: '♦', value: 6 }
      ]
      expect(getHandTotal(hand)).toBe(17) // Soft 17
    })

    it('should handle bust with multiple aces', () => {
      const hand = [
        { rank: 'A', suit: '♥', value: 11 },
        { rank: 'A', suit: '♦', value: 11 },
        { rank: '9', suit: '♣', value: 9 }
      ]
      expect(getHandTotal(hand)).toBe(21) // 11 + 11 + 9 = 31, then -10 for one ace = 21
    })
  })

  describe('renderCard', () => {
    it('should render card HTML with correct structure', () => {
      const card = { rank: 'K', suit: '♥', value: 10 }
      const html = renderCard(card)
      
      expect(html).toContain('class="card red"')
      expect(html).toContain('K')
      expect(html).toContain('♥')
    })

    it('should render 10 as T', () => {
      const card = { rank: '10', suit: '♠', value: 10 }
      const html = renderCard(card)
      
      expect(html).toContain('T')
      expect(html).not.toContain('10')
    })

    it('should not add red class for black suits', () => {
      const card = { rank: 'K', suit: '♠', value: 10 }
      const html = renderCard(card)
      
      expect(html).not.toContain('red')
    })
  })
})
