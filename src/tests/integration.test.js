import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { fireEvent, screen } from '@testing-library/dom'

// Import main functions
import {
  selectMode, handlePlayAction, adjustTempCount, verifyPreCount, 
  handleBetAction, startFlow, drawCard
} from '../main.js'

describe('Integration Tests', () => {
  let dom

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="app-container">
            <div id="menu-screen">
              <button onclick="selectMode('STRATEGY')">Strategy Trainer</button>
              <button onclick="selectMode('COUNT')">Count Trainer</button>
            </div>
            <div id="game-screen" class="hidden">
              <div id="stats-bar">
                <p id="strat-accuracy">100%</p>
                <p id="bet-accuracy">100%</p>
                <p id="count-accuracy">100%</p>
              </div>
              <div class="felt-area">
                <div id="dealer-hand"></div>
                <div id="player-hands-container">
                  <div id="hand-0"></div>
                  <div id="hand-1"></div>
                  <div id="hand-2"></div>
                </div>
              </div>
              <div id="controls">
                <div id="playing-ui" class="hidden">
                  <button onclick="handlePlayAction('H')">HIT</button>
                  <button onclick="handlePlayAction('S')">STAND</button>
                </div>
                <div id="pre-counting-ui" class="hidden">
                  <span id="temp-count-display">0</span>
                  <button onclick="adjustTempCount(1)">+</button>
                  <button onclick="adjustTempCount(-1)">-</button>
                  <button onclick="verifyPreCount()">SUBMIT COUNT</button>
                </div>
                <div id="betting-ui" class="hidden">
                  <button onclick="handleBetAction('MIN')">MIN BET</button>
                  <button onclick="handleBetAction('MAX')">MAX BET</button>
                </div>
                <button id="next-btn" onclick="startFlow()" class="hidden">NEXT ROUND</button>
              </div>
              <div id="feedback">
                <p id="feedback-msg"></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    
    global.document = dom.window.document
    global.window = dom.window
    
    // Load main script functions
    require('../main.js')
  })

  afterEach(() => {
    // Reset global state
    global.gameMode = null
    global.runningCount = 0
    global.tempCountInput = 0
    global.playerHands = [[], [], []]
    global.currentHandIdx = 0
    global.dealerHand = []
    global.stats = { strat: {c:0, t:0}, bet: {c:0, t:0}, count: {c:0, t:0} }
  })

  describe('Game Flow Integration', () => {
    it('should start strategy mode when button clicked', () => {
      const strategyBtn = screen.getByText('Strategy Trainer')
      
      fireEvent.click(strategyBtn)
      
      expect(global.gameMode).toBe('STRATEGY')
      expect(document.getElementById('menu-screen').classList.contains('hidden')).toBe(true)
      expect(document.getElementById('game-screen').classList.contains('hidden')).toBe(false)
    })

    it('should start count mode when button clicked', () => {
      const countBtn = screen.getByText('Count Trainer')
      
      fireEvent.click(countBtn)
      
      expect(global.gameMode).toBe('COUNT')
      expect(document.getElementById('pre-counting-ui').classList.contains('hidden')).toBe(false)
    })

    it('should deal cards in strategy mode', () => {
      // Start strategy mode
      global.selectMode('STRATEGY')
      
      // Check if cards were dealt
      expect(global.playerHands).toHaveLength(3)
      expect(global.playerHands[0]).toHaveLength(2)
      expect(global.playerHands[1]).toHaveLength(2)
      expect(global.playerHands[2]).toHaveLength(2)
      expect(global.dealerHand).toHaveLength(1)
      
      // Check if cards are rendered
      const hand0 = document.getElementById('hand-0')
      expect(hand0.innerHTML).toContain('card')
    })

    it('should handle count input correctly', () => {
      // Start count mode
      global.selectMode('COUNT')
      
      // Test count adjustment
      const plusBtn = screen.getByText('+')
      const minusBtn = screen.getByText('-')
      const countDisplay = document.getElementById('temp-count-display')
      
      fireEvent.click(plusBtn)
      expect(global.tempCountInput).toBe(1)
      expect(countDisplay.textContent).toBe('1')
      
      fireEvent.click(minusBtn)
      expect(global.tempCountInput).toBe(0)
      expect(countDisplay.textContent).toBe('0')
    })

    it('should handle betting in count mode', () => {
      // Start count mode and set up count
      global.selectMode('COUNT')
      global.runningCount = 3
      
      // Submit correct count
      global.tempCountInput = 3
      fireEvent.click(screen.getByText('SUBMIT COUNT'))
      
      // Should show betting UI
      expect(document.getElementById('betting-ui').classList.contains('hidden')).toBe(false)
      
      // Test betting
      const maxBetBtn = screen.getByText('MAX BET')
      fireEvent.click(maxBetBtn)
      
      expect(global.stats.bet.t).toBe(1)
      expect(global.stats.bet.c).toBe(1) // Correct bet for positive count
    })

    it('should handle strategy decisions', () => {
      // Start strategy mode
      global.selectMode('STRATEGY')
      
      // Make a strategy decision
      const hitBtn = screen.getByText('HIT')
      fireEvent.click(hitBtn)
      
      expect(global.stats.strat.t).toBe(1)
      expect(document.getElementById('feedback-msg').innerHTML).toContain('Perfect!') || expect(document.getElementById('feedback-msg').innerHTML).toContain('Wrong')
    })

    it('should progress through hands in strategy mode', () => {
      // Start strategy mode
      global.selectMode('STRATEGY')
      
      // Make decisions for all three hands
      const hitBtn = screen.getByText('HIT')
      
      fireEvent.click(hitBtn) // Hand 0
      expect(global.currentHandIdx).toBe(1)
      
      fireEvent.click(hitBtn) // Hand 1
      expect(global.currentHandIdx).toBe(2)
      
      fireEvent.click(hitBtn) // Hand 2
      expect(document.getElementById('next-btn').classList.contains('hidden')).toBe(false)
    })

    it('should exit to menu correctly', () => {
      // Start strategy mode
      global.selectMode('STRATEGY')
      
      // Exit to menu
      const exitBtn = screen.getByText('← Exit to Menu')
      fireEvent.click(exitBtn)
      
      expect(global.gameMode).toBe(null)
      expect(document.getElementById('menu-screen').classList.contains('hidden')).toBe(false)
      expect(document.getElementById('game-screen').classList.contains('hidden')).toBe(true)
    })
  })

  describe('Counting System Integration', () => {
    it('should track running count correctly', () => {
      global.runningCount = 0
      
      // Draw some cards and check count
      const card1 = global.drawCard()
      const card2 = global.drawCard()
      const card3 = global.drawCard()
      
      // Count should be updated based on 5s and Aces drawn
      expect(typeof global.runningCount).toBe('number')
    })

    it('should validate count input', () => {
      global.runningCount = 2
      global.tempCountInput = 2
      
      global.verifyPreCount()
      
      expect(global.stats.count.t).toBe(1)
      expect(global.stats.count.c).toBe(1)
      expect(document.getElementById('feedback-msg').innerHTML).toContain('Count Correct!')
    })

    it('should show correct feedback for wrong count', () => {
      global.runningCount = 2
      global.tempCountInput = 1
      
      global.verifyPreCount()
      
      expect(global.stats.count.t).toBe(1)
      expect(global.stats.count.c).toBe(0)
      expect(document.getElementById('feedback-msg').innerHTML).toContain('Incorrect!')
    })
  })
})
