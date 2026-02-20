/**
 * Font Library and Matching
 */

import { StandardFonts } from 'pdf-lib';

// Font mappings from PDF fonts to web-safe alternatives
export const FONT_MAPPINGS = {
  // Serif fonts
  'Times': 'Times New Roman, serif',
  'Times-Roman': 'Times New Roman, serif',
  'Times-Bold': 'Times New Roman, serif',
  'Times-Italic': 'Times New Roman, serif',
  'Times-BoldItalic': 'Times New Roman, serif',

  // Sans-serif fonts
  'Helvetica': 'Arial, sans-serif',
  'Helvetica-Bold': 'Arial, sans-serif',
  'Helvetica-Oblique': 'Arial, sans-serif',
  'Helvetica-BoldOblique': 'Arial, sans-serif',
  'Arial': 'Arial, sans-serif',

  // Monospace fonts
  'Courier': 'Courier New, monospace',
  'Courier-Bold': 'Courier New, monospace',
  'Courier-Oblique': 'Courier New, monospace',
  'Courier-BoldOblique': 'Courier New, monospace',

  // Symbol fonts
  'Symbol': 'Symbol, sans-serif',
  'ZapfDingbats': 'sans-serif',
};

// Standard fonts available in pdf-lib
export const PDF_STANDARD_FONTS = {
  'Helvetica': StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Oblique': StandardFonts.HelveticaOblique,
  'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
  'Times-Roman': StandardFonts.TimesRoman,
  'Times-Bold': StandardFonts.TimesRomanBold,
  'Times-Italic': StandardFonts.TimesRomanItalic,
  'Times-BoldItalic': StandardFonts.TimesRomanBoldItalic,
  'Courier': StandardFonts.Courier,
  'Courier-Bold': StandardFonts.CourierBold,
  'Courier-Oblique': StandardFonts.CourierOblique,
  'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
};

/**
 * Get web-safe font family for a PDF font
 * @param {string} pdfFont - PDF font name
 * @returns {string} Web-safe font family
 */
export function getWebFont(pdfFont) {
  return FONT_MAPPINGS[pdfFont] || 'Arial, sans-serif';
}

/**
 * Get standard PDF font for embedding
 * @param {string} fontName - Font name
 * @returns {StandardFonts} pdf-lib standard font
 */
export function getStandardFont(fontName) {
  return PDF_STANDARD_FONTS[fontName] || StandardFonts.Helvetica;
}

/**
 * Match font by visual characteristics
 * @param {Object} fontMetrics - Font metrics {serif, weight, width}
 * @returns {string} Closest matching font
 */
export function matchFontByMetrics(fontMetrics) {
  // Simple matching algorithm
  if (fontMetrics.serif) {
    return 'Times New Roman, serif';
  }

  if (fontMetrics.monospace) {
    return 'Courier New, monospace';
  }

  return 'Arial, sans-serif';
}

/**
 * Extract font style from font name
 * @param {string} fontName - Font name
 * @returns {Object} Font style {weight, style}
 */
export function extractFontStyle(fontName) {
  const style = {
    weight: 'normal',
    style: 'normal',
  };

  if (fontName.includes('Bold')) {
    style.weight = 'bold';
  }

  if (fontName.includes('Italic') || fontName.includes('Oblique')) {
    style.style = 'italic';
  }

  return style;
}
