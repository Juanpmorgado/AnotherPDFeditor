/**
 * Undo/Redo History Hook
 */

import { create } from 'zustand';

const MAX_HISTORY = 10;

export const useHistory = create((set, get) => ({
  history: [],
  currentIndex: -1,

  // Add a state snapshot to history
  push: (state) => {
    const { history, currentIndex } = get();

    // Remove any redo states
    const newHistory = history.slice(0, currentIndex + 1);

    // Add new state
    newHistory.push(state);

    // Limit to MAX_HISTORY
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
      set({
        history: newHistory,
        currentIndex: newHistory.length - 1,
      });
    } else {
      set({
        history: newHistory,
        currentIndex: newHistory.length - 1,
      });
    }
  },

  // Undo to previous state
  undo: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
      return get().history[currentIndex - 1];
    }
    return null;
  },

  // Redo to next state
  redo: () => {
    const { history, currentIndex } = get();
    if (currentIndex < history.length - 1) {
      set({ currentIndex: currentIndex + 1 });
      return history[currentIndex + 1];
    }
    return null;
  },

  // Check if can undo
  canUndo: () => {
    return get().currentIndex > 0;
  },

  // Check if can redo
  canRedo: () => {
    const { history, currentIndex } = get();
    return currentIndex < history.length - 1;
  },

  // Clear history
  clear: () => set({
    history: [],
    currentIndex: -1,
  }),

  // Get current state
  getCurrentState: () => {
    const { history, currentIndex } = get();
    return currentIndex >= 0 ? history[currentIndex] : null;
  },
}));
