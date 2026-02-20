/**
 * Canvas Renderer Module
 * Utilities for canvas drawing and manipulation
 */

/**
 * Clear canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
export function clearCanvas(canvas) {
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draw selection rectangle
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @param {string} color - Border color
 */
export function drawSelectionRect(context, rect, color = '#3B82F6') {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.strokeRect(rect.x, rect.y, rect.width, rect.height);
  context.restore();
}

/**
 * Draw text overlay for editing
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Object} textItem - Text item with properties
 */
export function drawTextOverlay(context, textItem) {
  context.save();
  context.font = `${textItem.fontSize}px ${textItem.fontName || 'Arial'}`;
  context.fillStyle = textItem.color || '#000000';
  context.fillText(textItem.text, textItem.x, textItem.y);
  context.restore();
}

/**
 * Highlight text area
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {Object} area - Area to highlight
 * @param {string} color - Highlight color
 */
export function highlightArea(context, area, color = 'rgba(59, 130, 246, 0.2)') {
  context.save();
  context.fillStyle = color;
  context.fillRect(area.x, area.y, area.width, area.height);
  context.restore();
}

/**
 * Get pixel coordinates from mouse event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {MouseEvent} event - Mouse event
 * @returns {Object} Coordinates {x, y}
 */
export function getCanvasCoordinates(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

/**
 * Check if point is inside rectangle
 * @param {Object} point - Point {x, y}
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} True if point is inside
 */
export function isPointInRect(point, rect) {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Create offscreen canvas for rendering
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {HTMLCanvasElement} Offscreen canvas
 */
export function createOffscreenCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Resize canvas maintaining aspect ratio
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 */
export function resizeCanvas(canvas, maxWidth, maxHeight) {
  const aspectRatio = canvas.width / canvas.height;

  if (canvas.width > maxWidth) {
    canvas.width = maxWidth;
    canvas.height = maxWidth / aspectRatio;
  }

  if (canvas.height > maxHeight) {
    canvas.height = maxHeight;
    canvas.width = maxHeight * aspectRatio;
  }
}

/**
 * Draw grid on canvas
 * @param {CanvasRenderingContext2D} context - Canvas context
 * @param {number} gridSize - Grid cell size
 * @param {string} color - Grid color
 */
export function drawGrid(context, gridSize = 20, color = '#e5e7eb') {
  const { canvas } = context;

  context.save();
  context.strokeStyle = color;
  context.lineWidth = 1;

  // Vertical lines
  for (let x = 0; x <= canvas.width; x += gridSize) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }

  // Horizontal lines
  for (let y = 0; y <= canvas.height; y += gridSize) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.restore();
}
