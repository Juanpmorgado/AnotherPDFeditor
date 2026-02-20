/**
 * OCR Processor Module
 * Handles text extraction from scanned PDFs using Tesseract.js
 */

import Tesseract from 'tesseract.js';

const LANG_PATH = import.meta.env.VITE_TESSERACT_LANG_PATH || 'https://tessdata.projectnaptha.com/4.0.0';

/**
 * Create and initialize a Tesseract worker
 * @param {string} language - OCR language (default: 'eng')
 * @returns {Promise<Tesseract.Worker>} Initialized worker
 */
export async function createOCRWorker(language = 'eng') {
  try {
    const worker = await Tesseract.createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      langPath: LANG_PATH,
    });

    await worker.loadLanguage(language);
    await worker.initialize(language);

    return worker;
  } catch (error) {
    console.error('OCR worker creation failed:', error);
    throw error;
  }
}

/**
 * Perform OCR on an image
 * @param {HTMLImageElement|HTMLCanvasElement|string} image - Image source
 * @param {string} language - OCR language
 * @returns {Promise<Object>} OCR results with text and positions
 */
export async function performOCR(image, language = 'eng') {
  let worker;

  try {
    worker = await createOCRWorker(language);

    const { data } = await worker.recognize(image);

    // Structure the results
    const results = {
      text: data.text,
      confidence: data.confidence,
      words: data.words.map((word) => ({
        text: word.text,
        x: word.bbox.x0,
        y: word.bbox.y0,
        width: word.bbox.x1 - word.bbox.x0,
        height: word.bbox.y1 - word.bbox.y0,
        confidence: word.confidence,
      })),
      lines: data.lines.map((line) => ({
        text: line.text,
        x: line.bbox.x0,
        y: line.bbox.y0,
        width: line.bbox.x1 - line.bbox.x0,
        height: line.bbox.y1 - line.bbox.y0,
        confidence: line.confidence,
      })),
    };

    await worker.terminate();
    return results;
  } catch (error) {
    if (worker) {
      await worker.terminate();
    }
    console.error('OCR processing failed:', error);
    throw error;
  }
}

/**
 * Preprocess image for better OCR accuracy
 * @param {ImageData} imageData - Raw image data
 * @returns {ImageData} Processed image data
 */
export function preprocessImage(imageData) {
  const data = imageData.data;

  // Convert to grayscale and increase contrast
  for (let i = 0; i < data.length; i += 4) {
    // Grayscale conversion
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

    // Increase contrast (simple threshold)
    const enhanced = avg > 128 ? 255 : 0;

    data[i] = enhanced;     // R
    data[i + 1] = enhanced; // G
    data[i + 2] = enhanced; // B
  }

  return imageData;
}

/**
 * Batch OCR for multiple images/pages
 * @param {Array} images - Array of image sources
 * @param {string} language - OCR language
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<Array>} Array of OCR results
 */
export async function batchOCR(images, language = 'eng', progressCallback) {
  const results = [];

  for (let i = 0; i < images.length; i++) {
    const result = await performOCR(images[i], language);
    results.push(result);

    if (progressCallback) {
      progressCallback({
        current: i + 1,
        total: images.length,
        progress: (i + 1) / images.length,
      });
    }
  }

  return results;
}

/**
 * Create editable overlay from OCR results
 * @param {Object} ocrResults - OCR results with word positions
 * @param {number} scale - Scale factor for positioning
 * @returns {Array} Array of editable text elements
 */
export function createEditableOverlay(ocrResults, scale = 1) {
  return ocrResults.words
    .filter((word) => word.confidence > 60) // Filter low-confidence words
    .map((word, index) => ({
      id: `ocr-word-${index}`,
      text: word.text,
      x: word.x * scale,
      y: word.y * scale,
      width: word.width * scale,
      height: word.height * scale,
      confidence: word.confidence,
      fontSize: Math.round(word.height * scale * 0.8), // Approximate
      editable: true,
    }));
}
