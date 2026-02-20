/**
 * PDF Editor Module
 * Handles PDF modification using pdf-lib
 */

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Load PDF for editing
 * @param {ArrayBuffer|Uint8Array} pdfBytes - The PDF bytes
 * @returns {Promise<PDFDocument>} Loaded PDF document
 */
export async function loadPDFForEditing(pdfBytes) {
  try {
    return await PDFDocument.load(pdfBytes);
  } catch (error) {
    console.error('Failed to load PDF for editing:', error);
    throw error;
  }
}

/**
 * Map PDF font names to StandardFonts
 */
const FONT_MAPPING = {
  'Helvetica': StandardFonts.Helvetica,
  'Helvetica-Bold': StandardFonts.HelveticaBold,
  'Helvetica-Oblique': StandardFonts.HelveticaOblique,
  'Helvetica-BoldOblique': StandardFonts.HelveticaBoldOblique,
  'TimesRoman': StandardFonts.TimesRoman,
  'Times-Roman': StandardFonts.TimesRoman,
  'TimesRomanBold': StandardFonts.TimesRomanBold,
  'Times-Bold': StandardFonts.TimesRomanBold,
  'TimesRomanItalic': StandardFonts.TimesRomanItalic,
  'Times-Italic': StandardFonts.TimesRomanItalic,
  'TimesRomanBoldItalic': StandardFonts.TimesRomanBoldItalic,
  'Times-BoldItalic': StandardFonts.TimesRomanBoldItalic,
  'Courier': StandardFonts.Courier,
  'CourierBold': StandardFonts.CourierBold,
  'Courier-Bold': StandardFonts.CourierBold,
  'CourierOblique': StandardFonts.CourierOblique,
  'Courier-Oblique': StandardFonts.CourierOblique,
  'CourierBoldOblique': StandardFonts.CourierBoldOblique,
  'Courier-BoldOblique': StandardFonts.CourierBoldOblique,
  'Symbol': StandardFonts.Symbol,
  'ZapfDingbats': StandardFonts.ZapfDingbats,
};

/**
 * Get closest matching standard font
 */
function getStandardFont(fontName) {
  if (!fontName) return StandardFonts.Helvetica;

  // Direct match
  if (FONT_MAPPING[fontName]) {
    return FONT_MAPPING[fontName];
  }

  // Fuzzy matching - check for font family and weight/style indicators
  const lowerFont = fontName.toLowerCase();

  // Check for bold and italic/oblique indicators
  const isBold = lowerFont.includes('bold') || lowerFont.includes('bd');
  const isItalic = lowerFont.includes('italic') || lowerFont.includes('oblique') || lowerFont.includes('it');

  if (lowerFont.includes('courier')) {
    if (isBold && isItalic) return StandardFonts.CourierBoldOblique;
    if (isBold) return StandardFonts.CourierBold;
    if (isItalic) return StandardFonts.CourierOblique;
    return StandardFonts.Courier;
  }

  if (lowerFont.includes('times')) {
    if (isBold && isItalic) return StandardFonts.TimesRomanBoldItalic;
    if (isBold) return StandardFonts.TimesRomanBold;
    if (isItalic) return StandardFonts.TimesRomanItalic;
    return StandardFonts.TimesRoman;
  }

  if (lowerFont.includes('helvetica') || lowerFont.includes('arial') || lowerFont.includes('sans')) {
    if (isBold && isItalic) return StandardFonts.HelveticaBoldOblique;
    if (isBold) return StandardFonts.HelveticaBold;
    if (isItalic) return StandardFonts.HelveticaOblique;
    return StandardFonts.Helvetica;
  }

  // Default fallback - for unknown fonts, assume normal weight
  console.warn(`Unknown font "${fontName}", falling back to Helvetica`);
  return StandardFonts.Helvetica;
}

/**
 * Update text in a PDF
 * @param {PDFDocument} pdfDoc - The PDF document
 * @param {number} pageNum - Page number (0-indexed)
 * @param {Array} textEdits - Array of text edits
 * @returns {Promise<Uint8Array>} Modified PDF bytes
 */
export async function updatePDFText(pdfDoc, pageNum, textEdits) {
  try {
    const page = pdfDoc.getPage(pageNum);
    const { height } = page.getSize();

    for (const edit of textEdits) {
      // edit.x and edit.y are already in PDF coordinate space (bottom-left origin)
      // No need to convert them

      // Draw white rectangle to cover old text with extra padding
      if (edit.coverOld) {
        const padding = 2;
        page.drawRectangle({
          x: edit.x - padding,
          y: edit.y - padding,
          width: edit.width + (padding * 2),
          height: edit.height + (padding * 2),
          color: rgb(1, 1, 1),
        });
      }

      // Get standard font (avoid custom font embedding which requires fontkit)
      const standardFont = getStandardFont(edit.fontType);
      const font = await pdfDoc.embedFont(standardFont);

      console.log(`Drawing text "${edit.text}" with font: ${edit.fontType} -> ${standardFont}, size: ${edit.fontSize}`);

      // Text baseline should be at the bottom of the text box
      page.drawText(edit.text, {
        x: edit.x,
        y: edit.y, // Y is already in PDF space (bottom-left origin)
        size: edit.fontSize || 12,
        font: font,
        color: rgb(
          edit.color?.r ?? 0,
          edit.color?.g ?? 0,
          edit.color?.b ?? 0
        ),
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Text update failed:', error);
    throw error;
  }
}

/**
 * Insert an image into a PDF
 * @param {PDFDocument} pdfDoc - The PDF document
 * @param {number} pageNum - Page number (0-indexed)
 * @param {File} imageFile - The image file
 * @param {Object} position - Image position and size {x, y, width, height}
 * @returns {Promise<Uint8Array>} Modified PDF bytes
 */
export async function insertImage(pdfDoc, pageNum, imageFile, position) {
  try {
    const page = pdfDoc.getPage(pageNum);
    const { height } = page.getSize();

    const imageBytes = await imageFile.arrayBuffer();

    let image;
    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error('Unsupported image format. Use JPG or PNG.');
    }

    page.drawImage(image, {
      x: position.x,
      y: height - position.y - position.height,
      width: position.width,
      height: position.height,
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Image insertion failed:', error);
    throw error;
  }
}

/**
 * Apply watermark to PDF
 * @param {Uint8Array} pdfBytes - The PDF bytes
 * @param {string} watermarkText - Watermark text
 * @returns {Promise<Uint8Array>} PDF with watermark
 */
export async function applyWatermark(pdfBytes, watermarkText) {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const page of pages) {
      const { width, height } = page.getSize();

      page.drawText(watermarkText, {
        x: width / 2 - 100,
        y: 30,
        size: 12,
        font: font,
        color: rgb(0.7, 0.7, 0.7),
        opacity: 0.5,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Watermark application failed:', error);
    throw error;
  }
}

/**
 * Delete content from PDF (draw white rectangle)
 * @param {PDFDocument} pdfDoc - The PDF document
 * @param {number} pageNum - Page number (0-indexed)
 * @param {Object} area - Area to delete {x, y, width, height}
 * @returns {Promise<Uint8Array>} Modified PDF bytes
 */
export async function deleteContent(pdfDoc, pageNum, area) {
  try {
    const page = pdfDoc.getPage(pageNum);
    const { height } = page.getSize();

    page.drawRectangle({
      x: area.x,
      y: height - area.y - area.height,
      width: area.width,
      height: area.height,
      color: rgb(1, 1, 1),
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Content deletion failed:', error);
    throw error;
  }
}

/**
 * Create a blank PDF page
 * @param {PDFDocument} pdfDoc - The PDF document
 * @param {Object} dimensions - Page dimensions {width, height}
 * @returns {PDFPage} New page
 */
export function addBlankPage(pdfDoc, dimensions = { width: 612, height: 792 }) {
  return pdfDoc.addPage([dimensions.width, dimensions.height]);
}
