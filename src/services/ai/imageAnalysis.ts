import { AIAnalysisResult } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';
import { getImageAnalysisError, getChatbotOverloadAnalysis } from '@/data/defaultCards/errorCards';
import { generateImageAnalysisPrompt } from '@/services/ai/descriptionGenerator';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Normalizes the analysis response to ensure consistent format
 */
function normalizeAnalysisResponse(response: AIAnalysisResult | Record<string, unknown>): AIAnalysisResult {
  // Make a copy to avoid modifying the original
  const result = { ...(response as AIAnalysisResult) };
  
  // Normalize objectsDetected to ensure we have a proper main subject name
  if (!result.objectsDetected || !Array.isArray(result.objectsDetected) || result.objectsDetected.length === 0) {
    result.objectsDetected = ["Mysterious Entity"];
  } else {
    // Make sure objectsDetected items are full strings, not just single characters
    result.objectsDetected = result.objectsDetected.map((item: string | unknown) => {
      if (typeof item === 'string') {
        if (item.length <= 1) {
          console.warn(`Found suspicious short name in objectsDetected: "${item}"`);
          return "Unknown Card";
        }
        return item;
      }
      return String(item); // Convert non-string values to strings
    });
  }
  
  // Handle suggestedEffects that might be strings or objects with wrong format
  if (result.suggestedEffects) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result.suggestedEffects = result.suggestedEffects.map((effect: any) => {
      // If effect is a string, convert to proper format
      if (typeof effect === 'string') {
        return {
          id: uuidv4(),
          name: effect.split(':')[0] || 'Effect',
          description: effect,
          effectType: 'buff', // Default values
          effectCategory: 'utility',
          targetType: 'self'
        };
      }
      
      const normalizedEffect = { ...effect };
      
      if (!normalizedEffect.id) {
        normalizedEffect.id = uuidv4();
      }
      
      // If name is missing or is the beginning of the description (wrong AI output format),
      // assign a meaningful, concise name
      if (!normalizedEffect.name || 
          (normalizedEffect.description && 
           normalizedEffect.description.startsWith(normalizedEffect.name + ':'))) {
        // Create a short, descriptive name
        normalizedEffect.name = 'Effect';
      }
      
      if (!normalizedEffect.description && normalizedEffect.name) {
        normalizedEffect.description = normalizedEffect.name;
      } else if (!normalizedEffect.description) {
        normalizedEffect.description = 'No description available';
      }
      
      // Ensure effect type, category and target are valid
      normalizedEffect.effectType = normalizedEffect.effectType || 'buff';
      normalizedEffect.effectCategory = normalizedEffect.effectCategory || 'utility';
      normalizedEffect.targetType = normalizedEffect.targetType || 'self';
      
      return normalizedEffect;
    });
  } else {
    result.suggestedEffects = [{
      id: uuidv4(),
      name: 'Default Effect',
      description: 'No effects were provided for this card.',
      effectType: 'buff',
      effectCategory: 'utility',
      targetType: 'self'
    }];
  }
  
  // Normalize dominantColors to ensure they are valid hex color codes
  if (!result.dominantColors || !Array.isArray(result.dominantColors)) {
    result.dominantColors = ['#888888']; // Default gray color
  } else {
    result.dominantColors = result.dominantColors.map((color: string | unknown) => {
      if (typeof color === 'string') {
        // Check if it's already a valid hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
          return color;
        }
        // Try to convert common color names to hex
        const colorMap: { [key: string]: string } = {
          'red': '#FF0000',
          'green': '#00FF00',
          'blue': '#0000FF',
          'yellow': '#FFFF00',
          'cyan': '#00FFFF',
          'magenta': '#FF00FF',
          'black': '#000000',
          'white': '#FFFFFF',
          'orange': '#FFA500',
          'purple': '#800080',
          'brown': '#A52A2A',
          'pink': '#FFC0CB',
          'gray': '#808080',
          'grey': '#808080'
        };
        
        const lowerColor = color.toLowerCase().trim();
        if (colorMap[lowerColor]) {
          return colorMap[lowerColor];
        }
        
        // If it's not a valid hex or known color name, return default
        console.warn(`Invalid color format: "${color}", using default`);
        return '#888888';
      }
      return '#888888'; // Default for non-string values
    });
    
    // Ensure we have at least one color
    if (result.dominantColors.length === 0) {
      result.dominantColors = ['#888888'];
    }
  }
  
  return result as AIAnalysisResult;
}

// Your Gemini API key
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

/**
 * Analyzes an uploaded image using the Gemini API to determine 
 * card characteristics based on image content
 */
export async function analyzeImage(imageBase64: string): Promise<AIAnalysisResult> {
  try {
    if (!API_KEY) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set');
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096
      }
    });

    // Override console methods temporarily to prevent API key leakage in logs
    const originalFetch = global.fetch;
    global.fetch = async (...args) => {
      return originalFetch(...args);
    };

    // Prepare the image data
    const imageData = imageBase64.startsWith('data:') 
      ? imageBase64.split(',')[1] 
      : imageBase64;

    // Generate content with the model
    const result = await model.generateContent([
      generateImageAnalysisPrompt(),
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageData
        }
      }
    ]);

    const response = await result.response;
    const textContent = response.text();
    
    if (!textContent) {
      console.error('No text content found in API response');
      throw new Error('No text content in API response');
    }
    
    let jsonResponse: AIAnalysisResult;
    
    try {
      // Remove markdown code blocks if present
      let cleanedText = textContent.trim();
      
      // Remove ```json and ``` markers
      cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      // Try to find JSON object
      let jsonString = cleanedText;
      
      // If response doesn't start with {, try to find the first {
      if (!jsonString.trim().startsWith('{')) {
        const startIndex = jsonString.indexOf('{');
        if (startIndex !== -1) {
          jsonString = jsonString.substring(startIndex);
        }
      }
      
      // Check if JSON is incomplete (missing closing braces)
      const openBraces = (jsonString.match(/\{/g) || []).length;
      const closeBraces = (jsonString.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        // JSON is incomplete, try to fix it
        console.warn('Incomplete JSON detected, attempting to fix...');
        
        // Close any incomplete string values
        if (jsonString.match(/"[^"]*$/)) {
          jsonString += '"';
        }
        
        // Add missing closing braces
        const missingBraces = openBraces - closeBraces;
        jsonString += '\n'.repeat(missingBraces) + '}'.repeat(missingBraces);
      }
      
      try {
        jsonResponse = JSON.parse(jsonString);
        
        // Process and fix the response format if needed
        jsonResponse = normalizeAnalysisResponse(jsonResponse);
        
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Try to clean the JSON string
        const cleanedJson = jsonString.replace(/[\u0000-\u001F]+/g, ' ')
                                      .replace(/\s+/g, ' ')
                                      .replace(/",\s*}/g, '"}')
                                      .replace(/",\s*]/g, '"]');
        jsonResponse = JSON.parse(cleanedJson);
        
        // Process and fix the response format
        jsonResponse = normalizeAnalysisResponse(jsonResponse);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Full response text:', textContent);
      console.error('Response length:', textContent.length);
      throw new Error('Failed to parse image analysis results');
    }

    return jsonResponse;

  } catch (error) {
    console.error('Error in image analysis:', error);
    
    // Return fallback data from centralized error cards
    // This prevents the UI from crashing and shows a helpful message
    return getImageAnalysisError();
  }
}
