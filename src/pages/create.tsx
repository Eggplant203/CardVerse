import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { Rarity, Card, CardType } from '@/types/card';
import { HIDDEN_CARDS } from '@/data/defaultCards';
import { analyzeImage } from '@/services/ai/imageAnalysis';
import { generateCardFromAnalysis } from '@/services/ai/cardGeneration';
import { ImageStorage } from '@/services/storage/imageStorage';
import { formatEffectDescription, getElementHexColor, getCardTypeHexColor } from '@/utils/cardUtils';
import { useAuth } from '@/context/AuthContext';
import { CardAPI } from '@/services/api/cardAPI';

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
  const auth = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [generatedCard, setGeneratedCard] = useState<Card | null>(null);
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [isCardSaved, setIsCardSaved] = useState<boolean>(false);
  const [isSavingCard, setIsSavingCard] = useState<boolean>(false);
  const [analysisLimitReached, setAnalysisLimitReached] = useState<boolean>(false);
  const [authUpdateKey, setAuthUpdateKey] = useState(0);
  const [isLoadingRandomImage, setIsLoadingRandomImage] = useState(false);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  // Reset guest analysis count when user logs in
  useEffect(() => {
    if (!auth.isGuestMode && auth.isAuthenticated) {
      // User has logged in, reset the guest analysis count
      localStorage.removeItem('cardverse_guest_analysis_count');
      setAnalysisLimitReached(false);
      setError(null); // Clear any limit-related errors
      setAuthUpdateKey(prev => prev + 1); // Force re-render
    }
  }, [auth.isGuestMode, auth.isAuthenticated]);

  // Update analysis limit status based on current state
  useEffect(() => {
    if (!auth.isGuestMode) {
      // Not in guest mode, no limit
      setAnalysisLimitReached(false);
      setError(null); // Clear any limit-related errors
    } else {
      // In guest mode, check current count
      const GUEST_ANALYSIS_COUNT_KEY = 'cardverse_guest_analysis_count';
      const currentCount = parseInt(localStorage.getItem(GUEST_ANALYSIS_COUNT_KEY) || '0', 10);
      setAnalysisLimitReached(currentCount >= 5);
    }
  }, [auth.isGuestMode, auth.isAuthenticated, auth.user, authUpdateKey]);

  // Initialize analysis limit status on component mount
  useEffect(() => {
    if (!auth.isGuestMode) {
      setAnalysisLimitReached(false);
    } else {
      const GUEST_ANALYSIS_COUNT_KEY = 'cardverse_guest_analysis_count';
      const currentCount = parseInt(localStorage.getItem(GUEST_ANALYSIS_COUNT_KEY) || '0', 10);
      setAnalysisLimitReached(currentCount >= 5);
    }
  }, [authUpdateKey, auth.isGuestMode]); // Also depend on authUpdateKey and auth.isGuestMode

  // Force update when auth state changes
  useEffect(() => {
    setAuthUpdateKey(prev => prev + 1);
  }, [auth.isGuestMode, auth.isAuthenticated]);

  // Helper function to check and increment guest analysis count
  const checkGuestAnalysisLimit = (): boolean => {
    if (!auth.isGuestMode) return false; // Not guest, no limit
    
    const GUEST_ANALYSIS_COUNT_KEY = 'cardverse_guest_analysis_count';
    const currentCount = parseInt(localStorage.getItem(GUEST_ANALYSIS_COUNT_KEY) || '0', 10);
    
    if (currentCount >= 5) {
      setAnalysisLimitReached(true);
      return true; // Limit reached
    }
    
    // Increment count
    localStorage.setItem(GUEST_ANALYSIS_COUNT_KEY, (currentCount + 1).toString());
    return false; // Can proceed
  };

  // Helper function to get current guest analysis count
  const getGuestAnalysisCount = (): number => {
    if (!auth.isGuestMode) return 0;
    const GUEST_ANALYSIS_COUNT_KEY = 'cardverse_guest_analysis_count';
    return parseInt(localStorage.getItem(GUEST_ANALYSIS_COUNT_KEY) || '0', 10);
  };

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
        if (cardData.imageUrl) {
          if (cardData.imageUrl.startsWith('data:')) {
            // Handle base64 image data
            setUploadedImage(cardData.imageUrl);
          } else if (cardData.imageUrl.startsWith('/')) {
            // Handle local image path (like hidden cards)
            setUploadedImage(cardData.imageUrl);
          } else {
            // Clear any existing image for other cases
            setUploadedImage(null);
          }
        } else {
          // Clear any existing image
          setUploadedImage(null);
        }
        
        // Set the generated card
        setGeneratedCard(cardData);
        setCardName(cardData.name);
        setError(null);
        
        // Reset save state to allow saving the uploaded card
        setIsCardSaved(false);
        setSaveStatus(null);
        
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
    setIsCardSaved(false);
    setSaveStatus(null);
    
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
    
    // Check guest analysis limit
    if (checkGuestAnalysisLimit()) {
      setError('You have reached the limit of 5 image analyses as a guest. Please log in or create an account to continue.');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null); // Clear any previous errors
    
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
      
      // Always update card name with the generated card's name
      setCardName(card.name);
      
      // Reset save state since this is a new card
      setIsCardSaved(false);
      setSaveStatus(null);
      
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
      }, 500);
      
    } catch (err: unknown) {
      console.error('Error in handleAnalyzeImage:', err);
      
      // Show a more specific error message if available
      const errorMessage = (err as Error).message
        ? `Error analyzing image: ${(err as Error).message}` 
        : 'Error analyzing image. Please try again.';
      
      setError(errorMessage);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const handleRandomImage = async () => {
    setError(null);
    setIsLoadingRandomImage(true);
    try {
      // Use a random image from picsum.photos with appropriate dimensions (320x192 for card aspect ratio)
      const randomId = Math.floor(Math.random() * 1000);
      const imageUrl = `https://picsum.photos/500/500?random=${randomId}`;
      
      // Fetch the image and convert to base64 for consistency with uploaded images
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        // Reset states
        setGeneratedCard(null);
        setCardName('');
        setIsCardSaved(false);
        setSaveStatus(null);
        setIsLoadingRandomImage(false);
      };
      
      reader.readAsDataURL(blob);
    } catch (err: unknown) {
      console.error('Error fetching random image:', err);
      setError('Failed to load random image. Please try again.');
      setIsLoadingRandomImage(false);
    }
  };  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value);
    if (generatedCard) {
      setGeneratedCard({
        ...generatedCard,
        name: e.target.value
      });
    }
  };
  
  const handleSaveCard = async () => {
    if (!generatedCard || !uploadedImage || isCardSaved || isSavingCard) return;
    
    setIsSavingCard(true);
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
      
      // Check for easter egg - Dynamic hidden card detection
      let finalCardToSave = cardToSave;
      const upperCardName = cardName.trim().toUpperCase();

      // Create a mapping from trigger names to hidden card keys
      const triggerMapping: Record<string, keyof typeof HIDDEN_CARDS> = {
        'EGGPLANT STUDIO': 'EGGPLANT_STUDIO',
        '???': 'MYSTERY',
        'NULL': 'NULL'
      };

      // Check if the entered name matches any trigger
      const hiddenCardKey = triggerMapping[upperCardName];

      if (hiddenCardKey && HIDDEN_CARDS[hiddenCardKey]) {
        // Check if user already has this hidden card
        const hasCardResult = await CardAPI.hasHiddenCard(auth.user?.id || null, HIDDEN_CARDS[hiddenCardKey].name, auth.isGuestMode);

        if (hasCardResult.success && hasCardResult.data) {
          // User already has this hidden card
          setSaveStatus({
            message: `❌ You already have "${HIDDEN_CARDS[hiddenCardKey].name}" in your collection! Each hidden card can only be obtained once.`,
            type: 'error'
          });
          setIsSavingCard(false);
          return;
        }

        // Replace with the corresponding hidden card
        finalCardToSave = {
          ...HIDDEN_CARDS[hiddenCardKey],
          id: `hidden-${Date.now()}`, // Generate unique ID
          createdAt: new Date(),
          createdBy: auth.user?.id || 'guest'
        };
      }
      
      // Save the card using the API service (handles both localStorage and database)
      const result = await CardAPI.saveCard(auth.user?.id || null, finalCardToSave, auth.isGuestMode);
      
      if (result.success) {
        // Mark card as saved only after successful save
        setIsCardSaved(true);

        // Create mapping for success messages
        const successMessages: Record<string, string> = {
          'EGGPLANT STUDIO': '🎉 Congratulations! You found the Easter Egg! The Eggplant Overlord has joined your collection!',
          '???': '❓ MYSTERY UNLOCKED! The enigmatic ??? has appeared! What secrets does it hold?',
          'NULL': '🕳️ VOID AWAKENED! Null has emerged from the emptiness! All effects tremble before it!'
        };

        // Check if this was a hidden card trigger
        const successMessage = successMessages[upperCardName];

        if (successMessage) {
          setSaveStatus({
            message: successMessage,
            type: 'success'
          });
        } else {
          setSaveStatus({
            message: 'Card saved successfully! Click here to view your saved cards',
            type: 'success'
          });
        }
      } else {
        setSaveStatus({
          message: result.error?.message || 'Failed to save card',
          type: 'error'
        });
        setIsCardSaved(false); // Allow retry
      }
      
      // Also save image to IndexedDB for potential future optimization
      try {
        await ImageStorage.saveImageToIndexedDB(finalCardToSave.id, imageToSave);
      } catch (imgErr) {
        // Just log the error but continue, as the image is already saved in the card
        console.warn('Error saving image to IndexedDB:', imgErr);
      }
      
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
    } finally {
      setIsSavingCard(false);
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
                  <Image 
                    src={uploadedImage} 
                    alt="Preview" 
                    width={256}
                    height={256}
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
            <div className="flex justify-center items-center gap-2 mb-4">
              <Button 
                onClick={handleAnalyzeImage}
                disabled={!uploadedImage || isAnalyzing || isLoadingRandomImage}
                isLoading={isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
              </Button>
              
              {/* Random Image Button */}
              <button
                onClick={handleRandomImage}
                disabled={isAnalyzing || isLoadingRandomImage}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[3rem] min-h-[3rem]"
                title="Load Random Image"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform duration-1000 ${isLoadingRandomImage ? 'animate-spin' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Progress bar */}
            {isAnalyzing && (
              <div className="mt-4 text-center">
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
            
            {/* Guest Analysis Limit Warning */}
            {auth.isGuestMode && (
              <div className="mt-4 p-4 bg-yellow-900 bg-opacity-50 rounded-lg border border-yellow-600">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-yellow-400 font-semibold">Guest Mode Limit</p>
                </div>
                <div className="text-center">
                  <p className="text-yellow-200 text-sm mb-3">
                    As a guest, you can analyze up to 5 images. After that, you&apos;ll need to log in or create an account to continue.
                    <br />
                    <span className="font-semibold text-yellow-300">
                      {getGuestAnalysisCount()}/5 analyses used
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right column: Card Preview */}
          <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6">
            <h3 className="text-xl font-title mb-4 text-white">Card Preview</h3>
            
            {generatedCard ? (
              <div>
                {/* Card Preview Component */}
                <div className="flex justify-center mb-6">
                  {/* Card preview with element-based border */}
                  <div className="card-preview relative w-80 h-96 border-4 rounded-lg overflow-hidden" style={{borderColor: getElementHexColor(generatedCard.element)}}>
                    {/* Display image based on card type */}
                    {((generatedCard.type === CardType.ERROR && generatedCard.imageUrl) || uploadedImage) && (
                      <div className="relative w-full h-1/2">
                        <Image 
                          src={generatedCard.type === CardType.ERROR ? generatedCard.imageUrl! : uploadedImage!} 
                          alt="Card" 
                          fill
                          className="absolute w-full h-full object-cover" 
                        />
                        {/* Semi-transparent element overlay on top of the image */}
                        <div className="absolute inset-0 opacity-5" style={{ backgroundColor: getElementHexColor(generatedCard.element) }}></div>
                      </div>
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
                          <span className="text-gray-500">Type:</span> <span className="capitalize font-bold" style={{color: getCardTypeHexColor(generatedCard.type as CardType)}}>{generatedCard.type}</span>
                        </div>
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Element:</span> <span className="capitalize font-bold" style={{color: getElementHexColor(generatedCard.element)}}>{generatedCard.element}</span>
                        </div>
                        <div className="text-gray-300 text-sm">
                          <span className="text-gray-500">Rarity:</span> <span className={`capitalize font-bold ${getRarityTextColor(generatedCard.rarity)}`}>{generatedCard.rarity}</span>
                        </div>
                      </div>
                      
                      <div className="stats grid grid-cols-2 gap-2 mb-4">
                        <div className="text-white text-sm">
                          HP: {generatedCard.stats.health}
                        </div>
                        <div className="text-white text-sm">
                          ATK: {generatedCard.stats.attack}
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
                            <Image 
                              src={uploadedImage} 
                              alt="Card" 
                              fill
                              className="absolute w-full h-full object-contain" 
                            />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="text-gray-400 text-sm">Type</h4>
                            <p className="text-white capitalize flex items-center gap-1">
                              <span className="capitalize font-bold" style={{color: getCardTypeHexColor(generatedCard.type as CardType)}}>{generatedCard.type}</span> {generatedCard.type && 
                                {
                                  'creature': '🐉',
                                  'spell': '✨',
                                  'artifact': '🏺',
                                  'equipment': '⚔️',
                                  'location': '🏔️',
                                  'totem': '🗿',
                                  'summon': '📯',
                                  'entity': '👻',
                                  'vehicle': '🚀',
                                  'hidden': '🎭',
                                  'error': '⚠️'
                                }[generatedCard.type]
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="text-gray-400 text-sm">Element</h4>
                            <p className="text-white capitalize flex items-center gap-1">
                              <span className="capitalize font-bold" style={{color: getElementHexColor(generatedCard.element)}}>{generatedCard.element}</span> {generatedCard.element && 
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
                            <p className={`capitalize font-bold ${getRarityTextColor(generatedCard.rarity)}`}>{generatedCard.rarity}</p>
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
                    disabled={isCardSaved || isSavingCard}
                    isLoading={isSavingCard}
                    className={isCardSaved ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    {isCardSaved ? "Card Saved ✓" : (isSavingCard ? "Saving..." : "Save to Collection")}
                  </Button>
                  
                  {/* Status Message with Link to Cards Page */}
                  {saveStatus && (
                    <Link 
                      href="/cards" 
                      className={`mt-4 p-2 rounded text-white block hover:brightness-110 transition-all ${
                        saveStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {saveStatus.message.includes('Click here') ? (
                        <>
                          Card saved successfully! <span className="underline">Click here</span> to view your saved cards
                        </>
                      ) : (
                        saveStatus.message
                      )}
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
                <p>Upload an image and click &quot;Analyze Image&quot; to generate your custom card</p>
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
