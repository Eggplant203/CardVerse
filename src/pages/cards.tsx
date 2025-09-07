import React, { useState, useEffect, useContext } from 'react';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Card from '@/components/card/Card';
import Button from '@/components/ui/Button';
import { Card as CardType, Rarity, Element } from '@/types/card';
import { CardAPI } from '@/services/api/cardAPI';
import { formatEffectDescription } from '@/utils/cardUtils';
import AuthContext, { useAuth } from '@/context/AuthContext';

// Function to get rarity text color
function getRarityTextColor(rarity: string): string {
  const colorMap = {
    [Rarity.COMMON]: 'text-gray-300',
    [Rarity.UNCOMMON]: 'text-blue-400',
    [Rarity.RARE]: 'text-purple-400',
    [Rarity.EPIC]: 'text-red-400',
    [Rarity.LEGENDARY]: 'text-yellow-400',
    [Rarity.MYTHIC]: 'text-pink-400',
    [Rarity.UNIQUE]: 'text-cyan-400',
  };
  
  return colorMap[rarity as Rarity] || 'text-white';
}

// Function to download card as JSON
function downloadCardAsJSON(card: CardType): void {
  // Create a copy of the card object to ensure Date is serialized properly
  const cardCopy = {
    ...card,
    createdAt: card.createdAt instanceof Date 
      ? card.createdAt.toLocaleString() 
      : new Date(card.createdAt).toLocaleString()
  };
  
  // Convert to JSON string with nice formatting
  const cardJSON = JSON.stringify(cardCopy, null, 2);
  
  // Create Blob
  const blob = new Blob([cardJSON], { type: 'application/json' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  
  // Format current date and time for the filename using local time
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  const dateStr = `${day}-${month}-${year}`;
  const timeStr = `${hours}-${minutes}-${seconds}`;
  const dateTimeStr = `${dateStr}_${timeStr}`;
  
  // Create a safe filename from the card name
  const safeCardName = card.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // Create download link and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `card_${safeCardName}_${dateTimeStr}.json`;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}




const Collection: NextPage = () => {
  const auth = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('date');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);

  useEffect(() => {
    // Load the user's card collection from storage
    const loadCollection = async () => {
      try {
        const result = await CardAPI.getUserCards(auth.user?.id || null, auth.isGuestMode);
        if (result.success && result.data) {
          setCards(result.data);
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error('Failed to load card collection:', err);
        setCards([]);
      }
    };

    loadCollection();
  }, [auth.isGuestMode, auth.user?.id]);

  // Debug: Log when cards state changes
  useEffect(() => {
    console.log('Cards state changed, new length:', cards.length);
    console.log('Cards IDs:', cards.map(card => card.id));
  }, [cards]);

  // Filter cards based on current filter settings
  const filteredCards = cards.filter(card => {
    // Filter by search query
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (filter !== 'all') {
      if (filter === 'aurora' && card.element !== Element.AURORA) return false;
      if (filter === 'void' && card.element !== Element.VOID) return false;
      if (filter === 'crystal' && card.element !== Element.CRYSTAL) return false;
      if (filter === 'blood' && card.element !== Element.BLOOD) return false;
      if (filter === 'storm' && card.element !== Element.STORM) return false;
      if (filter === 'flora' && card.element !== Element.FLORA) return false;
      if (filter === 'aether' && card.element !== Element.AETHER) return false;
      if (filter === 'rare' && card.rarity < Rarity.RARE) return false;
    }

    return true;
  });

  // Sort the filtered cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortOption === 'rarity') {
      // Convert rarity string to a number for comparison
      const rarityOrder = {
        [Rarity.COMMON]: 1,
        [Rarity.UNCOMMON]: 2,
        [Rarity.RARE]: 3,
        [Rarity.EPIC]: 4,
        [Rarity.LEGENDARY]: 5,
        [Rarity.MYTHIC]: 6,
        [Rarity.UNIQUE]: 7
      };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    } else if (sortOption === 'attack') {
      return b.stats.attack - a.stats.attack;
    } else {
      // Default: sort by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    setShowDeleteConfirm(false); // Reset delete confirmation when opening a new card
    setShowMoreDetails(false); // Reset show more when opening a new card
  };

  const closeCardModal = () => {
    setSelectedCard(null);
    setShowDeleteConfirm(false);
    setShowMoreDetails(false);
  };
  
  const handleDeleteCard = async () => {
    if (selectedCard) {
      console.log('Starting delete process for card:', selectedCard.id);
      const result = await CardAPI.deleteCard(auth.user?.id || null, selectedCard.id, auth.isGuestMode);
      console.log('Delete result:', result);
      
      if (result.success) {
        console.log('Delete successful, reloading collection...');
        // Reload collection after deletion
        const collectionResult = await CardAPI.getUserCards(auth.user?.id || null, auth.isGuestMode);
        console.log('Reload collection result:', collectionResult);
        
        if (collectionResult.success && collectionResult.data) {
          console.log('Setting new cards array with length:', collectionResult.data.length);
          console.log('Previous cards length:', cards.length);
          setCards([...collectionResult.data]); // Force new array reference
          console.log('Cards state updated');
        } else {
          console.log('Failed to reload collection or no data returned');
        }
        closeCardModal();
      } else {
        console.log('Delete failed:', result.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-title text-center mb-8 text-white">
          Your Card Collection
        </h2>
        
        {/* Filter and Search Controls */}
        <div className="controls bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="search-bar flex-1">
              <input
                type="text"
                placeholder="Search cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="filter">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cards</option>
                  <option value="aurora">Aurora Element 🌈</option>
                  <option value="void">Void Element ⚫</option>
                  <option value="crystal">Crystal Element 💎</option>
                  <option value="blood">Blood Element 🩸</option>
                  <option value="storm">Storm Element ⚡</option>
                  <option value="flora">Flora Element 🌿</option>
                  <option value="aether">Aether Element 🔮</option>
                  <option value="rare">Rare & Above</option>
                </select>
              </div>
              
              <div className="sort">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-gray-700 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Newest First</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="rarity">Rarity (High-Low)</option>
                  <option value="attack">Attack (High-Low)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Cards Grid */}
        {sortedCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedCards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => handleCardClick(card)}
              >
                <Card card={card} size="sm" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {cards.length === 0 ? (
              <div className="flex flex-col items-center">
                <p className="text-gray-400 mb-6">Your collection is empty</p>
                <Button 
                  onClick={() => window.location.href = '/create'}
                  size="lg"
                >
                  Create Your First Card
                </Button>
              </div>
            ) : (
              <p className="text-gray-400">No cards match your search criteria</p>
            )}
          </div>
        )}
      </main>
      
      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            className="fixed inset-0 flex items-start sm:items-center justify-center z-50 bg-black bg-opacity-70 p-2 sm:p-4 pt-8 sm:pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCardModal}
          >
            <motion.div
              className="bg-gray-900 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-title text-white truncate pr-2">{selectedCard.name}</h3>
                <button 
                  onClick={closeCardModal}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="mx-auto mb-2 lg:mb-0">
                  <Card card={selectedCard} size="md" />
                </div>
                
                <div className="card-details lg:flex-1 overflow-y-auto lg:max-h-[350px] bg-gray-800 bg-opacity-50 rounded-lg p-4">
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Type</div>
                    <div className="text-white capitalize">{selectedCard.type} ({selectedCard.element})</div>
                  </div>
                
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Element</div>
                    <div className="text-white capitalize flex items-center gap-1">
                      {selectedCard.element} {selectedCard.element && 
                        {
                          'aurora': '🌈',
                          'void': '⚫',
                          'crystal': '💎',
                          'blood': '🩸',
                          'storm': '⚡',
                          'flora': '🌿',
                          'aether': '🔮'
                        }[selectedCard.element]
                      }
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Rarity</div>
                    <div className={`capitalize font-bold ${getRarityTextColor(selectedCard.rarity)}`}>{selectedCard.rarity}</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Stats</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-white text-sm">HP: {selectedCard.stats.health}</div>
                      <div className="text-white text-sm">ATK: {selectedCard.stats.attack}</div>
                      <div className="text-white text-sm">DEF: {selectedCard.stats.defense}</div>
                      <div className="text-white text-sm">SPD: {selectedCard.stats.speed}</div>
                      <div className="text-white text-sm">Mana: {selectedCard.stats.manaCost}</div>
                      {selectedCard.stats.stamina && (
                        <div className="text-white text-sm">Stamina: {selectedCard.stats.stamina}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Description</div>
                    <div className="text-white text-sm">{selectedCard.description}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-gray-400 text-sm">Effects</div>
                    {selectedCard.effects && selectedCard.effects.length > 0 ? (
                      <div className="space-y-2">
                        {selectedCard.effects.map((effect, index) => (
                          <div key={index} className="p-3 bg-gray-700 rounded-md border-l-3 border-blue-400">
                            <span className="text-yellow-400 text-sm font-semibold mb-1">
                              {effect.name}:
                            </span> <span className="text-white text-sm" dangerouslySetInnerHTML={{ __html: formatEffectDescription(effect.description) }}></span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-white text-sm">No effects</div>
                    )}
                  </div>
                  
                  {selectedCard.lore && (
                    <div className="mb-4">
                      <div className="text-gray-400 text-sm">Lore</div>
                      <div className="text-white text-sm italic">{selectedCard.lore}</div>
                    </div>
                  )}
                  
                  {/* Show More Button */}
                  <div className="mb-4 text-center">
                    <button 
                      onClick={() => setShowMoreDetails(!showMoreDetails)} 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center mx-auto"
                    >
                      <span>{showMoreDetails ? 'Hide Details' : 'Show More Details'}</span>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-4 w-4 ml-1 transition-transform ${showMoreDetails ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Extra AI Information - Only visible when showMoreDetails is true */}
                  {showMoreDetails && (
                    <div className="border-t border-gray-700 pt-4 mt-2">
                      {selectedCard.mood && (
                        <div className="mb-4">
                          <div className="text-gray-400 text-sm">Mood</div>
                          <div className="text-white text-sm">
                            {selectedCard.mood.charAt(0).toUpperCase() + selectedCard.mood.slice(1)}
                          </div>
                        </div>
                      )}
                      
                      {selectedCard.complexity !== undefined && (
                        <div className="mb-4">
                          <div className="text-gray-400 text-sm">Complexity</div>
                          <div className="text-white text-sm">{selectedCard.complexity}/10</div>
                        </div>
                      )}
                      
                      {selectedCard.dominantColors && (
                        <div className="mb-4">
                          <div className="text-gray-400 text-sm">Colors</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedCard.dominantColors.map((color: string, index: number) => (
                              <div 
                                key={index} 
                                className="w-6 h-6 rounded-full border border-gray-600"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <div className="text-gray-400 text-sm">Created</div>
                        <div className="text-white text-sm">
                          {new Date(selectedCard.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {!showDeleteConfirm ? (
                    <div className="mt-6 flex justify-between">
                      <Button 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Card
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => downloadCardAsJSON(selectedCard)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Download Card
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <p className="text-red-500 text-sm mb-2">Are you sure you want to delete this card?</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={handleDeleteCard}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collection;
