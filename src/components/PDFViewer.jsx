import { useRef, useEffect, useState } from 'react';
import { usePDFState } from '../hooks/usePDFState';
import { useHistory } from '../hooks/useHistory';
import { renderPage, extractTextWithPositions } from '../lib/pdfLoader';
import { loadPDFForEditing, updatePDFText } from '../lib/pdfEditor';
import { clearCanvas, getCanvasCoordinates, isPointInRect, highlightArea } from '../lib/canvasRenderer';
import { getStandardFont } from '../utils/fontLibrary';
import ImageLayer from './ImageLayer';

export default function PDFViewer({ insertingImage, onImagePlacement }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const textLayerRef = useRef(null);

  const state = usePDFState();
  const {
    pdf,
    currentPage,
    scale,
    textItems,
    setTextItems,
    selectedTextId,
    selectText,
    pdfBytes,
    setPDFBytes,
    images,
    updateImage,
    deleteImage
  } = state;

  const { push: saveHistory } = useHistory();
  const [hoveredTextId, setHoveredTextId] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const renderTaskRef = useRef(null);
  const isApplyingEditsRef = useRef(false);
  const abortControllerRef = useRef(null);

  // Render PDF page
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    // Create abort controller for this render
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const renderCurrentPage = async () => {
      try {
        // Cancel any ongoing render task
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // Ignore cancellation errors
          }
          renderTaskRef.current = null;
        }

        // Check if aborted before starting expensive operations
        if (controller.signal.aborted) return;

        const page = await pdf.getPage(currentPage);

        if (controller.signal.aborted) return;

        const viewport = page.getViewport({ scale });
        const context = canvasRef.current?.getContext('2d');

        if (!context || controller.signal.aborted) return;

        // Clear canvas first
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        canvasRef.current.height = viewport.height;
        canvasRef.current.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        // Store render task so we can cancel it
        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;

        if (controller.signal.aborted) return;

        renderTaskRef.current = null;

        // Save canvas size for image layer
        setCanvasSize({
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });

        // Extract text positions with current scale
        const texts = await extractTextWithPositions(page, scale);

        if (controller.signal.aborted) return;

        const textItemsWithIds = texts.map((text, index) => ({
          ...text,
          id: `text-${currentPage}-${index}`,
          pageNum: currentPage,
          pageY: text.y,
          y: viewport.height - text.y, // Convert to canvas coordinates (Y is already scaled)
          modified: false,
        }));

        console.log('Extracted text items:', textItemsWithIds.length, 'items at scale:', scale);
        if (textItemsWithIds.length > 0) {
          console.log('First text item:', textItemsWithIds[0]);
          console.log('Canvas size:', canvasRef.current.width, 'x', canvasRef.current.height);
          console.log('Viewport size:', viewport.width, 'x', viewport.height);
        }

        setTextItems(textItemsWithIds);
      } catch (error) {
        if (error.name === 'RenderingCancelledException' || controller.signal.aborted) {
          console.log('Rendering cancelled (expected when changing pages quickly)');
        } else {
          console.error('Error rendering page:', error);
        }
      }
    };

    renderCurrentPage();

    // Cleanup: cancel render task on unmount or when dependencies change
    return () => {
      controller.abort();
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore cancellation errors
        }
        renderTaskRef.current = null;
      }
    };
  }, [pdf, currentPage, scale]);

  // Draw text overlay for modified text
  useEffect(() => {
    if (!textLayerRef.current || !canvasRef.current) return;

    const textLayer = textLayerRef.current;
    const canvas = canvasRef.current;

    textLayer.width = canvas.width;
    textLayer.height = canvas.height;

    const ctx = textLayer.getContext('2d');
    clearCanvas(textLayer);

    // Draw modified text on overlay (coordinates are already scaled from extraction)
    textItems
      .filter((item) => item.modified && item.pageNum === currentPage)
      .forEach((item) => {
        // Cover old text with white rectangle (extra padding for complete coverage)
        ctx.fillStyle = 'white';
        ctx.fillRect(
          item.x - 5,
          item.y - item.height - 5,
          item.width + 10,
          item.height + 10
        );

        // Draw new text
        ctx.font = `${item.fontSize}px ${item.fontName || 'Arial'}`;
        ctx.fillStyle = '#000000';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(item.text, item.x, item.y);
      });
  }, [textItems, currentPage]);

  // Handle canvas clicks
  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;

    const coords = getCanvasCoordinates(canvasRef.current, e);

    // If inserting image, place it at click location
    if (insertingImage && onImagePlacement) {
      onImagePlacement(coords);
      return;
    }

    // Add padding to make text easier to click (5px tolerance)
    const padding = 15;

    // Check if click is on a text item with padding for easier clicking
    const clickedText = textItems.find((item) => {
      const rect = {
        x: item.x - padding,
        y: item.y - item.height - padding,
        width: item.width + (padding * 2),
        height: item.height + (padding * 2),
      };
      return isPointInRect(coords, rect);
    });

    if (clickedText) {
      console.log('Clicked text:', clickedText.text, 'at', coords);
      selectText(clickedText.id);
    } else {
      console.log('No text found at', coords, 'Available items:', textItems.length);
      selectText(null);
    }
  };

  // Handle mouse move for hover effects
  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const coords = getCanvasCoordinates(canvasRef.current, e);

    // Add padding for easier hover detection
    const padding = 15;

    const hoveredText = textItems.find((item) => {
      const rect = {
        x: item.x - padding,
        y: item.y - item.height - padding,
        width: item.width + (padding * 2),
        height: item.height + (padding * 2),
      };
      return isPointInRect(coords, rect);
    });

    setHoveredTextId(hoveredText ? hoveredText.id : null);
  };

  // Draw overlay for selections and hovers
  useEffect(() => {
    if (!overlayRef.current || !canvasRef.current) return;

    const overlay = overlayRef.current;
    const canvas = canvasRef.current;

    overlay.width = canvas.width;
    overlay.height = canvas.height;

    const ctx = overlay.getContext('2d');
    clearCanvas(overlay);

    // DEBUG: Draw all text bounding boxes (uncomment to debug)
    const DEBUG_MODE = true;
    if (DEBUG_MODE) {
      textItems.forEach((item) => {
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          item.x,
          item.y - item.height,
          item.width,
          item.height
        );
      });
    }

    // Highlight hovered text
    if (hoveredTextId) {
      const item = textItems.find((t) => t.id === hoveredTextId);
      if (item) {
        highlightArea(ctx, {
          x: item.x,
          y: item.y - item.height,
          width: item.width,
          height: item.height,
        }, 'rgba(59, 130, 246, 0.15)');
      }
    }

    // Highlight selected text
    if (selectedTextId) {
      const item = textItems.find((t) => t.id === selectedTextId);
      if (item) {
        highlightArea(ctx, {
          x: item.x,
          y: item.y - item.height,
          width: item.width,
          height: item.height,
        }, 'rgba(59, 130, 246, 0.3)');

        // Draw border around selected text
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          item.x - 2,
          item.y - item.height - 2,
          item.width + 4,
          item.height + 4
        );
      }
    }
  }, [hoveredTextId, selectedTextId, textItems]);

  // Apply edits to actual PDF when text is modified
  useEffect(() => {
    const applyEditsToPDF = async () => {
      const modifiedItems = textItems.filter(item => item.modified);
      if (modifiedItems.length === 0 || !pdfBytes || isApplyingEditsRef.current) return;

      isApplyingEditsRef.current = true;

      try {
        // Load PDF for editing
        const pdfDoc = await loadPDFForEditing(pdfBytes);

        // Group edits by page
        const editsByPage = {};
        modifiedItems.forEach(item => {
          if (!editsByPage[item.pageNum]) {
            editsByPage[item.pageNum] = [];
          }
          editsByPage[item.pageNum].push({
            text: item.text,
            x: item.x,
            y: item.pageY,
            width: item.width,
            height: item.height,
            fontSize: item.fontSize,
            fontType: getStandardFont(item.fontName),
            coverOld: true,
          });
        });

        // Apply edits for each page
        for (const [pageNum, edits] of Object.entries(editsByPage)) {
          await updatePDFText(pdfDoc, parseInt(pageNum) - 1, edits);
        }

        // Save updated PDF
        const updatedBytes = await pdfDoc.save();
        setPDFBytes(updatedBytes);

        // Save to history
        saveHistory({ textItems, timestamp: Date.now() });
      } catch (error) {
        console.error('Failed to apply edits to PDF:', error);
      } finally {
        isApplyingEditsRef.current = false;
      }
    };

    // Debounce PDF updates - only run if there are modified items
    const hasModified = textItems.some(item => item.modified);
    if (!hasModified) return;

    const timer = setTimeout(applyEditsToPDF, 1000);
    return () => clearTimeout(timer);
  }, [textItems, pdfBytes, setPDFBytes, saveHistory]);

  if (!pdf) {
    return null;
  }

  return (
    <div className="relative flex items-center justify-center bg-gray-100 p-4 overflow-auto h-full">
      <div className="relative shadow-2xl">
        {/* Base PDF canvas */}
        <canvas
          ref={canvasRef}
          className="border border-gray-300 bg-white"
        />

        {/* Text edit overlay */}
        <canvas
          ref={textLayerRef}
          className="absolute top-0 left-0 pointer-events-none"
        />

        {/* Image layer - below selection overlay */}
        <ImageLayer
          images={images.filter(img => img.pageNum === currentPage)}
          onImageUpdate={updateImage}
          onImageDelete={deleteImage}
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          scale={scale}
        />

        {/* Selection/hover overlay - on top for click detection */}
        <canvas
          ref={overlayRef}
          className={`absolute top-0 left-0 z-10 ${insertingImage ? 'cursor-crosshair' : hoveredTextId ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
        />

        {/* Inserting image indicator */}
        {insertingImage && (
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
            Click on the PDF to place the image
          </div>
        )}
      </div>
    </div>
  );
}
