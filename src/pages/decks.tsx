import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Card from '@/components/card/Card';
import Button from '@/components/ui/Button';
import { Card as CardType } from '@/types/card';
import { CardAPI } from '@/services/api/cardAPI';
import { useAuth } from '@/context/AuthContext';

interface Deck {
  id: string;
  name: string;
  cards: CardType[];
  coverCard?: CardType;
}

const Decks: NextPage = () => {
  const auth = useAuth();
  const [cards, setCards] = useState<CardType[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDeckName, setEditingDeckName] = useState('');
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

  useEffect(() => {
    // Load the user's card collection and decks from storage
    const loadData = async () => {
      try {
        const result = await CardAPI.getUserCards(auth.user?.id || null, auth.isGuestMode);
        if (result.success && result.data) {
          setCards(result.data);
          
          // For now, create a sample deck if none exists
          // In a real app, this would be loaded from storage
          if (decks.length === 0) {
            const sampleDeck: Deck = {
              id: 'sample-deck-1',
              name: 'My First Deck',
              cards: result.data.slice(0, 5), // First 5 cards
              coverCard: result.data[0]
            };
            setDecks([sampleDeck]);
          }
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        setCards([]);
      }
    };

    loadData();
  }, [auth.isGuestMode, auth.user?.id, decks.length]);

  const handleCreateDeck = () => {
    setSelectedDeck(null);
    setEditingDeckName('New Deck');
    setSelectedCards([]);
    setIsEditing(true);
  };

  const handleEditDeck = (deck: Deck) => {
    setSelectedDeck(deck);
    setEditingDeckName(deck.name);
    setSelectedCards([...deck.cards]);
    setIsEditing(true);
  };

  const handleSelectDeck = (deck: Deck) => {
    setSelectedDeck(deck);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks(decks.filter(deck => deck.id !== deckId));
    if (selectedDeck?.id === deckId) {
      setSelectedDeck(null);
    }
  };

  const toggleCardInDeck = (card: CardType) => {
    const isCardInDeck = selectedCards.some(c => c.id === card.id);

    if (isCardInDeck) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id));
    } else {
      // Check if deck has max cards (30)
      if (selectedCards.length < 30) {
        setSelectedCards([...selectedCards, card]);
      }
    }
  };

  const handleSaveDeck = () => {
    const deckToSave: Deck = {
      id: selectedDeck?.id || `deck-${Date.now()}`,
      name: editingDeckName,
      cards: selectedCards,
      coverCard: selectedCards[0]
    };

    if (selectedDeck) {
      // Update existing deck
      setDecks(decks.map(d => d.id === selectedDeck.id ? deckToSave : d));
    } else {
      // Add new deck
      setDecks([...decks, deckToSave]);
    }

    setIsEditing(false);
    setSelectedDeck(deckToSave);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedDeck) {
      // Reset to original state
      setEditingDeckName(selectedDeck.name);
      setSelectedCards([...selectedDeck.cards]);
    } else {
      setSelectedDeck(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-title text-center mb-8 text-white">
          Deck Builder
        </h2>
        
        {isEditing ? (
          <div className="deck-editor">
            <div className="flex justify-between items-center mb-6">
              <input
                type="text"
                value={editingDeckName}
                onChange={(e) => setEditingDeckName(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Deck Name"
              />
              
              <div className="flex gap-2">
                <Button onClick={handleSaveDeck} variant="primary">
                  Save Deck
                </Button>
                <Button onClick={handleCancelEdit} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
            
            <div className="selected-cards mb-6">
              <h3 className="text-xl font-title mb-4 text-white flex justify-between items-center">
                <span>Selected Cards ({selectedCards.length}/30)</span>
                <span className="text-sm text-gray-400">
                  {selectedCards.length === 30 ? 'Deck full' : 'Add more cards'}
                </span>
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {selectedCards.map((card) => (
                  <motion.div 
                    key={`deck-${card.id}`}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => toggleCardInDeck(card)}
                    className="relative cursor-pointer"
                  >
                    <Card card={card} size="sm" />
                    <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">
                      ✕
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="collection-for-deck">
              <h3 className="text-xl font-title mb-4 text-white">Your Collection</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {cards.map((card) => {
                  const isInDeck = selectedCards.some(c => c.id === card.id);
                  return (
                    <motion.div 
                      key={`collection-${card.id}`}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleCardInDeck(card)}
                      className={`relative cursor-pointer ${isInDeck ? 'opacity-50' : ''}`}
                    >
                      <Card card={card} size="sm" />
                      {isInDeck && (
                        <div className="absolute inset-0 bg-blue-500 bg-opacity-30 flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                            ✓
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="decks-view">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-title text-white">Your Decks</h3>
              <Button onClick={handleCreateDeck} variant="primary">
                Create New Deck
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <motion.div
                  key={deck.id}
                  whileHover={{ y: -5 }}
                  className={`deck-card bg-gray-800 rounded-lg overflow-hidden cursor-pointer ${selectedDeck?.id === deck.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleSelectDeck(deck)}
                >
                  <div className="deck-cover h-40 bg-gray-700 flex items-center justify-center overflow-hidden">
                    {deck.coverCard ? (
                      <Image 
                        src={deck.coverCard.imageUrl || '/default-card.jpg'} 
                        alt={deck.name}
                        width={200}
                        height={160}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-gray-500">No cover card</div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-white font-medium mb-1">{deck.name}</h4>
                    <p className="text-gray-400 text-sm">{deck.cards.length} cards</p>
                    
                    <div className="mt-4 flex justify-between">
                      <Button onClick={(e) => { e.stopPropagation(); handleEditDeck(deck); }} variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDeck(deck.id); }} 
                        variant="accent" 
                        size="sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {decks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400 mb-6">You don&apos;t have any decks yet</p>
                  <Button onClick={handleCreateDeck} variant="primary" size="lg">
                    Create Your First Deck
                  </Button>
                </div>
              )}
            </div>
            
            {selectedDeck && !isEditing && (
              <div className="mt-8 bg-gray-800 bg-opacity-50 rounded-lg p-6">
                <h3 className="text-xl font-title mb-4 text-white">{selectedDeck.name} - Cards</h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {selectedDeck.cards.map((card) => (
                    <motion.div 
                      key={`selected-deck-${card.id}`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Card card={card} size="sm" />
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    onClick={() => handleEditDeck(selectedDeck)} 
                    variant="primary"
                  >
                    Edit Deck
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Decks;
