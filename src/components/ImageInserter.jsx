import { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { validateImageFile, isValidURL } from '../utils/validators';

export default function ImageInserter({ isOpen, onClose, onInsert }) {
  const [mode, setMode] = useState('upload'); // 'upload' or 'url'
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUrlLoad = () => {
    if (!isValidURL(imageUrl)) {
      alert('Please enter a valid URL');
      return;
    }

    setPreview(imageUrl);
  };

  const handleInsert = () => {
    if (!preview) {
      alert('Please select an image first');
      return;
    }

    // Return image data with src for display
    if (mode === 'upload' && imageFile) {
      onInsert({
        type: 'file',
        file: imageFile,
        src: preview  // Data URL for display
      });
    } else if (mode === 'url') {
      onInsert({
        type: 'url',
        url: imageUrl,
        src: imageUrl  // Direct URL for display
      });
    }

    // Reset and close
    setImageFile(null);
    setImageUrl('');
    setPreview(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Insert Image</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selection */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'upload'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Upload className="inline mr-2" size={18} />
            Upload
          </button>
          <button
            onClick={() => setMode('url')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
              mode === 'url'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LinkIcon className="inline mr-2" size={18} />
            URL
          </button>
        </div>

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div>
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF, WebP (Max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* URL Mode */}
        {mode === 'url' && (
          <div className="space-y-3">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Enter image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleUrlLoad}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Load Preview
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleInsert}
            disabled={!preview}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Insert Image
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
