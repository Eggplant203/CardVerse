import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Battlefield from '@/components/battlefield/Battlefield';
import PlayerHand from '@/components/battlefield/PlayerHand';
import Button from '@/components/ui/Button';
import * as battleEngine from '@/services/game/battleEngine';
import { Card } from '@/types/card';
import { GamePhase, Player, GameState, CardInstance } from '@/types/game';

const Battle: NextPage = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCardInstance, setSelectedCardInstance] = useState<CardInstance | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [activeTurn, setActiveTurn] = useState<boolean>(true);
  const [turnTimer, setTurnTimer] = useState<number>(30);
  const [validTargets, setValidTargets] = useState<string[]>([]);
  const [gameLog, setGameLog] = useState<string[]>([]);

  // Initialize game on component mount
  useEffect(() => {
    const initGame = async () => {
      try {
        // This would typically load the player's deck and opponent
        const initialGameState = await battleEngine.initializeGame();
        setGameState(initialGameState);
        addToGameLog('Game started! Draw your initial hand.');
      } catch (err) {
        console.error('Failed to initialize game:', err);
      }
    };

    initGame();
  }, []);

  // Turn timer
  useEffect(() => {
    if (!activeTurn || !gameState || gameState.currentPhase === GamePhase.SETUP || gameState.currentPhase === GamePhase.END) return;

    const timer = setInterval(() => {
      setTurnTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndTurn();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTurn, gameState?.currentPhase]);

  const addToGameLog = (message: string) => {
    setGameLog((prev: string[]) => [...prev, message]);
  };

  const handleCardPlay = (cardInstance: CardInstance) => {
    setSelectedCardInstance(cardInstance);
    setSelectedCardId(cardInstance.id);
    addToGameLog(`Selected ${cardInstance.card.name}`);
  };

  const handleCardSelect = (cardInstance: CardInstance) => {
    // For targeting opponent cards
    if (validTargets.includes(cardInstance.id)) {
      setGameState((prevState) => {
        if (!prevState || !selectedCardInstance) return prevState;
        
        // Process attack logic here
        const newState = { ...prevState };
        // Add attack logic
        
        return newState;
      });
      
      addToGameLog(`${selectedCardInstance?.card.name || 'Card'} attacked ${cardInstance.card.name}`);
      setSelectedCardInstance(null);
      setSelectedCardId(null);
      setValidTargets([]);
    }
  };

  const handleEndTurn = async () => {
    if (!gameState) return;
    
    addToGameLog('Ending turn...');
    setActiveTurn(false);
    
    // Process AI opponent's turn
    setTimeout(async () => {
      try {
        // Make a non-null assertion since we checked gameState above
        const result = await battleEngine.processTurn(gameState!, false);
        setGameState(result.newState);
        
        // Add AI actions to game log
        result.actions.forEach((action: any) => {
          addToGameLog(`Opponent ${action.type}: ${action.description}`);
        });
        
        // Start player turn again
        setActiveTurn(true);
        setTurnTimer(30);
        addToGameLog('Your turn!');
      } catch (err) {
        console.error('Error processing opponent turn:', err);
      }
    }, 2000);
  };

  // If game hasn't been initialized yet
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
        <Header />
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="text-3xl font-title text-white mb-4">Loading Battle...</div>
            <div className="animate-pulse text-blue-400">Preparing the battlefield</div>
          </div>
        </div>
      </div>
    );
  }

  const { players, battlefield } = gameState;
  const player: Player = players[0];
  const opponent: Player = players[1];

  // Create default battlefield structure if not defined
  const playerField = battlefield.player || {
    front: Array(3).fill(null),
    back: Array(3).fill(null)
  };
  
  const opponentField = battlefield.opponent || {
    front: Array(3).fill(null),
    back: Array(3).fill(null)
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
      <Header 
        userName={player.name}
        userAvatar={player.avatar || ''}
        currentMana={player.mana?.current || 0}
        maxMana={player.mana?.max || 0}
      />

      <main className="container mx-auto px-4 py-4 relative">
        {/* Game Status Bar */}
        <div className="game-status-bar flex justify-between items-center bg-gray-800 bg-opacity-70 rounded-lg p-3 mb-4">
          <div className="player-info flex items-center">
            <div className="avatar w-10 h-10 rounded-full bg-blue-600 mr-2"></div>
            <div>
              <div className="name text-white">{player.name}</div>
              <div className="health text-green-400">HP: {player.health}</div>
            </div>
          </div>
          
          <div className="game-phase">
            <div className="text-center text-white font-title">
              {gameState.currentPhase === GamePhase.MAIN && activeTurn ? 'Your Turn' : 'Opponent Turn'}
            </div>
            {activeTurn && (
              <div className="turn-timer text-center">
                <div className="text-yellow-400 text-sm">{turnTimer}s</div>
                <div className="w-20 bg-gray-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-yellow-400 h-1.5 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${(turnTimer / 30) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="opponent-info flex items-center">
            <div>
              <div className="name text-white text-right">{opponent.name}</div>
              <div className="health text-green-400 text-right">HP: {opponent.health}</div>
            </div>
            <div className="avatar w-10 h-10 rounded-full bg-red-600 ml-2"></div>
          </div>
        </div>

        {/* Battlefield */}
        <Battlefield 
          playerField={playerField}
          opponentField={opponentField}
          onCardSelect={handleCardSelect}
          selectedCardId={selectedCardId || undefined}
          isPlayerTurn={activeTurn}
          validTargets={validTargets}
        />

        {/* Game Log */}
        <div className="game-log absolute top-24 right-4 w-64 bg-gray-900 bg-opacity-80 rounded-lg p-3 max-h-96 overflow-y-auto">
          <h4 className="text-white font-title text-sm mb-2 flex justify-between items-center">
            <span>Game Log</span>
            <span className="text-xs text-gray-400">{gameLog.length} events</span>
          </h4>
          <div className="space-y-1">
            {gameLog.map((entry, index) => (
              <div 
                key={index} 
                className="text-xs text-gray-300 pb-1 border-b border-gray-800 last:border-0"
              >
                {entry}
              </div>
            ))}
          </div>
        </div>

        {/* Player Hand */}
        <div className="player-hand-area mt-4">
          <PlayerHand
            cards={player.hand || []}
            currentMana={player.mana?.current || 0}
            onCardPlay={handleCardPlay}
            isPlayerTurn={activeTurn}
          />
          
          <div className="actions flex justify-center mt-4 gap-4">
            <Button 
              onClick={handleEndTurn} 
              disabled={!activeTurn || gameState.currentPhase !== GamePhase.MAIN}
              variant="outline"
            >
              End Turn
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Battle;
