# Developer Guide

Quick reference for developers working on the PDF Editor project.

## Architecture Overview

### Technology Stack

```
Frontend:    React 18 + Zustand (state management)
PDF:         PDF.js (rendering) + pdf-lib (editing)
OCR:         Tesseract.js
Styling:     Tailwind CSS
Build:       Vite
```

### Data Flow

```
User uploads PDF
    ↓
PDF.js loads and renders to canvas
    ↓
Extract text positions and metadata
    ↓
User clicks on text → Show editor panel
    ↓
User modifies text → Update state
    ↓
Apply changes with pdf-lib
    ↓
Download modified PDF with watermark
```

## Key Components

### 1. PDFViewer (`src/components/PDFViewer.jsx`)

Renders the PDF to a canvas and handles text selection.

**Key Features:**
- Canvas-based PDF rendering
- Click detection on text elements
- Hover effects and selection highlights
- Two-layer canvas system (base + overlay)

**State Used:**
- `pdf` - Current PDF document
- `currentPage` - Active page number
- `scale` - Zoom level
- `textItems` - Extracted text with positions
- `selectedTextId` - Currently selected text

### 2. Toolbar (`src/components/Toolbar.jsx`)

Main navigation bar with all editing tools.

**Features:**
- File upload
- Undo/Redo
- Zoom controls
- Image insertion
- Download

### 3. TextEditor (`src/components/TextEditor.jsx`)

Floating panel for editing selected text.

**Features:**
- Edit text content
- Adjust font size
- Preview changes
- Apply or cancel edits

### 4. PageNavigation (`src/components/PageNavigation.jsx`)

Bottom bar for navigating multi-page PDFs.

**Features:**
- Previous/Next page buttons
- Direct page number input
- Current page indicator

### 5. ImageInserter (`src/components/ImageInserter.jsx`)

Modal for inserting images into PDFs.

**Features:**
- Upload from computer
- Load from URL
- Image preview
- Format validation

## Core Libraries

### PDF Loading (`src/lib/pdfLoader.js`)

Functions for loading and rendering PDFs with PDF.js.

```javascript
import { loadPDF, renderPage, extractTextWithPositions } from './lib/pdfLoader';

// Load PDF from file
const pdf = await loadPDF(file);

// Render page to canvas
await renderPage(page, canvas, scale);

// Get text with positions
const texts = await extractTextWithPositions(page);
```

### PDF Editing (`src/lib/pdfEditor.js`)

Functions for modifying PDFs with pdf-lib.

```javascript
import { updatePDFText, insertImage, applyWatermark } from './lib/pdfEditor';

// Update text
const modifiedPDF = await updatePDFText(pdfDoc, pageNum, textEdits);

// Insert image
const withImage = await insertImage(pdfDoc, pageNum, imageFile, position);

// Add watermark
const watermarked = await applyWatermark(pdfBytes, "My Watermark");
```

### OCR Processing (`src/lib/ocrProcessor.js`)

Functions for text extraction from scanned PDFs.

```javascript
import { performOCR, createOCRWorker } from './lib/ocrProcessor';

// Perform OCR on image
const result = await performOCR(imageElement, 'eng');

// Access extracted text
console.log(result.text);
console.log(result.words); // Array of words with positions
```

### Canvas Rendering (`src/lib/canvasRenderer.js`)

Utility functions for canvas drawing.

```javascript
import {
  clearCanvas,
  getCanvasCoordinates,
  highlightArea
} from './lib/canvasRenderer';

// Clear canvas
clearCanvas(canvas);

// Get click coordinates
const coords = getCanvasCoordinates(canvas, event);

// Highlight area
highlightArea(context, { x, y, width, height }, 'rgba(59, 130, 246, 0.2)');
```

## State Management

### PDF State (`src/hooks/usePDFState.js`)

Global state for PDF document and UI.

```javascript
import { usePDFState } from './hooks/usePDFState';

function MyComponent() {
  const {
    pdf,              // PDF document
    currentPage,      // Current page number
    scale,            // Zoom level
    textItems,        // Extracted text items
    setPDF,           // Set PDF document
    setCurrentPage,   // Change page
    zoomIn,           // Increase zoom
    zoomOut,          // Decrease zoom
    updateTextItem,   // Update text
  } = usePDFState();
}
```

### History Management (`src/hooks/useHistory.js`)

Undo/Redo functionality.

```javascript
import { useHistory } from './hooks/useHistory';

function MyComponent() {
  const {
    push,       // Add state to history
    undo,       // Undo to previous state
    redo,       // Redo to next state
    canUndo,    // Check if can undo
    canRedo,    // Check if can redo
  } = useHistory();

  const saveState = () => {
    push({ textItems, currentPage }); // Save current state
  };

  const handleUndo = () => {
    const prevState = undo();
    if (prevState) {
      // Restore previous state
    }
  };
}
```

## Utilities

### Validators (`src/utils/validators.js`)

File validation functions.

```javascript
import { validatePDFFile, validateImageFile, formatFileSize } from './utils/validators';

const validation = validatePDFFile(file);
if (!validation.valid) {
  alert(validation.error);
}
```

### Font Library (`src/utils/fontLibrary.js`)

Font mapping and matching.

```javascript
import { getWebFont, getStandardFont, extractFontStyle } from './utils/fontLibrary';

const webFont = getWebFont('Helvetica'); // Returns 'Arial, sans-serif'
const pdfFont = getStandardFont('Helvetica'); // Returns StandardFonts.Helvetica
const style = extractFontStyle('Helvetica-Bold'); // Returns { weight: 'bold', style: 'normal' }
```

## Common Development Tasks

### Adding a New Feature

1. **Plan the feature** - Review PRD.md and CLAUDE.MD
2. **Create component** - Add to `src/components/`
3. **Add state** - Update `usePDFState.js` if needed
4. **Implement logic** - Use library functions from `src/lib/`
5. **Test** - Upload PDF and test the feature
6. **Update docs** - Add to README.md

### Debugging Tips

```javascript
// Debug PDF loading
console.log('PDF loaded:', pdf.numPages, 'pages');

// Debug text extraction
console.log('Text items:', textItems);

// Debug canvas coordinates
console.log('Click position:', getCanvasCoordinates(canvas, event));

// Debug state changes
console.log('Current state:', usePDFState.getState());
```

### Performance Optimization

1. **Use Web Workers** - For heavy OCR processing
2. **Lazy load pages** - Only render visible pages
3. **Debounce events** - For text input and scroll
4. **Memoize expensive calculations** - Use React.useMemo
5. **Optimize canvas rendering** - Clear only changed areas

### Testing Checklist

- [ ] Upload various PDF types (text, scanned, forms)
- [ ] Test multi-page navigation
- [ ] Edit text and verify changes persist
- [ ] Test zoom at different levels (50%, 100%, 200%)
- [ ] Verify undo/redo works correctly
- [ ] Test on different browsers
- [ ] Check mobile responsiveness
- [ ] Test with large files (close to 10MB)
- [ ] Verify watermark appears on download
- [ ] Test error handling (invalid files, network errors)

## Code Style Guidelines

### File Naming
- Components: PascalCase (`PDFViewer.jsx`)
- Utilities: camelCase (`pdfLoader.js`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)

### Component Structure
```javascript
import statements
↓
Component definition
↓
State and hooks
↓
Effects
↓
Event handlers
↓
Render logic
↓
Export
```

### Error Handling
```javascript
try {
  // Operation
} catch (error) {
  console.error('Operation failed:', error);
  // User-friendly error message
  alert('Failed to process PDF. Please try again.');
}
```

## Environment Variables

Located in `.env`:

```env
VITE_TESSERACT_LANG_PATH=https://tessdata.projectnaptha.com/4.0.0
VITE_MAX_FILE_SIZE=10485760
VITE_WATERMARK_TEXT=Edited with PDF Editor
```

Access in code:
```javascript
const maxSize = import.meta.env.VITE_MAX_FILE_SIZE;
```

## Build and Deployment

### Development Build
```bash
npm run dev    # Start dev server with hot reload
```

### Production Build
```bash
npm run build  # Create optimized build in dist/
npm run preview # Preview production build locally
```

### Deployment Targets
- **Vercel**: Automatic deployment from Git
- **Netlify**: Drag & drop dist/ folder
- **GitHub Pages**: Use gh-pages branch

## Troubleshooting

### PDF Won't Load
- Check file size (<10MB)
- Verify file is valid PDF
- Check console for errors
- Try different PDF

### Text Not Editable
- Might be scanned PDF (use OCR)
- Check if text was extracted correctly
- Verify click detection works

### Canvas Not Rendering
- Check canvas ref is attached
- Verify PDF page loaded
- Check scale value is valid
- Clear browser cache

### State Not Updating
- Check Zustand store connection
- Verify state setter is called
- Use React DevTools to inspect state
- Check for typos in state keys

## Next Steps

1. **Implement OCR UI** - Add button and progress indicator
2. **Add text box creation** - Allow adding new text anywhere
3. **Image manipulation** - Move, resize, rotate images
4. **Form field support** - Edit PDF form fields
5. **Annotations** - Add highlights, comments, stamps
6. **Digital signatures** - Sign PDFs
7. **Page operations** - Merge, split, reorder pages

## Resources

- [PDF.js Documentation](https://mozilla.github.io/pdf.js/)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [React Documentation](https://react.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

## Questions?

Review these files for more information:
- `CLAUDE.MD` - AI assistant instructions with code examples
- `PRD.md` - Product requirements and specifications
- `SKILLS.md` - Required skills and learning resources
- `SETUP.md` - Installation and setup guide
