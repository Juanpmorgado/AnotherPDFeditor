# CLAUDE.MD - AI Assistant Instructions

## PDF Editor Web Application Development Guide

**Purpose:** This document provides instructions for AI assistants (Claude, GPT-4, etc.) to help developers build the PDF editor application defined in PRD.MD.

---

## 1. Project Context

You are assisting in building a **client-side PDF editing web application** that allows users to:

- Upload PDFs (up to 10MB)
- Edit text inline while preserving exact formatting
- Use OCR on scanned documents
- Insert, move, and delete images
- Download edited PDFs with watermarks (free tier)

**Key Constraints:**

- ✅ Client-side only (no server uploads)
- ✅ Free and open-source libraries only
- ✅ Must preserve exact PDF formatting, fonts, colors
- ✅ Support multi-page PDFs
- ✅ Freemium business model

---

## 2. Technology Stack Guidelines

### 2.1 Recommended Core Libraries

#### PDF Rendering & Editing

```javascript
// Primary: PDF.js for rendering
import * as pdfjsLib from "pdfjs-dist";

// Primary: pdf-lib for editing and manipulation
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Alternative: jsPDF for creating new PDFs from scratch
import jsPDF from "jspdf";
```

#### OCR (Optical Character Recognition)

```javascript
// Use Tesseract.js - free, client-side OCR
import Tesseract from "tesseract.js";

// Configuration for optimal results
const worker = await Tesseract.createWorker({
  logger: (m) => console.log(m), // Progress tracking
  langPath: "https://tessdata.projectnaptha.com/4.0.0",
});
await worker.loadLanguage("eng");
await worker.initialize("eng");
```

#### Font Handling

```javascript
// Use opentype.js for font parsing and embedding
import opentype from "opentype.js";

// For font detection and matching
// Use CSS Font Loading API
document.fonts.ready.then(() => {
  // Check if font is available
});
```

#### State Management

```javascript
// Option 1: Zustand (lightweight)
import create from "zustand";

const useEditorStore = create((set) => ({
  pdf: null,
  currentPage: 1,
  history: [],
  setPdf: (pdf) => set({ pdf }),
}));

// Option 2: React Context API (if using React)
const EditorContext = React.createContext();
```

### 2.2 Development Environment Setup

When helping developers set up the project, provide these instructions:

```bash
# Initialize project with Vite (fast, modern bundler)
npm create vite@latest pdf-editor -- --template react
cd pdf-editor

# Install core dependencies
npm install pdfjs-dist pdf-lib tesseract.js
npm install opentype.js fabric # For canvas manipulation

# Install UI dependencies
npm install tailwindcss @headlessui/react lucide-react
npx tailwindcss init

# Install dev dependencies
npm install -D @types/pdfjs-dist
```

---

## 3. Architecture Patterns

### 3.1 File Structure

When generating code, organize files as follows:

```
src/
├── components/
│   ├── PDFViewer.jsx          # Main PDF canvas renderer
│   ├── Toolbar.jsx             # Top navbar with tools
│   ├── PageNavigation.jsx      # Page selector for multi-page
│   ├── TextEditor.jsx          # Inline text editing component
│   ├── ImageInserter.jsx       # Image upload/URL modal
│   └── DownloadButton.jsx      # Export functionality
├── lib/
│   ├── pdfLoader.js            # PDF.js loading logic
│   ├── pdfEditor.js            # pdf-lib editing operations
│   ├── ocrProcessor.js         # Tesseract.js OCR wrapper
│   ├── fontMatcher.js          # Font detection and embedding
│   └── canvasRenderer.js       # Canvas drawing utilities
├── hooks/
│   ├── usePDFState.js          # State management for PDF
│   ├── useHistory.js           # Undo/redo implementation
│   └── useOCR.js               # OCR processing hook
├── utils/
│   ├── fontLibrary.js          # Font mapping database
│   ├── watermark.js            # Watermark application
│   └── validators.js           # File size/type validation
└── App.jsx                     # Main application component
```

### 3.2 Core Workflow Implementation

#### Step 1: PDF Upload & Rendering

```javascript
// Example: PDFViewer component pattern
import * as pdfjsLib from "pdfjs-dist";

async function loadPDF(file) {
  // Set worker for performance
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  // Render first page
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.5 });

  const canvas = document.getElementById("pdf-canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;

  return pdf;
}
```

#### Step 2: Text Detection and Editing

```javascript
// Extract text with positioning data
async function extractTextWithPositions(page) {
  const textContent = await page.getTextContent();

  return textContent.items.map((item) => ({
    text: item.str,
    x: item.transform[4],
    y: item.transform[5],
    width: item.width,
    height: item.height,
    fontName: item.fontName,
    fontSize: item.height, // Approximate
  }));
}

// Make text clickable for editing
function createEditableTextOverlay(textItems) {
  textItems.forEach((item) => {
    const div = document.createElement("div");
    div.contentEditable = true;
    div.style.position = "absolute";
    div.style.left = `${item.x}px`;
    div.style.top = `${item.y}px`;
    div.style.fontSize = `${item.fontSize}px`;
    div.textContent = item.text;

    div.addEventListener("blur", () => {
      // Update PDF with new text
      updatePDFText(item, div.textContent);
    });

    document.getElementById("text-overlay").appendChild(div);
  });
}
```

#### Step 3: OCR for Scanned PDFs

```javascript
// Detect if PDF is scanned (image-based)
async function isScannedPDF(page) {
  const textContent = await page.getTextContent();
  const operatorList = await page.getOperatorList();

  const hasText = textContent.items.length > 0;
  const hasImages = operatorList.fnArray.some(
    (fn) => fn === pdfjsLib.OPS.paintImageXObject,
  );

  return hasImages && !hasText; // Images but no text = scanned
}

// Apply OCR to extract text
async function performOCR(imageData) {
  const {
    data: { text, words },
  } = await Tesseract.recognize(imageData, "eng");

  // Return structured data with positions
  return words.map((word) => ({
    text: word.text,
    x: word.bbox.x0,
    y: word.bbox.y0,
    width: word.bbox.x1 - word.bbox.x0,
    height: word.bbox.y1 - word.bbox.y0,
    confidence: word.confidence,
  }));
}
```

#### Step 4: Font Preservation

```javascript
// Font matching database (simplified)
const FONT_MAPPINGS = {
  Helvetica: "Arial, sans-serif",
  Times: "Times New Roman, serif",
  Courier: "Courier New, monospace",
  // Add more mappings
};

async function embedCustomFont(pdfDoc, fontName, fontUrl) {
  const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
  const customFont = await pdfDoc.embedFont(fontBytes);
  return customFont;
}

// Try to match font visually if exact font unavailable
function findClosestFont(targetFont) {
  // Use font metrics: serif/sans-serif, weight, width
  // Return closest web-safe alternative
  return FONT_MAPPINGS[targetFont] || "Arial, sans-serif";
}
```

#### Step 5: Editing and Modification

```javascript
import { PDFDocument, rgb } from "pdf-lib";

async function updatePDFText(originalPDF, pageNum, textEdits) {
  const pdfDoc = await PDFDocument.load(originalPDF);
  const page = pdfDoc.getPage(pageNum - 1);

  textEdits.forEach((edit) => {
    // Remove old text (draw white rectangle over it)
    page.drawRectangle({
      x: edit.x,
      y: page.getHeight() - edit.y - edit.height,
      width: edit.width,
      height: edit.height,
      color: rgb(1, 1, 1), // White
    });

    // Draw new text
    page.drawText(edit.newText, {
      x: edit.x,
      y: page.getHeight() - edit.y - edit.height,
      size: edit.fontSize,
      font: edit.font, // Must be embedded
      color: rgb(edit.color.r, edit.color.g, edit.color.b),
    });
  });

  return await pdfDoc.save();
}
```

#### Step 6: Image Insertion

```javascript
async function insertImage(pdfDoc, pageNum, imageFile, x, y, width, height) {
  const page = pdfDoc.getPage(pageNum - 1);

  // Determine image type
  let image;
  if (imageFile.type === "image/jpeg") {
    const imageBytes = await imageFile.arrayBuffer();
    image = await pdfDoc.embedJpg(imageBytes);
  } else if (imageFile.type === "image/png") {
    const imageBytes = await imageFile.arrayBuffer();
    image = await pdfDoc.embedPng(imageBytes);
  }

  page.drawImage(image, {
    x,
    y: page.getHeight() - y - height,
    width,
    height,
  });

  return await pdfDoc.save();
}
```

#### Step 7: Undo/Redo System

```javascript
// Use immutable state pattern
class EditHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  push(state) {
    // Remove any redo states
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(state);
    this.currentIndex++;

    // Limit to 10 states (as per PRD)
    if (this.history.length > 10) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}
```

#### Step 8: Watermark Application

```javascript
async function applyWatermark(
  pdfBytes,
  watermarkText = "Edited with [YourApp]",
) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    page.drawText(watermarkText, {
      x: width / 2 - 100,
      y: 30,
      size: 12,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.5,
    });
  });

  return await pdfDoc.save();
}
```

#### Step 9: Download Functionality

```javascript
function downloadPDF(pdfBytes, filename = "edited-document.pdf") {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  // Cleanup
  URL.revokeObjectURL(url);
}
```

---

## 4. Common Challenges & Solutions

### Challenge 1: Large File Performance

**Problem:** 10MB PDFs slow down browser  
**Solution:**

```javascript
// Use Web Workers for heavy processing
// worker.js
self.addEventListener("message", async (e) => {
  if (e.data.type === "PROCESS_PDF") {
    const result = await processPDF(e.data.file);
    self.postMessage({ type: "RESULT", data: result });
  }
});

// main.js
const worker = new Worker("worker.js");
worker.postMessage({ type: "PROCESS_PDF", file: pdfFile });
worker.addEventListener("message", (e) => {
  if (e.data.type === "RESULT") {
    displayPDF(e.data.data);
  }
});
```

### Challenge 2: Font Not Available

**Problem:** Embedded font not in browser  
**Solution:**

```javascript
// 1. Try to load font from CDN
async function loadGoogleFont(fontName) {
  const link = document.createElement("link");
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}`;
  link.rel = "stylesheet";
  document.head.appendChild(link);

  await document.fonts.ready;
  return document.fonts.check(`12px "${fontName}"`);
}

// 2. If unavailable, use visual matching algorithm
function matchFontByMetrics(targetFont) {
  const metrics = analyzeFontMetrics(targetFont);
  return findSimilarFont(metrics);
}
```

### Challenge 3: OCR Accuracy

**Problem:** Tesseract.js produces errors on complex layouts  
**Solution:**

```javascript
// Pre-process image for better OCR
async function preprocessImage(imageData) {
  // Convert to grayscale
  // Increase contrast
  // Remove noise
  // Return processed image
}

// Allow manual correction
function createEditableOCROverlay(ocrResults) {
  // Show OCR text with confidence scores
  // Let user click to correct low-confidence words
}
```

### Challenge 4: Layout Preservation

**Problem:** Edited text breaks layout  
**Solution:**

```javascript
// Implement text box auto-resize (like pdfaid.com)
function resizeTextBox(textBox, newContent) {
  const originalWidth = textBox.width;
  const newWidth = measureTextWidth(newContent, textBox.fontSize);

  if (newWidth > originalWidth) {
    // Expand box to the right
    textBox.width = newWidth;
  } else {
    // Keep original width
  }

  // Adjust height if multi-line
  const lines = wrapText(newContent, originalWidth, textBox.fontSize);
  textBox.height = lines.length * textBox.fontSize * 1.2;
}
```

---

## 5. Testing Instructions

### 5.1 Unit Tests

When writing tests, focus on these critical functions:

```javascript
// Test PDF loading
describe("PDFLoader", () => {
  it("should load valid PDF files", async () => {
    const file = new File([mockPDFBytes], "test.pdf", {
      type: "application/pdf",
    });
    const pdf = await loadPDF(file);
    expect(pdf.numPages).toBeGreaterThan(0);
  });

  it("should reject files over 10MB", async () => {
    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)],
      "large.pdf",
    );
    await expect(loadPDF(largeFile)).rejects.toThrow("File too large");
  });
});

// Test text editing
describe("TextEditor", () => {
  it("should preserve font properties", async () => {
    const edit = { text: "New", fontName: "Helvetica", fontSize: 12 };
    const result = await applyTextEdit(mockPDF, edit);
    expect(result.fontName).toBe("Helvetica");
    expect(result.fontSize).toBe(12);
  });
});

// Test OCR
describe("OCRProcessor", () => {
  it("should extract text from scanned images", async () => {
    const text = await performOCR(mockScannedImage);
    expect(text).toContain("expected text");
  });
});
```

### 5.2 Integration Tests

```javascript
// Test full workflow
describe("PDF Editing Workflow", () => {
  it("should upload, edit, and download PDF", async () => {
    // 1. Upload
    const pdf = await uploadPDF(mockFile);

    // 2. Edit text
    const edited = await editText(pdf, "New Text");

    // 3. Add watermark
    const watermarked = await applyWatermark(edited);

    // 4. Download
    const blob = await downloadPDF(watermarked);
    expect(blob.type).toBe("application/pdf");
  });
});
```

### 5.3 Manual Testing Checklist

Provide this to developers:

- [ ] Upload PDF via drag-and-drop
- [ ] Upload PDF via file browser
- [ ] Click on text and edit inline
- [ ] Verify font matches original
- [ ] Test multi-page navigation
- [ ] Upload scanned PDF and run OCR
- [ ] Insert image from computer
- [ ] Insert image from URL
- [ ] Undo last 5 actions
- [ ] Redo undone actions
- [ ] Download edited PDF
- [ ] Verify watermark appears on download
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on tablet (iPad)
- [ ] Verify file size < 10MB enforced

---

## 6. Performance Optimization Tips

When helping optimize the application:

### 6.1 Lazy Loading

```javascript
// Only load pages as needed
async function loadPage(pdf, pageNum) {
  if (cache[pageNum]) return cache[pageNum];

  const page = await pdf.getPage(pageNum);
  cache[pageNum] = page;
  return page;
}
```

### 6.2 Canvas Optimization

```javascript
// Use offscreen canvas for rendering
const offscreen = new OffscreenCanvas(width, height);
const ctx = offscreen.getContext("2d");
// Render to offscreen, then transfer to visible canvas
```

### 6.3 Debounce Text Editing

```javascript
// Avoid updating PDF on every keystroke
const debouncedUpdate = debounce((text) => {
  updatePDFText(text);
}, 500);

textInput.addEventListener("input", (e) => {
  debouncedUpdate(e.target.value);
});
```

---

## 7. Code Style & Conventions

When generating code, follow these guidelines:

### 7.1 Naming Conventions

- Components: PascalCase (`PDFViewer`, `TextEditor`)
- Functions: camelCase (`loadPDF`, `applyWatermark`)
- Constants: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`, `FONT_MAPPINGS`)
- Files: kebab-case (`pdf-loader.js`, `text-editor.jsx`)

### 7.2 Error Handling

Always include error handling:

```javascript
async function loadPDF(file) {
  try {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File exceeds 10MB limit");
    }

    const pdf = await pdfjsLib.getDocument(file).promise;
    return pdf;
  } catch (error) {
    console.error("PDF loading failed:", error);
    showUserError("Unable to load PDF. Please try a different file.");
    return null;
  }
}
```

### 7.3 Comments

Add comments for complex logic:

```javascript
// Extract text positions from PDF.js TextContent
// TextContent uses transform matrices [a, b, c, d, e, f]
// where e = x position, f = y position
const x = item.transform[4];
const y = item.transform[5];
```

---

## 8. Deployment Checklist

Before deployment, ensure:

### 8.1 Build Optimization

```bash
# Production build with Vite
npm run build

# Verify bundle size
npm run analyze

# Test production build locally
npm run preview
```

### 8.2 Environment Variables

```bash
# .env.production
VITE_TESSERACT_LANG_PATH=https://tessdata.projectnaptha.com/4.0.0
VITE_MAX_FILE_SIZE=10485760
VITE_WATERMARK_TEXT=Edited with [YourApp]
```

### 8.3 CDN Configuration

```html
<!-- Preload critical resources -->
<link
  rel="preload"
  href="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
  as="script"
/>
```

---

## 9. Common User Questions

Prepare responses to these FAQs:

**Q: "My PDF won't upload"**  
A: Check file size (<10MB), file type (must be .pdf), and browser compatibility (Chrome 90+)

**Q: "Text looks different after editing"**  
A: Font may not be available. Try using a similar font or contact support for font embedding.

**Q: "OCR is not working"**  
A: Ensure the PDF is actually scanned (image-based). OCR may take 30+ seconds for large documents.

**Q: "Can I remove the watermark?"**  
A: Watermarks are applied to free tier downloads. Upgrade to premium for watermark-free PDFs.

---

## 10. Next Steps for AI Assistance

When a developer asks for help, you should:

1. **Understand the specific problem** - Ask which component or feature they're working on
2. **Reference this document** - Point to relevant sections in CLAUDE.MD
3. **Provide working code examples** - Use patterns from Section 3.2
4. **Consider PRD requirements** - Ensure solutions meet PRD.MD specifications
5. **Check SKILLS.MD** - Recommend skills developer should learn for the task
6. **Suggest testing** - Remind about test coverage from Section 5

**Example Developer Request:**
"I need help implementing click-to-edit text"

**Your Response Should Include:**

- Reference to Section 3.2, Step 2 (Text Detection and Editing)
- Code example for `createEditableTextOverlay()`
- Reminder to preserve font properties (FR-009 in PRD)
- Suggestion to test with various fonts
- Link to SKILLS.MD section on Canvas API

---

## 11. Troubleshooting Guide

### Issue: PDF.js Worker Not Loading

```javascript
// Solution: Use CDN worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### Issue: Memory Leak with Large PDFs

```javascript
// Solution: Clean up canvas contexts
function cleanupPage(page) {
  page.cleanup();
  page = null;
}
```

### Issue: CORS Error Loading External Images

```javascript
// Solution: Use proxy or convert to blob
async function loadImageFromURL(url) {
  const response = await fetch(url, { mode: "cors" });
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

---

**Document Maintenance:**

- Update this document when new features are added
- Add new code patterns as they're discovered
- Keep library versions current in Section 2.1
