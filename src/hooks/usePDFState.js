/**
 * PDF State Management Hook
 */

import { create } from 'zustand';

export const usePDFState = create((set, get) => ({
  // PDF Document
  pdf: null,
  pdfFile: null,
  pdfBytes: null,

  // Current State
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,  // Start at 100% for accurate text clicking

  // Text Items
  textItems: [],
  selectedTextId: null,

  // Images
  images: [],

  // Loading States
  isLoading: false,
  isProcessing: false,
  ocrProcessing: false,

  // Actions
  setPDF: (pdf, file) => set({
    pdf,
    pdfFile: file,
    totalPages: pdf ? pdf.numPages : 0,
    currentPage: 1,
  }),

  setPDFBytes: (bytes) => set({ pdfBytes: bytes }),

  setCurrentPage: (page) => {
    const { totalPages } = get();
    if (page >= 1 && page <= totalPages) {
      set({ currentPage: page });
    }
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },

  previousPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },

  setScale: (scale) => set({ scale }),

  zoomIn: () => {
    const { scale } = get();
    if (scale < 3) {
      set({ scale: Math.min(scale + 0.25, 3) });
    }
  },

  zoomOut: () => {
    const { scale } = get();
    if (scale > 0.5) {
      set({ scale: Math.max(scale - 0.25, 0.5) });
    }
  },

  setTextItems: (items) => {
    const { textItems: oldItems } = get();

    // Merge with existing text items to preserve modifications
    const mergedItems = items.map((newItem) => {
      const oldItem = oldItems.find((old) => old.id === newItem.id);
      if (oldItem && oldItem.modified) {
        // Preserve modified text, fontSize, and original coordinates
        // Update scaled display coordinates for new zoom level
        return {
          ...newItem,
          text: oldItem.text,
          fontSize: oldItem.fontSize,
          // Keep original coordinates for PDF editing (unchanged by zoom)
          originalX: oldItem.originalX,
          originalY: oldItem.originalY,
          originalWidth: oldItem.originalWidth,
          originalHeight: oldItem.originalHeight,
          originalFontSize: oldItem.originalFontSize,
          modified: true,
        };
      }
      return newItem;
    });

    set({ textItems: mergedItems });
  },

  updateTextItem: (id, updates) => set((state) => ({
    textItems: state.textItems.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),

  selectText: (id) => set({ selectedTextId: id }),

  addImage: (image) => set((state) => ({
    images: [...state.images, { ...image, id: `img-${Date.now()}` }],
  })),

  updateImage: (id, updates) => set((state) => ({
    images: state.images.map((img) =>
      img.id === id ? { ...img, ...updates } : img
    ),
  })),

  deleteImage: (id) => set((state) => ({
    images: state.images.filter((img) => img.id !== id),
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setProcessing: (processing) => set({ isProcessing: processing }),

  setOCRProcessing: (processing) => set({ ocrProcessing: processing }),

  reset: () => set({
    pdf: null,
    pdfFile: null,
    pdfBytes: null,
    currentPage: 1,
    totalPages: 0,
    scale: 1.0,  // Reset to 100% for accurate clicking
    textItems: [],
    selectedTextId: null,
    images: [],
    isLoading: false,
    isProcessing: false,
    ocrProcessing: false,
  }),
}));
