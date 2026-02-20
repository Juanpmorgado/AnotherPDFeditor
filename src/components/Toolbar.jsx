import { Upload, Download, Undo, Redo, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';
import { usePDFState } from '../hooks/usePDFState';
import { useHistory } from '../hooks/useHistory';
import { loadPDF } from '../lib/pdfLoader';
import { validatePDFFile, formatFileSize } from '../utils/validators';
import { addWatermark } from '../utils/watermark';
import { loadPDFForEditing, updatePDFText, insertImage } from '../lib/pdfEditor';

export default function Toolbar({ onImageInsert }) {
  const { pdf, pdfFile, pdfBytes, setPDF, setPDFBytes, zoomIn, zoomOut, scale, setLoading, textItems, images } = usePDFState();
  const { undo, redo, canUndo, canRedo } = useHistory();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
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

  const handleDownload = async () => {
    if (!pdfBytes) {
      alert('No PDF to download');
      return;
    }

    try {
      setLoading(true);

      // Load PDF for editing
      let pdfDoc = await loadPDFForEditing(pdfBytes);

      // Group text edits by page
      const textEditsByPage = {};
      textItems
        .filter((item) => item.modified)
        .forEach((item) => {
          const pageNum = item.pageNum - 1; // Convert to 0-indexed
          if (!textEditsByPage[pageNum]) {
            textEditsByPage[pageNum] = [];
          }

          // Use original (unscaled) coordinates for PDF editing
          textEditsByPage[pageNum].push({
            x: item.originalX || item.x,
            y: item.originalY || item.y,
            width: item.originalWidth || item.width,
            height: item.originalHeight || item.height,
            text: item.text,
            fontSize: item.originalFontSize || item.fontSize,
            fontType: item.fontName,
            coverOld: true,
            color: { r: 0, g: 0, b: 0 },
          });
        });

      // Apply text edits page by page
      for (const [pageNum, edits] of Object.entries(textEditsByPage)) {
        console.log(`Applying ${edits.length} text edits to page ${pageNum}:`, edits);
        const modifiedBytes = await updatePDFText(pdfDoc, parseInt(pageNum), edits);
        pdfDoc = await loadPDFForEditing(modifiedBytes);
      }

      // Apply image insertions
      for (const image of images) {
        if (image.file) {
          const pageNum = image.pageNum - 1; // Convert to 0-indexed
          const modifiedBytes = await insertImage(pdfDoc, pageNum, image.file, {
            x: image.x,
            y: image.y,
            width: image.width,
            height: image.height,
          });
          pdfDoc = await loadPDFForEditing(modifiedBytes);
        } else if (image.type === 'url' && image.url) {
          // Fetch URL image and convert to file
          try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const file = new File([blob], 'image.png', { type: blob.type });

            const pageNum = image.pageNum - 1;
            const modifiedBytes = await insertImage(pdfDoc, pageNum, file, {
              x: image.x,
              y: image.y,
              width: image.width,
              height: image.height,
            });
            pdfDoc = await loadPDFForEditing(modifiedBytes);
          } catch (error) {
            console.error('Failed to fetch URL image:', error);
            // Continue with other images
          }
        }
      }

      // Save PDF and apply watermark
      let finalBytes = await pdfDoc.save();
      finalBytes = await addWatermark(finalBytes);

      // Create download link
      const blob = new Blob([finalBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = pdfFile ? pdfFile.name.replace('.pdf', '-edited.pdf') : 'edited-document.pdf';
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      // Restore previous state
      console.log('Undo to:', previousState);
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      // Restore next state
      console.log('Redo to:', nextState);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800">PDF Editor</h1>
        {pdfFile && (
          <span className="text-sm text-gray-600">
            {pdfFile.name} ({formatFileSize(pdfFile.size)})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Upload */}
        <label className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 cursor-pointer transition">
          <Upload size={18} />
          <span className="text-sm font-medium">Upload PDF</span>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Divider */}
        {pdf && <div className="h-8 w-px bg-gray-300" />}

        {/* Undo/Redo */}
        {pdf && (
          <>
            <button
              onClick={handleUndo}
              disabled={!canUndo()}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Undo"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo()}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Redo"
            >
              <Redo size={20} />
            </button>

            <div className="h-8 w-px bg-gray-300" />
          </>
        )}

        {/* Zoom */}
        {pdf && (
          <>
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>

            <div className="h-8 w-px bg-gray-300" />
          </>
        )}

        {/* Insert Image */}
        {pdf && (
          <button
            onClick={onImageInsert}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-indigo-600 transition"
            title="Insert Image"
          >
            <ImageIcon size={18} />
            <span className="text-sm font-medium">Insert Image</span>
          </button>
        )}

        {/* Download */}
        {pdf && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download size={18} />
            <span className="text-sm font-medium">Download</span>
          </button>
        )}
      </div>
    </nav>
  );
}
