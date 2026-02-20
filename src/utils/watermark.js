/**
 * Watermark Utilities
 */

import { applyWatermark as applyWatermarkLib } from '../lib/pdfEditor';

const WATERMARK_TEXT = import.meta.env.VITE_WATERMARK_TEXT || 'Edited with PDF Editor';

/**
 * Apply default watermark to PDF
 * @param {Uint8Array} pdfBytes - PDF bytes
 * @returns {Promise<Uint8Array>} PDF with watermark
 */
export async function addWatermark(pdfBytes) {
  return await applyWatermarkLib(pdfBytes, WATERMARK_TEXT);
}

/**
 * Apply custom watermark to PDF
 * @param {Uint8Array} pdfBytes - PDF bytes
 * @param {string} text - Custom watermark text
 * @returns {Promise<Uint8Array>} PDF with watermark
 */
export async function addCustomWatermark(pdfBytes, text) {
  return await applyWatermarkLib(pdfBytes, text);
}
