# Technical Documentation

## PDF Editor Web Application

**Version:** 1.0  
**Last Updated:** January 21, 2026  
**Architecture:** Client-Side Single Page Application

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Core Components](#3-core-components)
4. [Data Flow](#4-data-flow)
5. [API Documentation](#5-api-documentation)
6. [File Structure](#6-file-structure)
7. [Installation & Setup](#7-installation--setup)
8. [Development Workflow](#8-development-workflow)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment](#10-deployment)
11. [Performance Optimization](#11-performance-optimization)
12. [Security Considerations](#12-security-considerations)
13. [Browser Compatibility](#13-browser-compatibility)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   React UI   │◄───┤ State Store  │───►│  Components  │  │
│  │  (Toolbar,   │    │   (Zustand)  │    │  (Modals,    │  │
│  │   Viewer)    │    │              │    │   Dialogs)   │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                                │
│         ▼                   ▼                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Core PDF Engine Layer                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │ PDF.js   │  │ pdf-lib  │  │  Tesseract.js    │  │   │
│  │  │(Renderer)│  │(Editor)  │  │  (OCR Engine)    │  │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────────────┘  │   │
│  └───────┼─────────────┼─────────────┼────────────────┘   │
│          │             │             │                      │
│          ▼             ▼             ▼                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Web Workers (Background Processing)        │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐       │   │
│  │  │ PDF Parse │  │ OCR Work  │  │ Image     │       │   │
│  │  │  Worker   │  │  Worker   │  │ Process   │       │   │
│  │  └───────────┘  └───────────┘  └───────────┘       │   │
│  └─────────────────────────────────────────────────────┘   │
│          │             │             │                      │
│          ▼             ▼             ▼                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Browser Storage (IndexedDB/Memory)           │   │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │   │
│  │  │ Temp Files   │  │  Edit History (Undo)    │    │   │
│  │  └──────────────┘  └──────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   Download  │
                    │  (with WM)  │
                    └─────────────┘
```

### 1.2 Component Interaction Flow

```
User Upload PDF
      │
      ▼
┌─────────────┐
│File Validator│──► Reject if >10MB or not PDF
└──────┬──────┘
       │ Valid
       ▼
┌─────────────┐
│  PDF.js     │──► Load PDF into memory
│  Loader     │    Extract metadata
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│Detect Type  │─Yes─►│ OCR Worker   │──► Extract text from scans
│(Scanned?)   │      └──────┬───────┘
└──────┬──────┘             │
       │ No                 │
       │◄───────────────────┘
       ▼
┌─────────────┐
│  Render to  │──► Display on Canvas
│   Canvas    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Create Text  │──► Overlay editable divs
│  Overlays   │
└──────┬──────┘
       │
       ▼
   User Edits
       │
       ▼
┌─────────────┐
│Track Changes│──► Store in history (undo/redo)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  pdf-lib    │──► Apply edits to PDF
│  Editor     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Apply Water- │──► Add watermark (free tier)
│   mark      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Download   │──► Save to user's device
│   as PDF    │
└─────────────┘
```

---

## 2. Technology Stack

### 2.1 Core Technologies

| Category             | Technology        | Version | Purpose                        |
| -------------------- | ----------------- | ------- | ------------------------------ |
| **Framework**        | React             | 18.2+   | UI component library           |
| **Build Tool**       | Vite              | 4.0+    | Fast dev server & bundler      |
| **Language**         | JavaScript (ES6+) | ES2022  | Main programming language      |
| **Styling**          | Tailwind CSS      | 3.3+    | Utility-first CSS framework    |
| **State Management** | Zustand           | 4.4+    | Lightweight state management   |
| **PDF Rendering**    | PDF.js            | 3.11+   | Mozilla's PDF rendering engine |
| **PDF Editing**      | pdf-lib           | 1.17+   | PDF manipulation library       |
| **OCR**              | Tesseract.js      | 4.1+    | Client-side OCR engine         |
| **Font Handling**    | opentype.js       | 1.3+    | Font parsing and embedding     |
| **Icons**            | Lucide React      | 0.263+  | Icon library                   |

### 2.2 Development Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pdfjs-dist": "^3.11.174",
    "pdf-lib": "^1.17.1",
    "tesseract.js": "^4.1.1",
    "opentype.js": "^1.3.4",
    "zustand": "^4.4.1",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "vitest": "^0.32.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### 2.3 Browser APIs Used

- **Canvas API:** Rendering PDFs, drawing overlays
- **File API:** Reading uploaded PDFs
- **Web Workers API:** Background processing
- **IndexedDB:** Temporary file storage
- **Blob API:** Creating downloadable files
- **Drag and Drop API:** File upload UX
- **CSS Font Loading API:** Font detection
- **ResizeObserver API:** Responsive canvas sizing

---

## 3. Core Components

### 3.1 Component Hierarchy

```
App
├── Toolbar
│   ├── UploadButton
│   ├── UndoButton
│   ├── RedoButton
│   ├── ZoomControls
│   └── DownloadButton
├── PDFViewer
│   ├── Canvas (PDF Render)
│   ├── TextOverlay (Editable text)
│   ├── ImageOverlay (Movable images)
│   └── PageNavigation
├── Modals
│   ├── ImageUploadModal
│   ├── SettingsModal
│   └── HelpModal
└── StatusBar
    ├── PageCounter
    ├── ZoomLevel
    └── LoadingIndicator
```

### 3.2 Component Specifications

#### 3.2.1 App.jsx

**Purpose:** Root component, manages global state

```javascript
import { useState } from "react";
import Toolbar from "./components/Toolbar";
import PDFViewer from "./components/PDFViewer";
import useEditorStore from "./store/editorStore";

function App() {
  const { pdf, currentPage } = useEditorStore();

  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <main className="flex-1 overflow-hidden">
        {pdf ? (
          <PDFViewer pdf={pdf} currentPage={currentPage} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Upload a PDF to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

**Props:** None  
**State:** Managed via Zustand store  
**Lifecycle:** Mounts once, persists throughout app session

---

#### 3.2.2 PDFViewer.jsx

**Purpose:** Renders PDF to canvas, manages editing overlays

```javascript
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import TextOverlay from "./TextOverlay";
import PageNavigation from "./PageNavigation";

function PDFViewer({ pdf, currentPage }) {
  const canvasRef = useRef(null);
  const [textItems, setTextItems] = useState([]);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    renderPage(pdf, currentPage, scale);
  }, [pdf, currentPage, scale]);

  async function renderPage(pdf, pageNum, scale) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF to canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Extract text for overlay
    const textContent = await page.getTextContent();
    const items = textContent.items.map((item) => ({
      text: item.str,
      x: item.transform[4] * scale,
      y: viewport.height - item.transform[5] * scale,
      width: item.width * scale,
      height: item.height * scale,
      fontName: item.fontName,
      fontSize: item.height * scale,
    }));
    setTextItems(items);
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="border border-gray-300" />
      <TextOverlay items={textItems} />
      <PageNavigation
        currentPage={currentPage}
        totalPages={pdf.numPages}
        onPageChange={(page) => useEditorStore.setState({ currentPage: page })}
      />
    </div>
  );
}

export default PDFViewer;
```

**Props:**

- `pdf`: PDFDocumentProxy from PDF.js
- `currentPage`: Number (1-indexed)

**State:**

- `textItems`: Array of text positions
- `scale`: Number (zoom level)

**Methods:**

- `renderPage(pdf, pageNum, scale)`: Renders PDF to canvas
- Extracts text positions for editing overlay

---

#### 3.2.3 TextOverlay.jsx

**Purpose:** Creates editable text elements over PDF

```javascript
import { useState } from "react";
import useEditorStore from "../store/editorStore";

function TextOverlay({ items }) {
  const { addEdit } = useEditorStore();

  function handleTextEdit(item, newText) {
    if (newText !== item.text) {
      addEdit({
        type: "text",
        original: item,
        new: { ...item, text: newText },
        timestamp: Date.now(),
      });
    }
  }

  return (
    <div className="absolute top-0 left-0 pointer-events-none">
      {items.map((item, index) => (
        <div
          key={index}
          contentEditable
          suppressContentEditableWarning
          className="absolute pointer-events-auto"
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: `${item.width}px`,
            minHeight: `${item.height}px`,
            fontSize: `${item.fontSize}px`,
            fontFamily: item.fontName || "Arial",
            lineHeight: 1.2,
          }}
          onBlur={(e) => handleTextEdit(item, e.target.textContent)}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}

export default TextOverlay;
```

**Props:**

- `items`: Array of text items with positions

**Behavior:**

- Creates contentEditable divs overlaid on canvas
- Tracks edits on blur event
- Stores edits in global state for undo/redo

---

#### 3.2.4 Toolbar.jsx

**Purpose:** Main navigation and action buttons

```javascript
import { Upload, Undo, Redo, Download, ZoomIn, ZoomOut } from "lucide-react";
import useEditorStore from "../store/editorStore";
import { loadPDF, downloadPDF } from "../lib/pdfUtils";

function Toolbar() {
  const { pdf, undo, redo, canUndo, canRedo } = useEditorStore();

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const pdfDoc = await loadPDF(file);
      useEditorStore.setState({ pdf: pdfDoc, currentPage: 1 });
    }
  }

  async function handleDownload() {
    const editedPDF = await generateEditedPDF();
    downloadPDF(editedPDF, "edited-document.pdf");
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-300 p-4 flex items-center gap-4">
      <label className="cursor-pointer">
        <Upload className="w-5 h-5" />
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      <button
        onClick={undo}
        disabled={!canUndo}
        className="disabled:opacity-50"
      >
        <Undo className="w-5 h-5" />
      </button>

      <button
        onClick={redo}
        disabled={!canRedo}
        className="disabled:opacity-50"
      >
        <Redo className="w-5 h-5" />
      </button>

      <button
        onClick={handleDownload}
        disabled={!pdf}
        className="disabled:opacity-50"
      >
        <Download className="w-5 h-5" />
      </button>

      <div className="flex gap-2 ml-auto">
        <button>
          <ZoomOut className="w-5 h-5" />
        </button>
        <button>
          <ZoomIn className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

export default Toolbar;
```

**Features:**

- File upload with validation
- Undo/redo buttons (disabled when unavailable)
- Download with watermark
- Zoom controls

---

### 3.3 State Management

#### editorStore.js (Zustand)

```javascript
import create from "zustand";

const useEditorStore = create((set, get) => ({
  // State
  pdf: null,
  currentPage: 1,
  editHistory: [],
  historyIndex: -1,
  scale: 1.5,

  // Setters
  setPdf: (pdf) => set({ pdf, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setScale: (scale) => set({ scale }),

  // Edit tracking
  addEdit: (edit) =>
    set((state) => {
      const newHistory = state.editHistory.slice(0, state.historyIndex + 1);
      newHistory.push(edit);

      // Limit to 10 edits
      if (newHistory.length > 10) {
        newHistory.shift();
      }

      return {
        editHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),

  // Undo/Redo
  undo: () =>
    set((state) => ({
      historyIndex: Math.max(0, state.historyIndex - 1),
    })),

  redo: () =>
    set((state) => ({
      historyIndex: Math.min(
        state.editHistory.length - 1,
        state.historyIndex + 1,
      ),
    })),

  // Computed
  get canUndo() {
    return get().historyIndex > 0;
  },

  get canRedo() {
    const { historyIndex, editHistory } = get();
    return historyIndex < editHistory.length - 1;
  },
}));

export default useEditorStore;
```

**State Structure:**

- `pdf`: PDFDocumentProxy
- `currentPage`: Current page number
- `editHistory`: Array of edit objects
- `historyIndex`: Current position in history
- `scale`: Zoom level

---

## 4. Data Flow

### 4.1 PDF Upload Flow

```javascript
// 1. User selects file
<input type="file" onChange={handleUpload} />;

// 2. Validate file
function validatePDFFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File must be less than 10MB");
  }
  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF");
  }
  return true;
}

// 3. Load with PDF.js
async function loadPDF(file) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  const pdf = await loadingTask.promise;

  return pdf;
}

// 4. Store in state
useEditorStore.setState({ pdf, currentPage: 1 });

// 5. Trigger re-render of PDFViewer
// PDFViewer component re-renders with new pdf prop
```

### 4.2 Text Editing Flow

```javascript
// 1. PDFViewer extracts text positions
const textContent = await page.getTextContent();
const textItems = textContent.items.map(/* transform */);

// 2. TextOverlay creates editable divs
<div contentEditable onBlur={handleTextEdit}>
  {item.text}
</div>

// 3. User edits text
// Browser's contentEditable handles input

// 4. On blur, track change
function handleTextEdit(originalItem, newText) {
  addEdit({
    type: 'text',
    pageNum: currentPage,
    original: originalItem,
    new: { ...originalItem, text: newText },
  });
}

// 5. Edit stored in history
editHistory: [
  { type: 'text', pageNum: 1, original: {...}, new: {...} },
  // ... more edits
]

// 6. On download, apply all edits
async function applyEdits(pdf, edits) {
  const pdfDoc = await PDFDocument.load(pdf);

  for (const edit of edits) {
    if (edit.type === 'text') {
      // Use pdf-lib to modify PDF
      const page = pdfDoc.getPage(edit.pageNum - 1);
      page.drawText(edit.new.text, {/* position, font */});
    }
  }

  return await pdfDoc.save();
}
```

### 4.3 OCR Flow

```javascript
// 1. Detect if PDF is scanned
async function isScannedPDF(page) {
  const textContent = await page.getTextContent();
  const ops = await page.getOperatorList();

  const hasText = textContent.items.length > 0;
  const hasImages = ops.fnArray.includes(pdfjsLib.OPS.paintImageXObject);

  return hasImages && !hasText;
}

// 2. If scanned, extract images
async function extractImages(page) {
  const ops = await page.getOperatorList();
  const images = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
      const imageName = ops.argsArray[i][0];
      const image = await page.objs.get(imageName);
      images.push(image);
    }
  }

  return images;
}

// 3. Run OCR in Web Worker
// worker.js
import Tesseract from "tesseract.js";

self.addEventListener("message", async (e) => {
  if (e.data.type === "OCR") {
    const worker = await Tesseract.createWorker();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    const {
      data: { text, words },
    } = await worker.recognize(e.data.image);

    self.postMessage({
      type: "OCR_RESULT",
      text,
      words: words.map((w) => ({
        text: w.text,
        bbox: w.bbox,
        confidence: w.confidence,
      })),
    });

    await worker.terminate();
  }
});

// 4. Receive OCR results
ocrWorker.addEventListener("message", (e) => {
  if (e.data.type === "OCR_RESULT") {
    const textItems = e.data.words.map((word) => ({
      text: word.text,
      x: word.bbox.x0,
      y: word.bbox.y0,
      width: word.bbox.x1 - word.bbox.x0,
      height: word.bbox.y1 - word.bbox.y0,
    }));

    setTextItems(textItems);
  }
});
```

---

## 5. API Documentation

### 5.1 PDF Loading API

#### `loadPDF(file: File): Promise<PDFDocumentProxy>`

Loads a PDF file and returns a PDF.js document proxy.

**Parameters:**

- `file`: File object from input element

**Returns:**

- Promise resolving to PDFDocumentProxy

**Example:**

```javascript
const file = document.getElementById("upload").files[0];
const pdf = await loadPDF(file);
console.log(`Loaded PDF with ${pdf.numPages} pages`);
```

**Errors:**

- Throws if file > 10MB
- Throws if file is not a PDF
- Throws if PDF is corrupted

---

#### `renderPage(pdf, pageNum, canvas, scale): Promise<void>`

Renders a PDF page to a canvas element.

**Parameters:**

- `pdf`: PDFDocumentProxy
- `pageNum`: Page number (1-indexed)
- `canvas`: HTMLCanvasElement
- `scale`: Number (default: 1.5)

**Returns:**

- Promise resolving when render completes

**Example:**

```javascript
const canvas = document.getElementById("pdf-canvas");
await renderPage(pdf, 1, canvas, 2.0); // 200% zoom
```

---

### 5.2 Text Extraction API

#### `extractTextWithPositions(page): Promise<TextItem[]>`

Extracts text from a PDF page with positioning data.

**Parameters:**

- `page`: PDFPageProxy from PDF.js

**Returns:**

- Promise resolving to array of TextItem objects

**TextItem Interface:**

```typescript
interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
}
```

**Example:**

```javascript
const page = await pdf.getPage(1);
const textItems = await extractTextWithPositions(page);

textItems.forEach((item) => {
  console.log(`"${item.text}" at (${item.x}, ${item.y})`);
});
```

---

### 5.3 PDF Editing API

#### `applyTextEdit(pdfBytes, edit): Promise<Uint8Array>`

Applies a text edit to a PDF.

**Parameters:**

- `pdfBytes`: Uint8Array of original PDF
- `edit`: Edit object

**Edit Object:**

```typescript
interface TextEdit {
  type: "text";
  pageNum: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontName: string;
  color: { r: number; g: number; b: number };
}
```

**Returns:**

- Promise resolving to modified PDF bytes

**Example:**

```javascript
const edit = {
  type: "text",
  pageNum: 1,
  x: 100,
  y: 200,
  text: "New Text",
  fontSize: 14,
  fontName: "Helvetica",
  color: { r: 0, g: 0, b: 0 },
};

const modifiedPDF = await applyTextEdit(originalBytes, edit);
```

---

#### `insertImage(pdfBytes, imageFile, options): Promise<Uint8Array>`

Inserts an image into a PDF.

**Parameters:**

- `pdfBytes`: Uint8Array of original PDF
- `imageFile`: File object (JPEG/PNG)
- `options`: ImageInsertOptions

**ImageInsertOptions:**

```typescript
interface ImageInsertOptions {
  pageNum: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

**Returns:**

- Promise resolving to modified PDF bytes

**Example:**

```javascript
const image = document.getElementById("upload").files[0];
const options = {
  pageNum: 1,
  x: 50,
  y: 50,
  width: 200,
  height: 150,
};

const modifiedPDF = await insertImage(pdfBytes, image, options);
```

---

### 5.4 OCR API

#### `performOCR(imageData, language): Promise<OCRResult>`

Performs OCR on an image.

**Parameters:**

- `imageData`: ImageData or Image URL
- `language`: Language code (default: 'eng')

**Returns:**

- Promise resolving to OCRResult

**OCRResult:**

```typescript
interface OCRResult {
  text: string;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0; y0; x1; y1 };
  }>;
}
```

**Example:**

```javascript
const canvas = document.getElementById("scanned-page");
const imageData = canvas.toDataURL();

const result = await performOCR(imageData, "eng");
console.log(`Extracted: ${result.text}`);
console.log(`Confidence: ${result.words[0].confidence}%`);
```

---

### 5.5 Watermark API

#### `applyWatermark(pdfBytes, text, options): Promise<Uint8Array>`

Adds a watermark to all pages of a PDF.

**Parameters:**

- `pdfBytes`: Uint8Array of PDF
- `text`: Watermark text
- `options`: WatermarkOptions (optional)

**WatermarkOptions:**

```typescript
interface WatermarkOptions {
  position?: "bottom-center" | "top-right" | "center";
  fontSize?: number;
  opacity?: number;
  color?: { r: number; g: number; b: number };
}
```

**Returns:**

- Promise resolving to watermarked PDF bytes

**Example:**

```javascript
const watermarked = await applyWatermark(pdfBytes, "Edited with MyApp", {
  position: "bottom-center",
  fontSize: 12,
  opacity: 0.5,
  color: { r: 0.7, g: 0.7, b: 0.7 },
});
```

---

### 5.6 Download API

#### `downloadPDF(pdfBytes, filename): void`

Triggers browser download of PDF.

**Parameters:**

- `pdfBytes`: Uint8Array of PDF
- `filename`: Download filename

**Returns:**

- void

**Example:**

```javascript
downloadPDF(editedPDF, "my-edited-document.pdf");
```

---

## 6. File Structure

```
pdf-editor/
├── public/
│   ├── index.html               # Main HTML entry point
│   ├── favicon.ico              # App icon
│   └── robots.txt               # SEO configuration
├── src/
│   ├── assets/
│   │   ├── logo.svg             # Application logo
│   │   └── fonts/               # Custom fonts (if needed)
│   ├── components/
│   │   ├── App.jsx              # Root component
│   │   ├── Toolbar.jsx          # Top navigation bar
│   │   ├── PDFViewer.jsx        # Main PDF canvas renderer
│   │   ├── TextOverlay.jsx      # Editable text layer
│   │   ├── ImageOverlay.jsx     # Movable image layer
│   │   ├── PageNavigation.jsx   # Page selector (prev/next)
│   │   ├── ZoomControls.jsx     # Zoom in/out buttons
│   │   ├── ImageUploadModal.jsx # Image insertion dialog
│   │   ├── SettingsModal.jsx    # User preferences
│   │   ├── HelpModal.jsx        # Help & documentation
│   │   ├── LoadingSpinner.jsx   # Loading indicator
│   │   └── ErrorBoundary.jsx    # Error handling component
│   ├── lib/
│   │   ├── pdfLoader.js         # PDF.js wrapper functions
│   │   ├── pdfEditor.js         # pdf-lib wrapper functions
│   │   ├── ocrProcessor.js      # Tesseract.js wrapper
│   │   ├── fontMatcher.js       # Font detection & matching
│   │   ├── canvasRenderer.js    # Canvas drawing utilities
│   │   ├── watermark.js         # Watermark application
│   │   └── fileValidator.js     # File size/type validation
│   ├── hooks/
│   │   ├── usePDFState.js       # PDF state management hook
│   │   ├── useHistory.js        # Undo/redo implementation
│   │   ├── useOCR.js            # OCR processing hook
│   │   ├── useCanvas.js         # Canvas manipulation hook
│   │   └── useFileUpload.js     # File upload handler
│   ├── store/
│   │   └── editorStore.js       # Zustand global state store
│   ├── workers/
│   │   ├── pdf.worker.js        # PDF processing worker
│   │   ├── ocr.worker.js        # OCR processing worker
│   │   └── image.worker.js      # Image processing worker
│   ├── utils/
│   │   ├── fontLibrary.js       # Font mapping database
│   │   ├── constants.js         # App constants (MAX_FILE_SIZE, etc.)
│   │   ├── formatters.js        # Data formatting utilities
│   │   └── validators.js        # Input validation functions
│   ├── styles/
│   │   ├── index.css            # Global styles + Tailwind imports
│   │   └── components.css       # Component-specific styles
│   ├── main.jsx                 # React entry point
│   └── vite-env.d.ts            # Vite type definitions (if using TS)
├── tests/
│   ├── unit/
│   │   ├── pdfLoader.test.js    # PDF loading tests
│   │   ├── pdfEditor.test.js    # PDF editing tests
│   │   ├── ocrProcessor.test.js # OCR tests
│   │   └── fontMatcher.test.js  # Font matching tests
│   ├── integration/
│   │   ├── editWorkflow.test.js # Full editing workflow
│   │   └── ocrWorkflow.test.js  # OCR integration tests
│   └── setup.js                 # Test environment setup
├── .env.example                 # Environment variables template
├── .env.development             # Development environment vars
├── .env.production              # Production environment vars
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── vitest.config.js             # Vitest test configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── README.md                    # Project overview & setup
├── PRD.MD                       # Product Requirements Document
├── CLAUDE.MD                    # AI Development Instructions
├── SKILLS.MD                    # Developer Skill Requirements
├── TECHNICAL_DOCUMENTATION.MD   # This document
└── CONTRIBUTING.md              # Contribution guidelines
```

### 6.1 Directory Descriptions

#### `/public`

Static assets served as-is. Contains HTML template and favicon.

#### `/src/components`

React components for UI. Each component should be self-contained with its own logic.

**Key Components:**

- **App.jsx** - Root component, renders Toolbar + PDFViewer
- **PDFViewer.jsx** - Core PDF rendering, manages canvas and overlays
- **TextOverlay.jsx** - Handles contentEditable text elements
- **Toolbar.jsx** - Navigation and action buttons

#### `/src/lib`

Utility modules that wrap external libraries or provide reusable functions.

**Key Modules:**

- **pdfLoader.js** - PDF.js initialization and page loading
- **pdfEditor.js** - pdf-lib operations (text edits, image insertion)
- **ocrProcessor.js** - Tesseract.js wrapper with preprocessing
- **fontMatcher.js** - Font detection and fallback matching

#### `/src/hooks`

Custom React hooks for reusable stateful logic.

**Key Hooks:**

- **usePDFState.js** - Manages PDF document state
- **useHistory.js** - Undo/redo stack management
- **useOCR.js** - OCR processing with loading states

#### `/src/store`

Zustand state management store.

**editorStore.js Structure:**

```javascript
{
  pdf: PDFDocumentProxy | null,
  currentPage: number,
  editHistory: Edit[],
  historyIndex: number,
  scale: number,
  // ... actions
}
```

#### `/src/workers`

Web Workers for background processing to prevent UI blocking.

**Workers:**

- **pdf.worker.js** - Heavy PDF parsing operations
- **ocr.worker.js** - Tesseract.js OCR processing
- **image.worker.js** - Image resizing and preprocessing

#### `/src/utils`

Generic utility functions and constants.

**Key Files:**

- **constants.js** - MAX_FILE_SIZE, SUPPORTED_FORMATS, etc.
- **fontLibrary.js** - Font name mappings and fallbacks
- **validators.js** - File validation functions

#### `/tests`

Test files organized by type (unit, integration, e2e).

### 6.2 Configuration Files

#### vite.config.js

```javascript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["pdfjs-dist", "pdf-lib", "tesseract.js"],
  },
  worker: {
    format: "es",
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "pdf-vendor": ["pdfjs-dist", "pdf-lib"],
          "ocr-vendor": ["tesseract.js"],
        },
      },
    },
  },
});
```

#### tailwind.config.js

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
      },
    },
  },
  plugins: [],
};
```

#### package.json (Key Scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "lint": "eslint src --ext js,jsx",
    "format": "prettier --write \"src/**/*.{js,jsx,css}\""
  }
}
```

### 6.3 Environment Variables

#### .env.example

```bash
# PDF.js Worker
VITE_PDF_WORKER_URL=https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js

# Tesseract.js Language Data
VITE_TESSERACT_LANG_PATH=https://tessdata.projectnaptha.com/4.0.0

# File Constraints
VITE_MAX_FILE_SIZE=10485760
VITE_MAX_PAGES_FREE=10

# Watermark
VITE_WATERMARK_TEXT=Edited with PDF Editor
VITE_WATERMARK_ENABLED=true

# Feature Flags
VITE_ENABLE_OCR=true
VITE_ENABLE_IMAGE_EDIT=true
```

### 6.4 File Naming Conventions

- **Components**: PascalCase with `.jsx` extension (e.g., `PDFViewer.jsx`)
- **Utilities**: camelCase with `.js` extension (e.g., `pdfLoader.js`)
- **Hooks**: camelCase starting with `use` (e.g., `usePDFState.js`)
- **Tests**: Same name as file + `.test.js` (e.g., `pdfLoader.test.js`)
- **Constants**: UPPER_SNAKE_CASE in `constants.js`
- **CSS**: kebab-case (e.g., `pdf-viewer.css` if needed)

### 6.5 Import Path Examples

```javascript
// Components
import PDFViewer from "./components/PDFViewer";
import Toolbar from "./components/Toolbar";

// Library functions
import { loadPDF, renderPage } from "./lib/pdfLoader";
import { applyTextEdit, insertImage } from "./lib/pdfEditor";

// Hooks
import usePDFState from "./hooks/usePDFState";
import useHistory from "./hooks/useHistory";

// Store
import useEditorStore from "./store/editorStore";

// Utils
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from "./utils/constants";
import { validatePDFFile } from "./utils/validators";

// Workers (dynamic import)
const pdfWorker = new Worker(
  new URL("./workers/pdf.worker.js", import.meta.url),
);
```

### 6.6 Code Organization Best Practices

1. **Single Responsibility**: Each file should have one clear purpose
2. **Colocation**: Keep related files together (component + its styles + tests)
3. **Barrel Exports**: Use `index.js` files to simplify imports (optional)
4. **Absolute Imports**: Configure Vite for `@/` prefix (optional enhancement)

### 6.7 Build Output Structure

After running `npm run build`, the `/dist` folder contains:

```
dist/
├── index.html                    # Minified HTML
├── assets/
│   ├── index-[hash].js          # Main application bundle
│   ├── index-[hash].css         # Compiled styles
│   ├── pdf-vendor-[hash].js     # PDF libraries chunk
│   ├── ocr-vendor-[hash].js     # OCR library chunk
│   └── pdf.worker-[hash].js     # PDF.js worker
└── favicon.ico                   # Static assets
```

**Bundle Size Targets:**

- Main bundle: < 500 KB (gzipped)
- PDF vendor: < 800 KB (gzipped)
- OCR vendor: < 2 MB (gzipped, loaded on-demand)
- Total initial load: < 1.5 MB (gzipped)
