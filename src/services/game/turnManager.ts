import { GameState, GamePhase, Player, CardInstance } from '@/types/game';
import { v4 as uuidv4 } from 'uuid';
import { Card } from '@/types/card';
import { EffectProcessor } from './effectProcessor';

/**
 * Manages game turns, phases, and state transitions
 */
export class TurnManager {
  private gameState: GameState;

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * Get the current game state
   */
  public getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Start a new game with two players and their decks
   */
  public static createNewGame(players: [Player, Player]): GameState {
    const gameId = uuidv4();

    // Set up player starting states
    players.forEach(player => {
      // Shuffle player's deck
      player.deck = TurnManager.shuffleDeck([...player.deck]);
      
      // Draw initial hand (5 cards)
      player.hand = [];
      for (let i = 0; i < 5; i++) {
        if (player.deck.length > 0) {
          const drawnCard = player.deck.pop()!;
          player.hand.push(TurnManager.createCardInstance(drawnCard));
        }
      }
      
      // Initialize battlefield
      player.battlefield = {
        front: [null, null, null],
        back: [null, null, null]
      };
      
      // Initialize graveyard
      player.graveyard = [];
      
      // Set starting health and mana
      player.health = 30;
      player.maxHealth = 30;
      player.mana = {
        current: 1,
        max: 1
      };
    });

    // Create the initial game state
    const gameState: GameState = {
      id: gameId,
      players,
      currentPlayerIndex: 0, // First player starts
      battlefield: {
        playerSlots: Array(5).fill(null),
        opponentSlots: Array(5).fill(null),
        player: players[0].battlefield,
        opponent: players[1].battlefield
      },
      turnNumber: 1,
      currentPhase: GamePhase.UPKEEP,
      log: ['Game started!'],
      isGameOver: false,
      winner: null
    };

    return gameState;
  }

  /**
   * Advance to the next phase of the turn
   */
  public nextPhase(): GameState {
    switch (this.gameState.currentPhase) {
      case GamePhase.UPKEEP:
        this.gameState.currentPhase = GamePhase.MAIN;
        break;
        
      case GamePhase.MAIN:
        this.gameState.currentPhase = GamePhase.COMBAT;
        break;
        
      case GamePhase.COMBAT:
        this.gameState.currentPhase = GamePhase.END;
        break;
        
      case GamePhase.END:
        this.endTurn();
        break;
    }
    
    return this.gameState;
  }

  /**
   * End the current player's turn and start the next player's turn
   */
  public endTurn(): GameState {
    // Process end-of-turn effects
    const allCards = this.getAllCards();
    EffectProcessor.processEndTurnEffects(allCards);
    
    // Switch to next player
    this.gameState.currentPlayerIndex = 1 - this.gameState.currentPlayerIndex;
    
    // If we've gone back to player 1, increment the turn counter
    if (this.gameState.currentPlayerIndex === 0) {
      this.gameState.turnNumber++;
    }
    
    // Reset phase to upkeep
    this.gameState.currentPhase = GamePhase.UPKEEP;
    
    // Process start-of-turn for new player
    this.startTurn();
    
    return this.gameState;
  }

  /**
   * Start a new turn for the current player
   */
  private startTurn(): void {
    const currentPlayer = this.getCurrentPlayer();
    
    // Draw a card
    this.drawCard(currentPlayer);
    
    // Increase mana (max 10)
    const newMaxMana = Math.min(10, currentPlayer.mana.max + 1);
    currentPlayer.mana = {
      current: newMaxMana, // Refresh mana to full
      max: newMaxMana
    };
    
    // Reset card states (can attack, etc.)
    const playerCards = this.getPlayerCards(currentPlayer);
    
    playerCards.forEach(card => {
      if (card) {
        card.canAttack = true;
        card.isExhausted = false;
      }
    });
    
    // Process start-of-turn effects
    const allCards = this.getAllCards();
    EffectProcessor.processStartTurnEffects(allCards);
  }

  /**
   * Draw a card for a player
   */
  public drawCard(player: Player): CardInstance | null {
    if (player.deck.length === 0) {
      // No cards left to draw
      return null;
    }
    
    // Draw from top of deck
    const drawnCard = player.deck.pop()!;
    const cardInstance = TurnManager.createCardInstance(drawnCard);
    
    // Add to hand
    player.hand.push(cardInstance);
    
    return cardInstance;
  }

  /**
   * Get the current player
   */
  public getCurrentPlayer(): Player {
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  /**
   * Get all cards currently in play
   */
  private getAllCards(): CardInstance[] {
    const cards: CardInstance[] = [];
    
    this.gameState.players.forEach(player => {
      // Get cards on battlefield
      for (const row of ['front', 'back'] as const) {
        player.battlefield[row].forEach(card => {
          if (card) {
            cards.push(card);
          }
        });
      }
    });
    
    return cards;
  }

  /**
   * Get all cards for a specific player (battlefield only)
   */
  private getPlayerCards(player: Player): CardInstance[] {
    const cards: CardInstance[] = [];
    
    // Get cards on battlefield
    for (const row of ['front', 'back'] as const) {
      player.battlefield[row].forEach(card => {
        if (card) {
          cards.push(card);
        }
      });
    }
    
    return cards;
  }

  /**
   * Helper method to shuffle a deck
   */
  private static shuffleDeck(deck: Card[]): Card[] {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  /**
   * Create a card instance from a card
   */
  private static createCardInstance(card: Card): CardInstance {
    return {
      card,
      id: uuidv4(),
      position: null, // Not on battlefield yet
      currentStats: {
        health: card.stats.health,
        stamina: card.stats.stamina,
        attack: card.stats.attack,
        defense: card.stats.defense,
        speed: card.stats.speed
      },
      activeEffects: [],
      canAttack: false,
      isExhausted: false
    };
  }

  /**
   * Update the game timer (we store it separately now)
   */
  private _turnTimer: number = 60;
  
  public updateTimer(remainingTime: number): void {
    this._turnTimer = remainingTime;
  }
  
  public getTurnTimer(): number {
    return this._turnTimer;
  }

  /**
   * Check if the game is over
   */
  public checkGameOver(): boolean {
    // Check if any player has 0 health
    for (let i = 0; i < this.gameState.players.length; i++) {
      if (this.gameState.players[i].health <= 0) {
        this.gameState.isGameOver = true;
        this.gameState.winner = this.gameState.players[1 - i].id;
        return true;
      }
    }
    
    return false;
  }
}
