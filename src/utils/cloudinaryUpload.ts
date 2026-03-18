/**
 * Cloudinary Upload Utility
 * Handles automatic image upload to Cloudinary for Facebook sharing
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dlqv9npux';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sibol_game_share';

interface CloudinaryResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

/**
 * Upload image blob to Cloudinary
 * Returns the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (blob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('resource_type', 'auto');
    formData.append('tags', 'sibol-game-share');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Get a Cloudinary URL with Open Graph metadata for Facebook sharing
 */
export const getShareableUrl = (imageUrl: string, caption: string): string => {
  // Return the image URL which will be used in the Facebook share dialog
  // Facebook's crawler will automatically fetch the image and display it
  return imageUrl;
};
