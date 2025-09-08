import React from 'react';
import type { Card as CardType } from '@/types/card';
import { Rarity, Element } from '@/types/card';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getElementHexColor } from '@/utils/cardUtils';

interface CardProps {
  card: CardType;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  isPlayable?: boolean;
  isSelected?: boolean;
}

const Card: React.FC<CardProps> = ({
  card,
  size = 'md',
  onClick,
  isPlayable = false,
  isSelected = false,
}) => {
  // Define size classes
  const sizeClasses = {
    sm: 'w-31 h-64',
    md: 'w-36 h-52',
    lg: 'w-56 h-76',
  };

  // Define rarity text colors
  const rarityTextColors = {
    [Rarity.COMMON]: 'text-gray-300',
    [Rarity.UNCOMMON]: 'text-blue-400',
    [Rarity.RARE]: 'text-purple-400',
    [Rarity.EPIC]: 'text-red-400',
    [Rarity.LEGENDARY]: 'text-yellow-400',
    [Rarity.MYTHIC]: 'text-pink-400',
    [Rarity.UNIQUE]: 'text-cyan-400',
  };

  // Define element colors and icons
  const elementProperties = {
    [Element.AURORA]: { color: 'bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500', icon: '🌈' },
    [Element.VOID]: { color: 'bg-gray-900', icon: '⚫' },
    [Element.CRYSTAL]: { color: 'bg-fuchsia-600', icon: '💎' },
    [Element.BLOOD]: { color: 'bg-red-800', icon: '🩸' },
    [Element.STORM]: { color: 'bg-amber-400', icon: '⚡' },
    [Element.FLORA]: { color: 'bg-emerald-600', icon: '🌿' },
    [Element.AETHER]: { color: 'bg-indigo-600', icon: '🔮' },
  };

  const elementColors = {
    [Element.AURORA]: elementProperties[Element.AURORA].color,
    [Element.VOID]: elementProperties[Element.VOID].color,
    [Element.CRYSTAL]: elementProperties[Element.CRYSTAL].color,
    [Element.BLOOD]: elementProperties[Element.BLOOD].color,
    [Element.STORM]: elementProperties[Element.STORM].color,
    [Element.FLORA]: elementProperties[Element.FLORA].color,
    [Element.AETHER]: elementProperties[Element.AETHER].color,
  };

  // Create border colors mapping
  const borderColors = {
    [Element.AURORA]: 'border-purple-400',
    [Element.VOID]: 'border-gray-900',
    [Element.CRYSTAL]: 'border-fuchsia-600',
    [Element.BLOOD]: 'border-red-800',
    [Element.STORM]: 'border-amber-400',
    [Element.FLORA]: 'border-emerald-600',
    [Element.AETHER]: 'border-indigo-600',
  };

  return (
    <motion.div
      className={`card ${sizeClasses[size]} border-3 ${borderColors[card.element]} cursor-pointer flex flex-col overflow-hidden`}
      whileHover={{ scale: 1.05, y: -10 }}
      animate={isSelected ? { scale: 1.1, y: -15 } : { opacity: 1, scale: 1 }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Header */}
      <div className="card-header flex justify-between items-center p-1 bg-gray-800">
        <h3 className="text-xs font-bold truncate flex-1">{card.name}</h3>
        <div className={`mana-cost w-4 h-4 rounded-full flex items-center justify-center ${elementColors[card.element]} text-white text-xs font-bold`}>
          {card.stats.manaCost}
        </div>
      </div>
      
      {/* Card Type and Rarity - Small tag below header */}
      <div className="flex justify-between px-1 py-0.5 bg-gray-700 text-white text-xs">
        <span className="capitalize">{card.type}</span>
        <span className="capitalize font-bold" style={{color: getElementHexColor(card.element)}}>{card.element}</span>
        <span className={`capitalize font-bold ${rarityTextColors[card.rarity]}`}>{card.rarity}</span>
      </div>
      
      {/* Card Image */}
      <div className="relative flex-1">
        {card.imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={card.imageUrl}
              alt={card.name}
              fill
              style={{ objectFit: 'cover' }}
              className="card-image"
              priority
              unoptimized={card.imageUrl.startsWith('data:')} // Use unoptimized for base64 images
            />
            {/* Semi-transparent element overlay on top of the image */}
            <div className={`absolute inset-0 opacity-20 ${elementColors[card.element]}`}></div>
          </div>
        ) : (
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${elementColors[card.element]} bg-opacity-30 bg-gray-800`}>
            <div className="text-2xl mb-1">
              {elementProperties[card.element]?.icon}
            </div>
            <span className="text-xs text-center px-2 text-white">{card.name}</span>
          </div>
        )}
      </div>
      
      {/* Card Stats */}
      <div className="card-stats flex justify-between p-1 bg-gray-900 text-white text-xs">
        <div className="attack flex items-center">
          <span className="mr-1">⚔️</span>
          <span>{card.stats.attack}</span>
        </div>
        <div className="health flex items-center">
          <span className="mr-1">❤️</span>
          <span>{card.stats.health}</span>
        </div>
        <div className="defense flex items-center">
          <span className="mr-1">🛡️</span>
          <span>{card.stats.defense}</span>
        </div>
        <div className="speed flex items-center">
          <span className="mr-1">⚡</span>
          <span>{card.stats.speed}</span>
        </div>
      </div>
      
      {/* Card Footer - Only visible in larger sizes */}
      {size === 'lg' && (
        <div className="card-description text-xs p-1 bg-gray-800 overflow-y-auto flex flex-col gap-1">
          <div className="flex items-center gap-1 text-white text-opacity-90">
            <span>Element:</span>
            <span className="capitalize flex items-center gap-1 font-bold" style={{color: getElementHexColor(card.element)}}>
              {card.element} {elementProperties[card.element]?.icon}
            </span>
          </div>
          <p className="text-white text-opacity-80">{card.description}</p>
        </div>
      )}
      
      {/* Playable indicator */}
      {isPlayable && (
        <div className="absolute inset-0 border-4 border-green-500 animate-pulse rounded-lg opacity-70"></div>
      )}
    </motion.div>
  );
};

export default Card;
