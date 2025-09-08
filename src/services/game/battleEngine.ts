import { CardInstance, GameState, Player, GamePhase, GameActionResult } from '@/types/game';
import { Card, CardType, Rarity, Element } from '@/types/card';
import { v4 as uuidv4 } from 'uuid';
import { getCardCollection } from '../storage/localStorage';

/**
 * Initialize a new game state
 */
export const initializeGame = async (): Promise<GameState> => {
  // Get the player's card collection
  const playerCards = await getCardCollection();
  
  // For demo purposes, create a sample deck
  const playerDeck = playerCards.slice(0, 20);
  const opponentDeck = generateOpponentDeck();
  
  // Create initial player hands
  const playerHand = drawInitialHand(playerDeck);
  const opponentHand = drawInitialHand(opponentDeck);
  
  // Create players
  const player: Player = {
    id: uuidv4(),
    name: 'Player',
    avatar: 'player_avatar.png',
    health: 30,
    maxHealth: 30,
    mana: {
      current: 1,
      max: 1
    },
    deck: playerDeck,
    hand: playerHand,
    battlefield: {
      front: [null, null, null],
      back: [null, null, null]
    },
    graveyard: []
  };
  
  const opponent: Player = {
    id: uuidv4(),
    name: 'AI Opponent',
    avatar: 'ai_avatar.png',
    health: 30,
    maxHealth: 30,
    mana: {
      current: 1,
      max: 1
    },
    deck: opponentDeck,
    hand: opponentHand,
    battlefield: {
      front: [null, null, null],
      back: [null, null, null]
    },
    graveyard: []
  };
  
  // Create initial game state
  const gameState: GameState = {
    id: uuidv4(),
    players: [player, opponent],
    currentPlayerIndex: 0,
    currentPhase: GamePhase.MAIN,
    turnNumber: 1,
    battlefield: {
      playerSlots: Array(5).fill(null),
      opponentSlots: Array(5).fill(null),
      player: {
        front: Array(3).fill(null),
        back: Array(3).fill(null)
      },
      opponent: {
        front: Array(3).fill(null),
        back: Array(3).fill(null)
      }
    },
    log: ['Game initialized!'],
  };
  
  return gameState;
};

/**
 * Process a turn in the game, returns new state and actions taken
 */
export const processTurn = async (gameState: GameState, isPlayerTurn: boolean): Promise<{newState: GameState, actions: GameActionResult[]}> => {
  const actions: GameActionResult[] = [];
  const newState = { ...gameState };
  
  // AI opponent logic here...
  if (!isPlayerTurn) {
    // Simple AI: play a random card if possible, then attack if possible
    const opponent = gameState.players[1];
    
    // Try to play a card
    if (opponent.hand.length > 0 && opponent.mana.current > 0) {
      // Find a card we can afford
      const playableCards = opponent.hand.filter(c => c.card.stats.manaCost <= opponent.mana.current);
      
      if (playableCards.length > 0) {
        const cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)];
        
        // Find an empty slot
        const emptyFrontSlots = [0, 1, 2].filter(i => !gameState.battlefield.opponent?.front[i]);
        const emptyBackSlots = [0, 1, 2].filter(i => !gameState.battlefield.opponent?.back[i]);
        
        if (emptyFrontSlots.length > 0) {
          // Play in front row
          const slotIndex = emptyFrontSlots[Math.floor(Math.random() * emptyFrontSlots.length)];
          
          // Remove card from hand
          opponent.hand = opponent.hand.filter(c => c.id !== cardToPlay.id);
          
          // Place in battlefield
          if (gameState.battlefield.opponent) {
            gameState.battlefield.opponent.front[slotIndex] = cardToPlay;
          }
          
          // Reduce mana
          opponent.mana.current -= cardToPlay.card.stats.manaCost;
          
          actions.push({
            type: 'PLAY_CARD',
            description: `played ${cardToPlay.card.name} in front row`
          });
        } else if (emptyBackSlots.length > 0) {
          // Play in back row
          const slotIndex = emptyBackSlots[Math.floor(Math.random() * emptyBackSlots.length)];
          
          // Remove card from hand
          opponent.hand = opponent.hand.filter(c => c.id !== cardToPlay.id);
          
          // Place in battlefield
          if (gameState.battlefield.opponent) {
            gameState.battlefield.opponent.back[slotIndex] = cardToPlay;
          }
          
          // Reduce mana
          opponent.mana.current -= cardToPlay.card.stats.manaCost;
          
          actions.push({
            type: 'PLAY_CARD',
            description: `played ${cardToPlay.card.name} in back row`
          });
        }
      }
    }
    
    // Add attack logic here
    
    // End AI turn
    gameState.currentPhase = GamePhase.MAIN;
  }
  
  return { newState, actions };
};

/**
 * Draw initial hand of cards
 */
const drawInitialHand = (deck: Card[]): CardInstance[] => {
  const hand: CardInstance[] = [];
  const handSize = 5;
  
  // Draw cards for the initial hand
  for (let i = 0; i < handSize; i++) {
    if (deck.length > 0) {
      const card = deck[Math.floor(Math.random() * deck.length)];
      
      const cardInstance: CardInstance = {
        id: uuidv4(),
        card: card,
        position: null,
        currentStats: { ...card.stats },
        activeEffects: [],
        canAttack: false,
        isExhausted: true
      };
      
      hand.push(cardInstance);
    }
  }
  
  return hand;
};

/**
 * Generate a deck for the AI opponent
 */
const generateOpponentDeck = (): Card[] => {
  // Simple AI deck generator
  const deck: Card[] = [];
  
  // Generate 20 basic cards
  for (let i = 0; i < 20; i++) {
    deck.push({
      id: `ai-card-${i}`,
      name: `AI Card ${i}`,
      description: `AI opponent card ${i}`,
      imageUrl: `/images/cards/ai-card-${i % 5 + 1}.jpg`,
      type: CardType.CREATURE,
      rarity: i % 5 === 0 ? Rarity.RARE : Rarity.COMMON,
      element: ['fire', 'water', 'earth', 'air', 'neutral'][i % 5] as Element,
      stats: {
        manaCost: Math.floor(i / 5) + 1,
        attack: Math.floor(Math.random() * 5) + 1,
        health: Math.floor(Math.random() * 5) + 2,
        defense: Math.floor(Math.random() * 3),
        speed: Math.floor(Math.random() * 3) + 1,
        stamina: Math.floor(Math.random() * 5) + 3
      },
      effects: [],
      lore: `Ancient lore of card ${i}`,
      createdAt: new Date(),
      createdBy: 'AI Generator'
    });
  }
  
  return deck;
};
