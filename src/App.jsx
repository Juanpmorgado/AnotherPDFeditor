import { useState } from 'react';
import Toolbar from './components/Toolbar';
import PDFViewer from './components/PDFViewer';
import PageNavigation from './components/PageNavigation';
import TextEditor from './components/TextEditor';
import ImageInserter from './components/ImageInserter';
import DropZone from './components/DropZone';
import { usePDFState } from './hooks/usePDFState';

function App() {
  const [showImageInserter, setShowImageInserter] = useState(false);
  const [insertingImage, setInsertingImage] = useState(null);
  const { pdf, isLoading, addImage } = usePDFState();

  const handleImageInsert = (imageData) => {
    // Prepare image for placement
    setInsertingImage(imageData);
    setShowImageInserter(false);
  };

  const handleImagePlacement = (position) => {
    if (!insertingImage) return;

    const { currentPage } = usePDFState.getState();

    // Add image at clicked position
    addImage({
      ...insertingImage,
      pageNum: currentPage,
      x: position.x,
      y: position.y,
      width: 200,  // Default width
      height: 200, // Default height
    });

    setInsertingImage(null);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar onImageInsert={() => setShowImageInserter(true)} />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {pdf ? (
          <PDFViewer
            insertingImage={insertingImage}
            onImagePlacement={handleImagePlacement}
          />
        ) : (
          <DropZone />
        )}
      </div>

      {/* Page Navigation */}
      <PageNavigation />

      {/* Text Editor Panel */}
      <TextEditor />

      {/* Image Inserter Modal */}
      <ImageInserter
        isOpen={showImageInserter}
        onClose={() => setShowImageInserter(false)}
        onInsert={handleImageInsert}
      />
    </div>
  );
}

export default App;
