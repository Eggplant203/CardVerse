import { AIAnalysisResult } from '@/types/api';
import { v4 as uuidv4 } from 'uuid';
import { getImageAnalysisError } from '@/data/defaultCards/errorCards';
import { generateImageAnalysisPrompt } from '@/services/ai/descriptionGenerator';

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
const API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

/**
 * Analyzes an uploaded image using the Gemini API to determine 
 * card characteristics based on image content
 */
export async function analyzeImage(imageBase64: string): Promise<AIAnalysisResult> {
  try {
    if (!API_KEY) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set');
    }
    // Prepare the request body
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: generateImageAnalysisPrompt()
            
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.startsWith('data:') 
                      ? imageBase64.split(',')[1] 
                      : imageBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024
      }
    };

    // Make the API call
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // Get more detailed error information
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = JSON.stringify(errorJson);
      } catch {
        // If we can't parse the response as JSON, just use the status text
        errorDetail = response.statusText;
      }
      
      console.error(`API request failed with status: ${response.status}`, errorDetail);
      
      // Return fallback data from centralized error cards
      return getImageAnalysisError();
    }

    const data = await response.json();
    // Check if we have valid candidates
    if (!data.candidates || !data.candidates.length || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Unexpected API response format');
    }
    
    // Parse the AI response
    const textContent = data.candidates[0].content.parts.find((part: { text?: string } | unknown) => (part as { text?: string }).text)?.text;
    
    if (!textContent) {
      console.error('No text content found in API response');
      throw new Error('No text content in API response');
    }
    
    let jsonResponse: AIAnalysisResult;
    
    try {
      // Extract JSON from the response text if needed
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[0];
        
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
      } else {
        console.error('No JSON found in response:', textContent.substring(0, 100));
        throw new Error('No valid JSON found in response');
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response text:', textContent.substring(0, 200));
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
