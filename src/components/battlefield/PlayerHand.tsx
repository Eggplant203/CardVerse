import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardInstance } from '@/types/game';
import Card from '@/components/card/Card';

interface PlayerHandProps {
  cards: CardInstance[];
  currentMana: number;
  onCardPlay: (cardInstance: CardInstance) => void;
  isPlayerTurn: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  currentMana,
  onCardPlay,
  isPlayerTurn
}) => {
  const getPlayableCards = (): CardInstance[] => {
    if (!isPlayerTurn) return [];
    return cards.filter(card => card.card.stats.manaCost <= currentMana);
  };

  const isPlayable = (card: CardInstance): boolean => {
    return isPlayerTurn && card.card.stats.manaCost <= currentMana;
  };

  return (
    <div className="player-hand relative mt-4 min-h-[140px] px-4">
      {/* Hand container with fan effect */}
      <AnimatePresence>
        <div className="hand-container flex justify-center items-end">
          {cards.map((card, index) => {
            // Calculate the fan effect positioning
            const centerOffset = (cards.length - 1) / 2;
            const position = index - centerOffset;
            const rotation = position * 5; // degrees of rotation for each card
            const translateX = position * 20; // horizontal offset
            const translateY = Math.abs(position) * 5; // vertical offset
            
            return (
              <motion.div
                key={card.id}
                className="card-in-hand absolute"
                initial={{ y: 100, opacity: 0 }}
                animate={{ 
                  y: translateY,
                  x: translateX,
                  rotate: rotation,
                  opacity: 1
                }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ 
                  y: -30, 
                  scale: 1.1, 
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
                style={{
                  transformOrigin: 'bottom center',
                  zIndex: index
                }}
                onClick={() => isPlayable(card) && onCardPlay(card)}
              >
                <div className="relative">
                  <Card 
                    card={card.card} 
                    size="sm" 
                    isPlayable={isPlayable(card)}
                  />
                  
                  {/* Mana indicator */}
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -mt-1 -mr-1">
                    {card.card.stats.manaCost}
                  </div>
                  
                  {/* Not enough mana indicator */}
                  {!isPlayable(card) && isPlayerTurn && (
                    <div className="absolute inset-0 bg-red-900 bg-opacity-50 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        Need {card.card.stats.manaCost} mana
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
      
      {/* Playable cards indicator */}
      {isPlayerTurn && (
        <div className="playable-indicator absolute top-0 left-0 ml-4 mt-2 text-xs text-gray-400">
          <span>{getPlayableCards().length} of {cards.length} cards playable</span>
        </div>
      )}
      
      {/* Current mana */}
      <div className="mana-indicator absolute top-0 right-0 mr-4 mt-2 flex items-center">
        <div className="mana-crystal w-4 h-4 rounded-full bg-blue-500 mr-1"></div>
        <span className="text-xs text-white font-bold">{currentMana}</span>
      </div>
    </div>
  );
};

export default PlayerHand;
