import { useState, useRef, useEffect } from 'react';
import { Trash2, Move } from 'lucide-react';

export default function ImageLayer({ images, onImageUpdate, onImageDelete, canvasWidth, canvasHeight, scale }) {
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const layerRef = useRef(null);

  const selectedImage = images.find(img => img.id === selectedImageId);

  const handleMouseDown = (e, imageId, action = 'move') => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedImageId(imageId);

    if (action === 'move') {
      setDragging(true);
    } else if (action === 'resize') {
      setResizing(true);
    }

    const rect = layerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging && !resizing) return;
    if (!selectedImage) return;

    const rect = layerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (dragging) {
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      onImageUpdate(selectedImageId, {
        x: Math.max(0, Math.min(selectedImage.x + deltaX, canvasWidth - selectedImage.width)),
        y: Math.max(0, Math.min(selectedImage.y + deltaY, canvasHeight - selectedImage.height)),
      });

      setDragStart({ x: currentX, y: currentY });
    } else if (resizing) {
      const newWidth = Math.max(50, currentX - selectedImage.x);
      const newHeight = Math.max(50, currentY - selectedImage.y);

      onImageUpdate(selectedImageId, {
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setResizing(false);
  };

  useEffect(() => {
    if (dragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging, resizing, selectedImage, dragStart]);

  return (
    <div
      ref={layerRef}
      className="absolute top-0 left-0"
      style={{ width: canvasWidth, height: canvasHeight }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          className={`absolute border-2 transition-colors ${
            selectedImageId === image.id
              ? 'border-blue-500 shadow-lg'
              : 'border-transparent hover:border-blue-300'
          }`}
          style={{
            left: image.x,
            top: image.y,
            width: image.width,
            height: image.height,
            cursor: 'move',
          }}
          onMouseDown={(e) => handleMouseDown(e, image.id, 'move')}
        >
          <img
            src={image.src}
            alt="Inserted"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Controls (visible when selected) */}
          {selectedImageId === image.id && (
            <>
              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-nwse-resize"
                onMouseDown={(e) => handleMouseDown(e, image.id, 'resize')}
              />

              {/* Delete button */}
              <button
                className="absolute -top-8 right-0 p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageDelete(image.id);
                  setSelectedImageId(null);
                }}
                title="Delete Image"
              >
                <Trash2 size={16} />
              </button>

              {/* Move indicator */}
              <div className="absolute -top-8 left-0 p-1 bg-blue-500 text-white rounded text-xs flex items-center gap-1">
                <Move size={12} />
                <span>Drag to move</span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
