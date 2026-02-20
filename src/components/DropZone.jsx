import { useState } from 'react';
import { Upload } from 'lucide-react';
import { validatePDFFile } from '../utils/validators';
import { loadPDF } from '../lib/pdfLoader';
import { usePDFState } from '../hooks/usePDFState';

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const { setPDF, setPDFBytes, setLoading } = usePDFState();

  const handleFile = async (file) => {
    if (!file) return;

    const validation = validatePDFFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    try {
      setLoading(true);
      const pdfDoc = await loadPDF(file);
      const arrayBuffer = await file.arrayBuffer();
      setPDF(pdfDoc, file);
      setPDFBytes(new Uint8Array(arrayBuffer));
    } catch (error) {
      alert('Failed to load PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  return (
    <div
      className={`flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 transition-colors ${
        isDragging ? 'bg-blue-100' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="max-w-md w-full mx-4">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
            isDragging
              ? 'border-primary bg-blue-100 scale-105'
              : 'border-gray-300 bg-white hover:border-primary hover:bg-blue-50'
          }`}
        >
          <Upload
            className={`mx-auto mb-6 transition-colors ${
              isDragging ? 'text-primary' : 'text-gray-400'
            }`}
            size={64}
          />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Drop your PDF here
          </h2>
          <p className="text-gray-600 mb-6">
            or click to browse files
          </p>
          <label className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 cursor-pointer transition font-medium">
            Choose PDF File
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-4">
            Maximum file size: 10MB
          </p>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Features
          </h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✨ Edit text while preserving formatting</li>
            <li>🖼️ Insert and manipulate images</li>
            <li>🔒 100% client-side processing</li>
            <li>📄 Multi-page support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
