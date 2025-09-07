import React, { useState, useCallback, useRef } from 'react';
import { NextPage } from 'next';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { Rarity, Element, CardType, Card } from '@/types/card';
import { analyzeImage } from '@/services/ai/imageAnalysis';
import { generateCardFromAnalysis } from '@/services/ai/cardGeneration';
import { ImageStorage } from '@/services/storage/imageStorage';
import { formatEffectDescription } from '@/utils/cardUtils';

// Function to get color class based on card rarity
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

const CreateCard: NextPage = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [generatedCard, setGeneratedCard] = useState<Card | null>(null);
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [isCardSaved, setIsCardSaved] = useState<boolean>(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle uploading a card from JSON
  const uploadCardFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if it's a JSON file
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      setError('Selected file must be a JSON file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const cardData = JSON.parse(content);
        
        // Validate that this is a card object
        if (!cardData.id || !cardData.name || !cardData.type || !cardData.element || !cardData.rarity) {
          setError('Invalid card JSON format');
          return;
        }
        
        // Convert date string back to Date object, handling both local and ISO formats
        if (typeof cardData.createdAt === 'string') {
          // Try to parse as local date string first, then fall back to ISO
          const parsedDate = new Date(cardData.createdAt);
          if (!isNaN(parsedDate.getTime())) {
            cardData.createdAt = parsedDate;
          } else {
            // If parsing fails, use current date as fallback
            cardData.createdAt = new Date();
          }
        }
        
        // Set the image if it exists in the JSON
        if (cardData.imageUrl && cardData.imageUrl.startsWith('data:')) {
          setUploadedImage(cardData.imageUrl);
        } else {
          // Clear any existing image
          setUploadedImage(null);
        }
        
        // Set the generated card
        setGeneratedCard(cardData);
        setCardName(cardData.name);
        setError(null);
        
        // Reset the file input to allow selecting the same file again
        if (jsonFileInputRef.current) {
          jsonFileInputRef.current.value = '';
        }
        
      } catch (err) {
        console.error('Error parsing JSON file:', err);
        setError('Error parsing JSON file. Please ensure it is a valid JSON format.');
      }
    };
    
    reader.onerror = () => {
      setError('Error reading the file');
    };
    
    reader.readAsText(file);
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }
    
    setError(null);
    
    // Display preview
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset states
    setGeneratedCard(null);
    setCardName('');
    
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  });
  
  const handleAnalyzeImage = async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Create a progress timer simulation
      const progressTimer = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressTimer);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Call AI service to analyze the image
      const imageAnalysis = await analyzeImage(uploadedImage);
      
      // Generate a card based on the analysis
      const card = await generateCardFromAnalysis(imageAnalysis);
      
      // Complete the progress animation
      clearInterval(progressTimer);
      setAnalysisProgress(100);
      
      // Update state with the generated card
      setGeneratedCard(card);
      
      // Only set card name if the current name is empty or just whitespace
      if (!cardName || cardName.trim() === '') {
        setCardName(card.name);
      }
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
      
    } catch (err: any) {
      console.error('Error in handleAnalyzeImage:', err);
      
      // Show a more specific error message if available
      const errorMessage = err.message 
        ? `Error analyzing image: ${err.message}` 
        : 'Error analyzing image. Please try again.';
      
      setError(errorMessage);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value);
    if (generatedCard) {
      setGeneratedCard({
        ...generatedCard,
        name: e.target.value
      });
    }
  };
  
  const handleSaveCard = async () => {
    if (!generatedCard || !uploadedImage || isCardSaved) return;
    
    try {
      // Compress the image before saving to reduce storage size
      let imageToSave = uploadedImage;
      try {
        // Try to compress the image to reduce storage size
        // Use a smaller width for card images to save space (400px is sufficient for cards)
        imageToSave = await ImageStorage.compressImage(uploadedImage, 400, 0.85);
      } catch (compressErr) {
        console.warn('Error compressing image:', compressErr);
        // Continue with original image if compression fails
      }
      
      // Update the generated card to include the uploaded image URL
      const cardToSave = {
        ...generatedCard,
        imageUrl: imageToSave // Store the base64 image directly in the card
      };
      
      // Mark card as saved
      setIsCardSaved(true);
      
      // Get existing cards from localStorage
      const existingCards = JSON.parse(localStorage.getItem('ai_card_game_cards') || '[]');
      
      // Add the new card to the collection
      const updatedCards = [...existingCards, cardToSave];
      
      // Save updated collection back to localStorage
      localStorage.setItem('ai_card_game_cards', JSON.stringify(updatedCards));
      
      // Also save image to IndexedDB for potential future optimization
      try {
        await ImageStorage.saveImageToIndexedDB(cardToSave.id, imageToSave);
      } catch (imgErr) {
        // Just log the error but continue, as the image is already saved in the card
        console.warn('Error saving image to IndexedDB:', imgErr);
      }
      
      // Show success message with link to collection
      setSaveStatus({
        message: 'Card saved to your collection! Click here to view your cards.',
        type: 'success'
      });
      
    } catch (error) {
      console.error('Error saving card:', error);
      setSaveStatus({
        message: 'Failed to save card. Please try again.',
        type: 'error'
      });
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-title text-center mb-8 text-white">
          Create Your Custom Card
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Upload and Analysis */}
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h3 className="text-xl font-title mb-4 text-white">Upload Image</h3>
            
            {/* Dropzone */}
            <div 
              {...getRootProps()} 
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-6
                ${isDragActive ? 'border-blue-400 bg-blue-900 bg-opacity-10' : 'border-gray-600'}
                ${error ? 'border-red-500' : ''}
                hover:border-blue-400 hover:bg-blue-900 hover:bg-opacity-10
                transition-colors duration-200
              `}
            >
              <input {...getInputProps()} />
              
              {uploadedImage ? (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Preview" 
                    className="mx-auto max-h-64 rounded" 
                  />
                  <p className="mt-2 text-gray-400">Click or drag to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-300 mb-2">
                    {isDragActive ? 'Drop the image here' : 'Drag & drop an image here, or click to select'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Supports JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <p className="text-red-500 text-center mb-4">{error}</p>
            )}
            
            {/* Import Card from JSON */}
            <div className="text-center mb-4">
              <input
                ref={jsonFileInputRef}
                type="file"
                accept=".json"
                onChange={uploadCardFromJSON}
                className="hidden"
                id="json-upload"
              />
              <button
                onClick={() => jsonFileInputRef.current?.click()}
                className="w-full py-2 px-4 mb-4 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Import Card from JSON
              </button>
            </div>

            {/* Analysis Button */}
            <div className="text-center">
              <Button 
                onClick={handleAnalyzeImage}
                disabled={!uploadedImage || isAnalyzing}
                isLoading={isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
              </Button>
              
              {/* Progress bar */}
              {isAnalyzing && (
                <div className="mt-4">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <motion.div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      initial={{ width: '0%' }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-gray-400 mt-2 text-sm">
                    {analysisProgress < 100 
                      ? 'AI is analyzing your image...' 
                      : 'Analysis complete!'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column: Card Preview */}
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h3 className="text-xl font-title mb-4 text-white">Card Preview</h3>
            
            {generatedCard ? (
              <div>
                {/* Card Preview Component */}
                <div className="flex justify-center mb-6">
                  {/* Card preview with element-based border */}
                  <div className={`card-preview relative w-80 h-96 border-4 rounded-lg overflow-hidden
                    ${generatedCard.element === 'aurora' ? 'border-purple-400' : ''}
                    ${generatedCard.element === 'void' ? 'border-gray-900' : ''}
                    ${generatedCard.element === 'crystal' ? 'border-fuchsia-600' : ''}
                    ${generatedCard.element === 'blood' ? 'border-red-800' : ''}
                    ${generatedCard.element === 'storm' ? 'border-amber-400' : ''}
                    ${generatedCard.element === 'flora' ? 'border-emerald-600' : ''}
                    ${generatedCard.element === 'aether' ? 'border-indigo-600' : ''}
                  `}>
                    {uploadedImage && (
                      <img 
                        src={uploadedImage} 
                        alt="Card" 
                        className="w-full h-1/2 object-cover" 
                      />
                    )}
                    <div className="p-4 bg-gray-900 h-1/2 overflow-y-auto">
                      <input
                        type="text"
                        value={cardName}
                        onChange={handleNameChange}
                        className="bg-transparent border-b border-gray-600 text-xl text-white font-title w-full mb-2 focus:outline-none focus:border-blue-500"
                        placeholder="Card Name"
                      />
                      
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Type:</span> {generatedCard.type}
                        </div>
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Element:</span> {generatedCard.element}
                        </div>
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Rarity:</span> <span className={getRarityTextColor(generatedCard.rarity)}>{generatedCard.rarity}</span>
                        </div>
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Mana:</span> {generatedCard.stats.manaCost}
                        </div>
                      </div>
                      
                      <div className="stats grid grid-cols-2 gap-2 mb-4">
                        <div className="text-white text-sm">
                          HP: {generatedCard.stats.health}
                        </div>
                        <div className="text-white text-sm">
                          ATK: {generatedCard.stats.attack}
                        </div>
                        <div className="text-white text-sm">
                          DEF: {generatedCard.stats.defense}
                        </div>
                        <div className="text-white text-sm">
                          SPD: {generatedCard.stats.speed}
                        </div>
                      </div>
                      
                      <p className="text-gray-300 text-xs leading-relaxed">
                        {generatedCard.description}
                      </p>
                      
                      {/* View Details Button */}
                      <button 
                        className="mt-2 w-full py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowCardDetails(true);
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Card Details Modal */}
                {showCardDetails && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-gray-700">
                        <button 
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => setShowCardDetails(false)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        <h3 className="text-2xl font-title text-white mb-4 pr-8">{generatedCard.name}</h3>
                        
                        {uploadedImage && (
                          <div className="mb-4 relative h-32 w-full">
                            <img 
                              src={uploadedImage} 
                              alt="Card" 
                              className="absolute w-full h-full object-contain" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-gray-400 text-sm">Type</h4>
                            <p className="text-white capitalize">{generatedCard.type}</p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Element</h4>
                            <p className="text-white capitalize flex items-center gap-1">
                              {generatedCard.element} {generatedCard.element && 
                                {
                                  'aurora': '🌈',
                                  'void': '⚫',
                                  'crystal': '💎',
                                  'blood': '🩸',
                                  'storm': '⚡',
                                  'flora': '🌿',
                                  'aether': '🔮'
                                }[generatedCard.element]
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Rarity</h4>
                            <p className={`capitalize ${getRarityTextColor(generatedCard.rarity)}`}>{generatedCard.rarity}</p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Mana Cost</h4>
                            <p className="text-white">{generatedCard.stats.manaCost}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-gray-400 text-sm">Health</h4>
                            <p className="text-white">{generatedCard.stats.health}</p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Attack</h4>
                            <p className="text-white">{generatedCard.stats.attack}</p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Defense</h4>
                            <p className="text-white">{generatedCard.stats.defense}</p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Speed</h4>
                            <p className="text-white">{generatedCard.stats.speed}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="text-gray-400 text-sm mb-2">Description</h4>
                          <p className="text-white leading-relaxed">{generatedCard.description}</p>
                        </div>
                        
                        {generatedCard.effects && generatedCard.effects.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-gray-400 text-sm mb-3">Effects</h4>
                            <div className="space-y-3">
                              {generatedCard.effects.map((effect, index) => (
                                <div key={index} className="bg-gray-700 p-3 rounded-lg">
                                  <p className="text-yellow-400 text-sm font-semibold mb-1">{effect.name}</p>
                                  <p className="text-white text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatEffectDescription(effect.description) }}></p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {generatedCard.lore && (
                          <div className="mb-4">
                            <h4 className="text-gray-400 text-sm mb-2">Lore</h4>
                            <p className="text-gray-300 italic text-sm leading-relaxed">{generatedCard.lore}</p>
                          </div>
                        )}
                        
                        {/* Card Mood */}
                        {generatedCard.mood && (
                          <div className="mb-4">
                            <h4 className="text-gray-400 text-sm mb-2">Mood</h4>
                            <p className="text-white text-sm">
                              {typeof generatedCard.mood === 'string' ? 
                                generatedCard.mood.charAt(0).toUpperCase() + generatedCard.mood.slice(1) : 
                                'Unknown'}
                            </p>
                          </div>
                        )}
                        
                        {/* Card Colors */}
                        {generatedCard.dominantColors && generatedCard.dominantColors.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-gray-400 text-sm mb-2">Colors</h4>
                            <div className="flex flex-wrap gap-1">
                              {generatedCard.dominantColors.map((color: string, index: number) => (
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
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Save Button */}
                <div className="text-center">
                  <Button 
                    onClick={handleSaveCard} 
                    size="lg"
                    disabled={isCardSaved}
                    className={isCardSaved ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {isCardSaved ? "Card Saved ✓" : "Save to Collection"}
                  </Button>
                  
                  {/* Status Message with Link to Cards Page */}
                  {saveStatus && (
                    <a 
                      href="/cards" 
                      className={`mt-4 p-2 rounded text-white block hover:brightness-110 transition-all ${
                        saveStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {saveStatus.message}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
                <p>Upload an image and click "Analyze Image" to generate your custom card</p>
                <p className="mt-4 text-sm">
                  The AI will analyze the content of your image to create appropriate stats and abilities
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateCard;
