/**
 * Cloudinary Unsigned Image Upload Service
 * High-performance, secure, and direct browser-to-cloud upload utility using XMLHttpRequest
 * to support real-time upload progress reporting.
 */

export interface UploadOptions {
  cloudName?: string;
  uploadPreset?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Uploads a file directly to Cloudinary using unsigned upload preset.
 * Supports image format validation, file size validation, and real-time upload progress.
 * 
 * @param file The image file selected by the user
 * @param options Configurations including optional cloud name, preset, and progress callback
 * @returns Promise resolving to the secure Cloudinary image URL
 */
export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<string> {
  // Use public variables (with safe fallbacks)
  const metaEnv = (import.meta as any).env || {};
  const cloudName = options.cloudName || metaEnv.VITE_CLOUDINARY_CLOUD_NAME || 'dcgtz1nwr';
  const uploadPreset = options.uploadPreset || metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || 'unsigned_upload';

  // 1. Image Format Validation
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  const isAllowedMimetype = file.type.startsWith('image/') && 
    (file.type.endsWith('jpeg') || file.type.endsWith('png') || file.type.endsWith('webp'));
  
  const isAllowedExtension = fileExtension && allowedExtensions.includes(fileExtension);

  if (!isAllowedMimetype && !isAllowedExtension) {
    throw new Error('Invalid file format. Please select a JPG, PNG, or WebP image.');
  }

  // 2. File Size Validation (Max 100MB to allow 50MB+ high-quality wedding photographs)
  const MAX_SIZE_MB = 100;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum allowed size is ${MAX_SIZE_MB}MB.`);
  }

  // 3. Web Standard direct upload via XMLHttpRequest for fine-grained progress feedback
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    xhr.open('POST', uploadUrl, true);

    // Track upload progress
    if (options.onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded * 100) / event.total);
          options.onProgress!(percentComplete);
        }
      };
    }

    // Handle complete response
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            // Cloudinary secure URL is ready and contains correct HTTPS protocols
            resolve(response.secure_url);
          } else {
            reject(new Error('Upload completed but secure URL was not found in response.'));
          }
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response payload.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          const errorMessage = errorResponse.error?.message || `Cloudinary returned status ${xhr.status}`;
          reject(new Error(errorMessage));
        } catch {
          reject(new Error(`Cloudinary upload failed with status code ${xhr.status}`));
        }
      }
    };

    // Handle connection failures
    xhr.onerror = () => {
      reject(new Error('A network network error occurred. Please check your internet connection.'));
    };

    // Package payload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Optional tags for Cloudinary dashboard organization
    formData.append('tags', 'wedding_invitation,user_upload');

    // Fire actual network stream
    xhr.send(formData);
  });
}
