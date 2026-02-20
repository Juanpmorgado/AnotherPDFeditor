/**
 * Validation Utilities
 */

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB

/**
 * Validate PDF file
 * @param {File} file - File to validate
 * @returns {Object} Validation result {valid, error}
 */
export function validatePDFFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @returns {Object} Validation result {valid, error}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid image format. Use JPG, PNG, GIF, or WebP' };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit for images
    return { valid: false, error: 'Image size exceeds 5MB limit' };
  }

  return { valid: true };
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
