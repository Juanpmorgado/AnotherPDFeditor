/**
 * PDF Loader Module
 * Handles loading and rendering PDFs using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB default

/**
 * Load a PDF from a file
 * @param {File} file - The PDF file to load
 * @returns {Promise<PDFDocumentProxy>} PDF document
 */
export async function loadPDF(file) {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Convert to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    return pdf;
  } catch (error) {
    console.error('PDF loading failed:', error);
    throw error;
  }
}

/**
 * Render a PDF page to a canvas
 * @param {PDFPageProxy} page - The PDF page to render
 * @param {HTMLCanvasElement} canvas - The canvas element
 * @param {number} scale - Scale factor (default: 1.5)
 * @returns {Promise<void>}
 */
export async function renderPage(page, canvas, scale = 1.5) {
  try {
    const viewport = page.getViewport({ scale });
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error('Page rendering failed:', error);
    throw error;
  }
}

/**
 * Extract text content with positioning from a page
 * @param {PDFPageProxy} page - The PDF page
 * @param {number} scale - The scale factor to apply to coordinates (default: 1.0)
 * @returns {Promise<Array>} Array of text items with positions
 */
export async function extractTextWithPositions(page, scale = 1.0) {
  try {
    const textContent = await page.getTextContent();

    return textContent.items.map((item) => ({
      text: item.str,
      // Scaled coordinates (for canvas display)
      x: item.transform[4] * scale,
      y: item.transform[5] * scale,
      width: item.width * scale,
      height: item.height * scale,
      fontSize: Math.abs(item.transform[0]) * scale,
      // Original unscaled coordinates (for PDF editing)
      originalX: item.transform[4],
      originalY: item.transform[5],
      originalWidth: item.width,
      originalHeight: item.height,
      originalFontSize: Math.abs(item.transform[0]),
      fontName: item.fontName,
      transform: item.transform,
    }));
  } catch (error) {
    console.error('Text extraction failed:', error);
    throw error;
  }
}

/**
 * Check if a PDF page is scanned (image-based)
 * @param {PDFPageProxy} page - The PDF page
 * @returns {Promise<boolean>} True if page is scanned
 */
export async function isScannedPDF(page) {
  try {
    const textContent = await page.getTextContent();
    const operatorList = await page.getOperatorList();

    const hasText = textContent.items.length > 0;
    const hasImages = operatorList.fnArray.some(
      (fn) => fn === pdfjsLib.OPS.paintImageXObject
    );

    // If has images but no text, it's scanned
    return hasImages && !hasText;
  } catch (error) {
    console.error('Scanned PDF detection failed:', error);
    return false;
  }
}

/**
 * Get page as image data for OCR processing
 * @param {PDFPageProxy} page - The PDF page
 * @param {number} scale - Scale factor for quality
 * @returns {Promise<ImageData>} Image data for OCR
 */
export async function getPageImageData(page, scale = 2) {
  try {
    const viewport = page.getViewport({ scale });

    // Create temporary canvas
    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const context = canvas.getContext('2d');

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return context.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('Image data extraction failed:', error);
    throw error;
  }
}
