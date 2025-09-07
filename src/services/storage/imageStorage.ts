/**
 * Image storage service for handling uploaded images
 */
export class ImageStorage {
  /**
   * Convert file to base64
   */
  public static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to convert file to base64'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Compress image to reduce size
   */
  public static async compressImage(
    base64Image: string,
    maxWidth = 800,
    quality = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = Math.floor(height * maxWidth / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = base64Image;
    });
  }

  /**
   * Save image to IndexedDB for offline use
   */
  public static async saveImageToIndexedDB(
    cardId: string,
    imageBase64: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
          console.error('IndexedDB not supported');
          resolve(false);
          return;
        }
        
        const request = window.indexedDB.open('CardGame', 1);
        
        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          resolve(false);
        };
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object store if it doesn't exist
          if (!db.objectStoreNames.contains('images')) {
            db.createObjectStore('images', { keyPath: 'id' });
          }
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          const transaction = db.transaction(['images'], 'readwrite');
          const store = transaction.objectStore('images');
          
          const addRequest = store.put({
            id: cardId,
            image: imageBase64,
            timestamp: new Date().getTime()
          });
          
          addRequest.onsuccess = () => {
            resolve(true);
          };
          
          addRequest.onerror = () => {
            console.error('Failed to save image to IndexedDB');
            resolve(false);
          };
        };
      } catch (error) {
        console.error('Error saving image to IndexedDB:', error);
        resolve(false);
      }
    });
  }

  /**
   * Get image from IndexedDB
   */
  public static async getImageFromIndexedDB(cardId: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
          console.error('IndexedDB not supported');
          resolve(null);
          return;
        }
        
        const request = window.indexedDB.open('CardGame', 1);
        
        request.onerror = () => {
          console.error('Failed to open IndexedDB');
          resolve(null);
        };
        
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          try {
            const transaction = db.transaction(['images'], 'readonly');
            const store = transaction.objectStore('images');
            
            const getRequest = store.get(cardId);
            
            getRequest.onsuccess = () => {
              if (getRequest.result) {
                resolve(getRequest.result.image);
              } else {
                resolve(null);
              }
            };
            
            getRequest.onerror = () => {
              console.error('Failed to get image from IndexedDB');
              resolve(null);
            };
          } catch (error) {
            console.error('Error in transaction:', error);
            resolve(null);
          }
        };
      } catch (error) {
        console.error('Error getting image from IndexedDB:', error);
        resolve(null);
      }
    });
  }
}
