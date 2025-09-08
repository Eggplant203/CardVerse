import React from 'react';
import { CardInstance } from '@/types/game';
import Card from '@/components/card/Card';
import { motion } from 'framer-motion';

interface BattlefieldProps {
  playerField: {
    front: (CardInstance | null)[];
    back: (CardInstance | null)[];
  };
  opponentField: {
    front: (CardInstance | null)[];
    back: (CardInstance | null)[];
  };
  onCardSelect?: (cardInstance: CardInstance) => void;
  selectedCardId?: string;
  isPlayerTurn: boolean;
  validTargets?: string[]; // Array of card IDs that are valid targets
}

const Battlefield: React.FC<BattlefieldProps> = ({
  playerField,
  opponentField,
  onCardSelect,
  selectedCardId,
  isPlayerTurn,
  validTargets = []
}) => {
  // Helper to determine if a card is selectable/targetable
  const isTargetable = (cardInstance: CardInstance | null): boolean => {
    if (!cardInstance) return false;
    return validTargets.includes(cardInstance.id);
  };

  // Helper to determine if a card is selected
  const isSelected = (cardInstance: CardInstance | null): boolean => {
    if (!cardInstance) return false;
    return cardInstance.id === selectedCardId;
  };

  return (
    <div className="battlefield relative w-full mx-auto max-w-4xl">
      {/* Center of battlefield indicator */}
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-600 z-0" />
      
      {/* Opponent field - Back row */}
      <div className="battlefield-row opponent-back grid grid-cols-3 gap-2 mb-2">
        {opponentField.back.map((cardInstance, index) => (
          <div 
            key={`opponent-back-${index}`}
            className={`card-slot flex justify-center items-center h-36 rounded 
              ${cardInstance ? 'bg-gray-800 bg-opacity-30' : 'border border-dashed border-gray-700 bg-gray-900 bg-opacity-20'} 
              ${isTargetable(cardInstance) ? 'ring-2 ring-yellow-400 cursor-pointer' : ''}
            `}
            onClick={() => cardInstance && isTargetable(cardInstance) && onCardSelect && onCardSelect(cardInstance)}
          >
            {cardInstance && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  card={cardInstance.card} 
                  size="sm"
                  isSelected={isSelected(cardInstance)}
                />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 flex justify-between">
                  <span>❤️ {cardInstance.currentStats.health}</span>
                  <span>⚔️ {cardInstance.currentStats.attack}</span>
                </div>
                
                {/* Effect indicators if any */}
                {cardInstance.activeEffects.length > 0 && (
                  <div className="absolute top-0 right-0 m-1">
                    <span className="bg-blue-600 text-white text-xs px-1 rounded-full">
                      {cardInstance.activeEffects.length}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Opponent field - Front row */}
      <div className="battlefield-row opponent-front grid grid-cols-3 gap-2 mb-4">
        {opponentField.front.map((cardInstance, index) => (
          <div 
            key={`opponent-front-${index}`}
            className={`card-slot flex justify-center items-center h-36 rounded
              ${cardInstance ? 'bg-gray-800 bg-opacity-30' : 'border border-dashed border-gray-700 bg-gray-900 bg-opacity-20'} 
              ${isTargetable(cardInstance) ? 'ring-2 ring-yellow-400 cursor-pointer' : ''}
            `}
            onClick={() => cardInstance && isTargetable(cardInstance) && onCardSelect && onCardSelect(cardInstance)}
          >
            {cardInstance && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  card={cardInstance.card} 
                  size="sm"
                  isSelected={isSelected(cardInstance)}
                />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 flex justify-between">
                  <span>❤️ {cardInstance.currentStats.health}</span>
                  <span>⚔️ {cardInstance.currentStats.attack}</span>
                </div>
                
                {/* Effect indicators if any */}
                {cardInstance.activeEffects.length > 0 && (
                  <div className="absolute top-0 right-0 m-1">
                    <span className="bg-blue-600 text-white text-xs px-1 rounded-full">
                      {cardInstance.activeEffects.length}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Center area */}
      <div className="center-area py-4 flex justify-center items-center text-center">
        <div className="turn-indicator text-lg font-title">
          {isPlayerTurn ? 
            <span className="text-green-400">Your Turn</span> : 
            <span className="text-red-400">Opponent&apos;s Turn</span>
          }
        </div>
      </div>
      
      {/* Player field - Front row */}
      <div className="battlefield-row player-front grid grid-cols-3 gap-2 mb-2">
        {playerField.front.map((cardInstance, index) => (
          <div 
            key={`player-front-${index}`}
            className={`card-slot flex justify-center items-center h-36 rounded
              ${cardInstance ? 'bg-gray-800 bg-opacity-30' : 'border border-dashed border-gray-700 bg-gray-900 bg-opacity-20'} 
              ${isPlayerTurn && cardInstance ? 'cursor-pointer' : ''}
              ${isSelected(cardInstance) ? 'ring-2 ring-blue-400' : ''}
            `}
            onClick={() => cardInstance && isPlayerTurn && onCardSelect && onCardSelect(cardInstance)}
          >
            {cardInstance && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  card={cardInstance.card} 
                  size="sm"
                  isSelected={isSelected(cardInstance)}
                />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 flex justify-between">
                  <span>❤️ {cardInstance.currentStats.health}</span>
                  <span>⚔️ {cardInstance.currentStats.attack}</span>
                </div>
                
                {/* Active indicators */}
                {isPlayerTurn && cardInstance.canAttack && !cardInstance.isExhausted && (
                  <div className="absolute top-0 left-0 m-1">
                    <span className="bg-green-600 text-white text-xs px-1 rounded-full">
                      Ready
                    </span>
                  </div>
                )}
                
                {/* Effect indicators if any */}
                {cardInstance.activeEffects.length > 0 && (
                  <div className="absolute top-0 right-0 m-1">
                    <span className="bg-blue-600 text-white text-xs px-1 rounded-full">
                      {cardInstance.activeEffects.length}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Player field - Back row */}
      <div className="battlefield-row player-back grid grid-cols-3 gap-2">
        {playerField.back.map((cardInstance, index) => (
          <div 
            key={`player-back-${index}`}
            className={`card-slot flex justify-center items-center h-36 rounded
              ${cardInstance ? 'bg-gray-800 bg-opacity-30' : 'border border-dashed border-gray-700 bg-gray-900 bg-opacity-20'} 
              ${isPlayerTurn && cardInstance ? 'cursor-pointer' : ''}
              ${isSelected(cardInstance) ? 'ring-2 ring-blue-400' : ''}
            `}
            onClick={() => cardInstance && isPlayerTurn && onCardSelect && onCardSelect(cardInstance)}
          >
            {cardInstance && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card 
                  card={cardInstance.card} 
                  size="sm" 
                  isSelected={isSelected(cardInstance)}
                />
                
                {/* Stats overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 flex justify-between">
                  <span>❤️ {cardInstance.currentStats.health}</span>
                  <span>⚔️ {cardInstance.currentStats.attack}</span>
                </div>
                
                {/* Active indicators */}
                {isPlayerTurn && cardInstance.canAttack && !cardInstance.isExhausted && (
                  <div className="absolute top-0 left-0 m-1">
                    <span className="bg-green-600 text-white text-xs px-1 rounded-full">
                      Ready
                    </span>
                  </div>
                )}
                
                {/* Effect indicators if any */}
                {cardInstance.activeEffects.length > 0 && (
                  <div className="absolute top-0 right-0 m-1">
                    <span className="bg-blue-600 text-white text-xs px-1 rounded-full">
                      {cardInstance.activeEffects.length}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Battlefield;
