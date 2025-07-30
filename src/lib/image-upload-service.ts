'use server';

import FormData from 'form-data';

// A simple in-memory index for API key rotation.
// Note: In a stateless serverless environment, this index will reset on each new instance.
// For true round-robin, a more persistent state (like a database or cache) would be needed,
// but this provides basic sequential rotation for a single instance.
let currentApiKeyIndex = 0;

async function attemptUpload(
  base64Image: string,
  apiKey: string
): Promise<{ success: boolean; data?: any; error?: string; status?: number }> {
  try {
    const imageWithoutPrefix = base64Image.split(',').pop();
    if (!imageWithoutPrefix) {
      return { success: false, error: 'Invalid base64 image format' };
    }

    const form = new FormData();
    form.append('image', imageWithoutPrefix);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    
    if (!response.ok || !result.success) {
      const errorMessage = result.error?.message || `ImgBB API Error (HTTP ${response.status})`;
      console.warn(`ImgBB upload failed with key ...${apiKey.slice(-4)}: ${errorMessage}`);
      return { success: false, error: errorMessage, status: response.status };
    }

    return { success: true, data: result.data };
  } catch (error: any) {
    console.error('Network or other error during ImgBB Upload:', error);
    return { success: false, error: error.message || 'An unknown error occurred during image upload.' };
  }
}

export async function uploadImage(
  base64Image: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const apiKeysString = process.env.IMGBB_API_KEY;

  if (!apiKeysString) {
    console.error('ImgBB API keys are not configured in .env');
    return { success: false, error: 'Image hosting is not configured.' };
  }

  const apiKeys = apiKeysString.split(',').map(key => key.trim()).filter(key => key);

  if (apiKeys.length === 0) {
    console.error('No valid ImgBB API keys found in .env');
    return { success: false, error: 'Image hosting keys are invalid.' };
  }

  // Try each key sequentially, starting from the current index
  for (let i = 0; i < apiKeys.length; i++) {
    const keyIndex = (currentApiKeyIndex + i) % apiKeys.length;
    const currentApiKey = apiKeys[keyIndex];

    const result = await attemptUpload(base64Image, currentApiKey);
    
    if (result.success && result.data) {
      // On success, update the index for the next request to use the next key
      currentApiKeyIndex = (keyIndex + 1) % apiKeys.length;
      return { success: true, url: result.data.url };
    }
    // If it fails, the loop will automatically try the next key.
  }

  // If all keys have been tried and failed
  console.error('All ImgBB API keys failed.');
  return { success: false, error: 'All image hosting providers failed. Please try again later.' };
}
