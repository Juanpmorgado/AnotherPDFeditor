import { useState, useEffect } from 'react';
import { usePDFState } from '../hooks/usePDFState';
import { getWebFont, extractFontStyle } from '../utils/fontLibrary';
import { X } from 'lucide-react';

export default function TextEditor() {
  const { textItems, selectedTextId, selectText, updateTextItem } = usePDFState();
  const [editedText, setEditedText] = useState('');
  const [fontSize, setFontSize] = useState(12);

  const selectedText = textItems.find((item) => item.id === selectedTextId);

  useEffect(() => {
    if (selectedText) {
      setEditedText(selectedText.text);
      setFontSize(selectedText.fontSize);
    }
  }, [selectedText]);

  if (!selectedTextId || !selectedText) return null;

  const fontFamily = getWebFont(selectedText.fontName);
  const fontStyle = extractFontStyle(selectedText.fontName);

  const handleSave = () => {
    updateTextItem(selectedTextId, {
      text: editedText,
      fontSize: fontSize,
      modified: true,
    });
    selectText(null);
  };

  const handleClose = () => {
    selectText(null);
  };

  return (
    <div
      className="fixed bottom-24 right-8 w-[420px] bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-6 z-[100]"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Solid white background with extra padding and strong border for clear separation from PDF */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Edit Text</h3>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Text Content
          </label>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white"
            rows="3"
            style={{
              fontFamily: fontFamily,
              fontWeight: fontStyle.weight,
              fontStyle: fontStyle.style,
            }}
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Font Size: {fontSize}px
          </label>
          <input
            type="range"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Font Info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p><strong>Font:</strong> {selectedText.fontName}</p>
          <p><strong>Position:</strong> x: {Math.round(selectedText.x)}, y: {Math.round(selectedText.y)}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Apply Changes
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
