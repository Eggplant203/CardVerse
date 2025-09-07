import React from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { analyzeImage } from '@/services/ai/imageAnalysis';
import { ImageStorage } from '@/services/storage/imageStorage';
import { AIAnalysisResult } from '@/types/api';

interface CardCreationProps {
  onImageAnalyzed: (result: AIAnalysisResult, imageBase64: string) => void;
  isAnalyzing: boolean;
}

const CardCreation: React.FC<CardCreationProps> = ({
  onImageAnalyzed,
  isAnalyzing
}) => {
  const [uploadedImage, setUploadedImage] = React.useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10485760, // 10MB
    onDrop: handleImageDrop,
    disabled: isAnalyzing
  });

  // Handle image drop
  async function handleImageDrop(acceptedFiles: File[]) {
    try {
      // Reset states
      setError(null);
      setUploadProgress(10);
      
      // Check if there are files
      if (acceptedFiles.length === 0) {
        setError('No files were uploaded. Please try again.');
        return;
      }
      
      const file = acceptedFiles[0];
      
      // Convert to base64
      setUploadProgress(30);
      const base64Image = await ImageStorage.fileToBase64(file);
      
      // Compress the image
      setUploadProgress(50);
      const compressedImage = await ImageStorage.compressImage(base64Image);
      
      // Update the preview
      setUploadedImage(compressedImage);
      setUploadProgress(70);
      
      // Analyze image with AI
      const analysisResult = await analyzeImage(compressedImage);
      
      // Update progress and call the callback
      setUploadProgress(100);
      onImageAnalyzed(analysisResult, compressedImage);
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try again.');
      setUploadProgress(0);
    }
  }

  return (
    <div className="card-creation-container">
      <h2 className="text-2xl font-title mb-6 text-center">Create Your Card</h2>
      
      {/* Dropzone area */}
      <div 
        className={`dropzone-container border-2 border-dashed rounded-lg p-8 text-center
          ${isDragActive ? 'border-blue-500 bg-blue-50 bg-opacity-10' : 'border-gray-400'}
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        
        {uploadedImage ? (
          <div className="relative w-full h-64">
            <Image
              src={uploadedImage}
              alt="Uploaded card image"
              layout="fill"
              objectFit="contain"
              className="rounded"
            />
          </div>
        ) : (
          <div className="py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-300">
              {isDragActive
                ? "Drop the image here..."
                : "Drag & drop an image here, or click to select"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PNG, JPG or WEBP (max. 10MB)
            </p>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-4 p-2 bg-red-600 bg-opacity-30 text-red-200 rounded text-sm">
          {error}
        </div>
      )}
      
      {/* Processing indicator */}
      {isAnalyzing && (
        <div className="mt-6">
          <p className="text-sm text-center mb-2">
            Analyzing image... Please wait.
          </p>
          <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: `${uploadProgress}%` }}
              animate={{ width: uploadProgress < 100 ? "90%" : "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">
            <p>Our AI is analyzing your image to create a unique card</p>
            <p>This may take up to 15 seconds</p>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
        <h3 className="font-title text-lg mb-2">How It Works</h3>
        <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
          <li>Upload a photo of anything you want to turn into a card</li>
          <li>Our AI analyzes the image content, colors, and composition</li>
          <li>Based on the analysis, your unique card stats and abilities are generated</li>
          <li>Review and customize your card before adding it to your collection</li>
        </ol>
      </div>
    </div>
  );
};

export default CardCreation;
