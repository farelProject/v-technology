'use server';

import FormData from 'form-data';

export async function uploadImage(
  base64Image: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const apiKey = process.env.IMGBB_API_KEY;

  if (!apiKey) {
    console.error('ImgBB API key is not configured.');
    return { success: false, error: 'Image hosting is not configured.' };
  }
  
  try {
    // The base64 string from the browser includes a prefix like 'data:image/png;base64,'
    // We need to remove it before sending it to the API.
    const imageWithoutPrefix = base64Image.split(',').pop();
    if (!imageWithoutPrefix) {
        throw new Error('Invalid base64 image format');
    }

    const form = new FormData();
    form.append('image', imageWithoutPrefix);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to upload image to ImgBB');
    }

    const result = await response.json();

    if (result.success) {
      return { success: true, url: result.data.url };
    } else {
      return { success: false, error: 'ImgBB reported an error.' };
    }
  } catch (error: any) {
    console.error('ImgBB Upload Error:', error);
    return { success: false, error: error.message || 'An unknown error occurred during image upload.' };
  }
}
