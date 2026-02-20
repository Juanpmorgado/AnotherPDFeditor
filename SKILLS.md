# SKILLS.MD - Developer Skill Requirements

## PDF Editor Web Application

**Purpose:** This document outlines the technical skills, knowledge areas, and learning resources required for developers working on the PDF editor project.

---

## 1. Skill Level Matrix

### 1.1 Minimum Required Skills (Must Have)

These skills are essential for contributing to the project:

| Skill Area           | Level Required | Priority |
| -------------------- | -------------- | -------- |
| JavaScript (ES6+)    | Intermediate   | Critical |
| HTML5 & CSS3         | Intermediate   | Critical |
| React.js             | Intermediate   | High     |
| Canvas API           | Beginner       | Critical |
| Async/Await Patterns | Intermediate   | Critical |
| Git & GitHub         | Beginner       | High     |
| Browser DevTools     | Intermediate   | High     |

### 1.2 Recommended Skills (Should Have)

These skills will significantly improve development efficiency:

| Skill Area                 | Level Required | Priority |
| -------------------------- | -------------- | -------- |
| TypeScript                 | Beginner       | Medium   |
| Web Workers                | Beginner       | High     |
| IndexedDB                  | Beginner       | Medium   |
| Vite/Webpack               | Beginner       | Medium   |
| Tailwind CSS               | Beginner       | Medium   |
| Unit Testing (Jest/Vitest) | Beginner       | Medium   |

### 1.3 Nice-to-Have Skills

These skills are beneficial but not required:

| Skill Area                  | Level    | Priority |
| --------------------------- | -------- | -------- |
| WebAssembly (Wasm)          | Beginner | Low      |
| Computer Vision Basics      | Beginner | Low      |
| PDF Specification Knowledge | Beginner | Low      |
| SVG Manipulation            | Beginner | Low      |
| Accessibility (WCAG)        | Beginner | Low      |

---

## 2. Core Skill Breakdown

### 2.1 JavaScript (ES6+) - CRITICAL

#### Required Concepts

- **Array Methods:** `map`, `filter`, `reduce`, `find`, `forEach`
- **Destructuring:** Object and array destructuring
- **Spread/Rest Operators:** `...` for copying and function arguments
- **Arrow Functions:** Syntax and `this` binding
- **Promises & Async/Await:** Asynchronous programming
- **Modules:** `import`/`export` statements
- **Template Literals:** String interpolation with backticks
- **Optional Chaining:** `?.` and `??` operators

#### Why It's Needed

The entire PDF editor runs in JavaScript. You'll work with:

- Asynchronous PDF loading and processing
- Array manipulation for page management
- Object destructuring for library APIs
- Module imports for PDF.js, pdf-lib, Tesseract.js

#### Learning Resources

```
Free:
- MDN Web Docs: JavaScript Guide
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide

- JavaScript.info - Modern JavaScript Tutorial
  https://javascript.info/

- freeCodeCamp: JavaScript Algorithms and Data Structures
  https://www.freecodecamp.org/learn

Paid:
- Frontend Masters: JavaScript - The Hard Parts
- Udemy: The Complete JavaScript Course 2024
```

#### Practice Exercises

```javascript
// Exercise 1: Array manipulation
const pages = [
  { num: 1, text: "Hello" },
  { num: 2, text: "World" },
];

// Task: Extract all text into single string
const allText = pages.map((p) => p.text).join(" ");

// Exercise 2: Async/await
async function loadMultiplePages(pdf, pageNumbers) {
  const promises = pageNumbers.map((num) => pdf.getPage(num));
  const pages = await Promise.all(promises);
  return pages;
}

// Exercise 3: Destructuring
const { text, x, y, fontSize } = textItem;
```

---

### 2.2 HTML5 Canvas API - CRITICAL

#### Required Concepts

- **Canvas Setup:** Creating and sizing canvas elements
- **2D Context:** `getContext('2d')` and drawing methods
- **Drawing Operations:** `drawImage`, `fillText`, `fillRect`, `strokeRect`
- **Transformations:** `translate`, `rotate`, `scale`
- **Coordinate System:** Understanding x/y positioning
- **Image Data:** `getImageData`, `putImageData`
- **Canvas State:** `save` and `restore`

#### Why It's Needed

PDF.js renders PDFs to HTML5 Canvas. You'll need to:

- Render PDF pages to canvas
- Overlay editable text on canvas
- Draw selection rectangles
- Handle click coordinates for editing

#### Learning Resources

```
Free:
- MDN: Canvas API
  https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

- Canvas Tutorial by W3Schools
  https://www.w3schools.com/html/html5_canvas.asp

Interactive:
- Canvas Cheat Sheet
  https://devhints.io/canvas
```

#### Practice Exercises

```javascript
// Exercise 1: Render PDF page to canvas
const canvas = document.getElementById("pdf-canvas");
const context = canvas.getContext("2d");

async function renderPage(page) {
  const viewport = page.getViewport({ scale: 1.5 });
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
}

// Exercise 2: Draw text overlay
context.font = "16px Arial";
context.fillStyle = "blue";
context.fillText("Editable Text", 100, 100);

// Exercise 3: Handle click coordinates
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  console.log(`Clicked at: ${x}, ${y}`);
});
```

---

### 2.3 React.js - HIGH PRIORITY

#### Required Concepts

- **Functional Components:** Modern React with hooks
- **Hooks:** `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`
- **Props & State:** Passing data and managing state
- **Event Handling:** `onClick`, `onChange`, `onDragOver`
- **Conditional Rendering:** Showing/hiding elements
- **Lists & Keys:** Rendering arrays with unique keys
- **Component Lifecycle:** Understanding when components mount/update

#### Why It's Needed

The UI is built with React:

- PDF viewer component
- Toolbar with editing tools
- Page navigation
- Modal dialogs for image upload

#### Learning Resources

```
Free:
- React Official Docs (New)
  https://react.dev/

- freeCodeCamp: React Course
  https://www.youtube.com/watch?v=bMknfKXIFA8

- Scrimba: Learn React for Free
  https://scrimba.com/learn/learnreact

Paid:
- Epic React by Kent C. Dodds
- Frontend Masters: Complete Intro to React
```

#### Practice Exercises

```javascript
// Exercise 1: PDF Viewer Component
function PDFViewer({ file }) {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadPDF(file).then(setPdf);
  }, [file]);

  return (
    <div>
      <canvas ref={canvasRef} />
      <button onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
      <button onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
    </div>
  );
}

// Exercise 2: Toolbar Component
function Toolbar({ onUndo, onRedo, onDownload }) {
  return (
    <nav className="flex gap-4 p-4 bg-gray-100">
      <button onClick={onUndo}>Undo</button>
      <button onClick={onRedo}>Redo</button>
      <button onClick={onDownload}>Download</button>
    </nav>
  );
}
```

---

### 2.4 Web Workers - HIGH PRIORITY

#### Required Concepts

- **Worker Creation:** Creating and instantiating workers
- **Message Passing:** `postMessage` and `addEventListener('message')`
- **Worker Scope:** Understanding `self` in worker context
- **Transferable Objects:** Efficient data transfer
- **Worker Lifecycle:** Terminating workers

#### Why It's Needed

Heavy processing (PDF rendering, OCR) blocks the main thread:

- Process large PDFs without freezing UI
- Run OCR in background
- Parallel page rendering

#### Learning Resources

```
Free:
- MDN: Using Web Workers
  https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

- Web Workers Tutorial
  https://www.html5rocks.com/en/tutorials/workers/basics/
```

#### Practice Exercises

```javascript
// worker.js
self.addEventListener("message", async (e) => {
  if (e.data.type === "OCR") {
    const result = await performOCR(e.data.image);
    self.postMessage({ type: "OCR_RESULT", data: result });
  }
});

// main.js
const worker = new Worker("worker.js");

worker.postMessage({ type: "OCR", image: imageData });

worker.addEventListener("message", (e) => {
  if (e.data.type === "OCR_RESULT") {
    console.log("OCR completed:", e.data.data);
  }
});
```

---

### 2.5 PDF-Specific Libraries

#### 2.5.1 PDF.js (Rendering)

**Key Concepts:**

- Loading PDFs from ArrayBuffer
- Rendering pages to canvas
- Extracting text content with positions
- Understanding PDF coordinate systems

**Learning Resources:**

```
Official:
- PDF.js Documentation
  https://mozilla.github.io/pdf.js/

- PDF.js Examples
  https://github.com/mozilla/pdf.js/tree/master/examples

Community:
- PDF.js Tutorial by LogRocket
  https://blog.logrocket.com/pdfjs-tutorial/
```

**Code Example:**

```javascript
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadPDF(url) {
  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;

  console.log(`PDF loaded, ${pdf.numPages} pages`);

  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();

  textContent.items.forEach((item) => {
    console.log(item.str, item.transform);
  });
}
```

#### 2.5.2 pdf-lib (Editing)

**Key Concepts:**

- Loading and modifying existing PDFs
- Drawing text and shapes
- Embedding fonts and images
- Saving modified PDFs

**Learning Resources:**

```
Official:
- pdf-lib Documentation
  https://pdf-lib.js.org/

- pdf-lib Examples
  https://github.com/Hopding/pdf-lib/tree/master/examples
```

**Code Example:**

```javascript
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function modifyPDF(existingPdfBytes) {
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  firstPage.drawText("Modified Text", {
    x: 50,
    y: 500,
    size: 20,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
```

#### 2.5.3 Tesseract.js (OCR)

**Key Concepts:**

- Initializing OCR workers
- Language data loading
- Image preprocessing for better accuracy
- Extracting text with bounding boxes

**Learning Resources:**

```
Official:
- Tesseract.js Documentation
  https://tesseract.projectnaptha.com/

- Tesseract.js GitHub
  https://github.com/naptha/tesseract.js

Tutorials:
- OCR with Tesseract.js Tutorial
  https://www.digitalocean.com/community/tutorials/js-ocr-tesseract-js
```

**Code Example:**

```javascript
import Tesseract from "tesseract.js";

async function extractText(imageElement) {
  const worker = await Tesseract.createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");

  const {
    data: { text, words },
  } = await worker.recognize(imageElement);

  console.log("Extracted text:", text);

  words.forEach((word) => {
    console.log(word.text, word.bbox);
  });

  await worker.terminate();
  return text;
}
```

---

### 2.6 File Handling & Storage

#### Required Concepts

- **File API:** Reading files with FileReader
- **Blob & ArrayBuffer:** Understanding binary data
- **IndexedDB:** Client-side database for temporary storage
- **Download Files:** Creating blob URLs and triggering downloads

#### Why It's Needed

- Upload PDFs from user's computer
- Store temporary edits in browser
- Download edited PDFs

#### Learning Resources

```
Free:
- MDN: Using Files from Web Applications
  https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications

- IndexedDB Tutorial
  https://javascript.info/indexeddb
```

#### Practice Exercises

```javascript
// Exercise 1: Read PDF file
async function handleFileUpload(event) {
  const file = event.target.files[0];

  if (file.type !== "application/pdf") {
    alert("Please upload a PDF file");
    return;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await loadPDF(arrayBuffer);
}

// Exercise 2: Download edited PDF
function downloadPDF(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
```

---

### 2.7 State Management

#### Required Concepts

- **Global State:** Managing app-wide state
- **Zustand:** Lightweight state library
- **Immutability:** Never mutating state directly
- **Derived State:** Computing values from state

#### Why It's Needed

- Track current PDF document
- Manage editing history (undo/redo)
- Store user preferences

#### Learning Resources

```
Zustand:
- Official Documentation
  https://github.com/pmndrs/zustand

- Zustand Tutorial
  https://www.youtube.com/watch?v=AYO4qHAnLQI

React Context (Alternative):
- React Docs: Context
  https://react.dev/reference/react/useContext
```

#### Practice Exercises

```javascript
import create from "zustand";

// Exercise: Create PDF editor store
const useEditorStore = create((set, get) => ({
  pdf: null,
  currentPage: 1,
  editHistory: [],

  setPdf: (pdf) => set({ pdf }),

  setCurrentPage: (page) => set({ currentPage: page }),

  addEdit: (edit) =>
    set((state) => ({
      editHistory: [...state.editHistory, edit],
    })),

  undo: () =>
    set((state) => ({
      editHistory: state.editHistory.slice(0, -1),
    })),
}));

// Usage in component
function PDFEditor() {
  const { pdf, setPdf, undo } = useEditorStore();

  return <button onClick={undo}>Undo</button>;
}
```

---

## 3. Skill Development Path

### 3.1 Week 1-2: JavaScript Fundamentals

**Goal:** Master async/await, array methods, ES6+ features

**Tasks:**

- [ ] Complete JavaScript.info Modern JavaScript course
- [ ] Build 3 small projects using async/await
- [ ] Practice array manipulation with PDF-like data structures

**Mini-Project:**
Create a simple app that loads a JSON file (simulating PDF), displays pages, and allows navigation.

---

### 3.2 Week 3-4: Canvas & React Basics

**Goal:** Render content to canvas, build React components

**Tasks:**

- [ ] Complete MDN Canvas tutorial
- [ ] Build a drawing app with canvas
- [ ] Complete React official tutorial
- [ ] Build a file upload component with preview

**Mini-Project:**
Create a React app that uploads an image and displays it on canvas with zoom controls.

---

### 3.3 Week 5-6: PDF.js Integration

**Goal:** Load and render PDFs

**Tasks:**

- [ ] Read PDF.js documentation
- [ ] Build a basic PDF viewer
- [ ] Extract text from PDFs with positioning
- [ ] Implement page navigation

**Mini-Project:**
Create a PDF viewer that shows page thumbnails and renders selected page to canvas.

---

### 3.4 Week 7-8: pdf-lib & Editing

**Goal:** Modify PDFs programmatically

**Tasks:**

- [ ] Study pdf-lib examples
- [ ] Add text to existing PDFs
- [ ] Draw shapes and images
- [ ] Implement download functionality

**Mini-Project:**
Build an app that adds a custom watermark to uploaded PDFs.

---

### 3.5 Week 9-10: OCR & Advanced Features

**Goal:** Implement OCR, optimize performance

**Tasks:**

- [ ] Integrate Tesseract.js
- [ ] Implement Web Workers for OCR
- [ ] Add undo/redo system
- [ ] Optimize for large files

**Mini-Project:**
Create an OCR app that extracts text from scanned documents and makes it editable.

---

## 4. Knowledge Checkpoints

### Checkpoint 1: JavaScript Proficiency

**Can you confidently:**

- [ ] Explain the difference between `Promise` and `async/await`?
- [ ] Use `map`, `filter`, and `reduce` on arrays?
- [ ] Handle errors with `try/catch` in async functions?
- [ ] Import and use ES6 modules?

**Test:**

```javascript
// Question: Rewrite this with async/await
function loadPages(pdf, pageNumbers) {
  return Promise.all(pageNumbers.map((num) => pdf.getPage(num)));
}

// Your answer:
```

---

### Checkpoint 2: Canvas API

**Can you confidently:**

- [ ] Set up a canvas and get 2D context?
- [ ] Draw text at specific coordinates?
- [ ] Handle canvas click events?
- [ ] Clear and redraw canvas content?

**Test:**

```javascript
// Question: Draw "Hello" at (100, 100) in red, 20px Arial
// Your code:
```

---

### Checkpoint 3: React Components

**Can you confidently:**

- [ ] Create functional components with hooks?
- [ ] Manage state with `useState`?
- [ ] Use `useEffect` for side effects?
- [ ] Pass props between components?

**Test:**

```javascript
// Question: Create a component that shows current page number
// and has Prev/Next buttons
// Your code:
```

---

### Checkpoint 4: PDF Libraries

**Can you confidently:**

- [ ] Load a PDF with PDF.js?
- [ ] Render a PDF page to canvas?
- [ ] Modify a PDF with pdf-lib?
- [ ] Extract text positions?

**Test:**

```javascript
// Question: Load a PDF and render page 2 to canvas
// Your code:
```

---

## 5. Common Pitfalls & How to Avoid

### Pitfall 1: Async Errors

**Problem:** Not handling Promise rejections

```javascript
// Bad
async function loadPDF(file) {
  const pdf = await pdfjsLib.getDocument(file).promise;
  return pdf;
}

// Good
async function loadPDF(file) {
  try {
    const pdf = await pdfjsLib.getDocument(file).promise;
    return pdf;
  } catch (error) {
    console.error("Failed to load PDF:", error);
    throw new Error("Unable to load PDF file");
  }
}
```

### Pitfall 2: Memory Leaks with Canvas

**Problem:** Not cleaning up canvas contexts

```javascript
// Bad
function renderPage(page) {
  const canvas = document.createElement("canvas");
  // ... render
  // Canvas never cleaned up
}

// Good
function renderPage(page) {
  const canvas = document.getElementById("main-canvas");
  const context = canvas.getContext("2d");

  // Clear before redraw
  context.clearRect(0, 0, canvas.width, canvas.height);

  // ... render
}
```

### Pitfall 3: State Mutation

**Problem:** Directly modifying state

```javascript
// Bad
const [history, setHistory] = useState([]);
history.push(newEdit); // Mutating state directly!

// Good
const [history, setHistory] = useState([]);
setHistory([...history, newEdit]); // New array
```

---

## 6. Advanced Topics (Post-MVP)

Once MVP skills are mastered, consider learning:

### 6.1 TypeScript

**Why:** Type safety prevents bugs

```typescript
interface TextEdit {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontName: string;
}

async function applyEdit(pdf: PDFDocument, edit: TextEdit): Promise<void> {
  // TypeScript ensures edit has all required properties
}
```

### 6.2 WebAssembly

**Why:** Faster PDF processing

- Compile C/C++ PDF libraries to Wasm
- Achieve near-native performance

### 6.3 Accessibility (a11y)

**Why:** Make app usable for everyone

- ARIA labels for screen readers
- Keyboard navigation
- High contrast modes

---

## 7. Skill Assessment Rubric

### Beginner (0-3 months experience)

- Can read and modify existing code
- Understands basic JavaScript concepts
- Can follow tutorials to implement features
- Needs guidance on architecture decisions

**Suitable Tasks:**

- UI component styling
- Simple button handlers
- Form validation
- Documentation updates

### Intermediate (3-12 months experience)

- Can write features independently
- Understands async patterns
- Can debug common issues
- Familiar with React hooks

**Suitable Tasks:**

- Implement page navigation
- Add zoom controls
- Create toolbar components
- Write unit tests

### Advanced (12+ months experience)

- Can architect entire features
- Understands performance optimization
- Can integrate complex libraries
- Mentors junior developers

**Suitable Tasks:**

- PDF.js integration
- OCR implementation
- Undo/redo system
- Performance optimization

---

## 8. Recommended Learning Schedule

### Full-Time (40 hours/week)

- **Weeks 1-2:** JavaScript fundamentals (80 hours)
- **Weeks 3-4:** Canvas & React (80 hours)
- **Weeks 5-6:** PDF.js (80 hours)
- **Weeks 7-8:** pdf-lib & editing (80 hours)
- **Weeks 9-10:** OCR & optimization (80 hours)
- **Total:** 10 weeks to MVP contribution

### Part-Time (10 hours/week)

- **Months 1-2:** JavaScript fundamentals
- **Months 3-4:** Canvas & React
- **Months 5-6:** PDF.js
- **Months 7-8:** pdf-lib & editing
- **Months 9-10:** OCR & optimization
- **Total:** 10 months to MVP contribution

### Self-Paced (flexible)

Focus on building mini-projects for each skill area before moving to next.

---

## 9. Certification & Validation

While not required, these certifications demonstrate proficiency:

**Free Certifications:**

- freeCodeCamp: JavaScript Algorithms and Data Structures
- freeCodeCamp: Front End Development Libraries

**Paid Certifications:**

- Frontend Masters: JavaScript Path
- Frontend Masters: React Path

**Portfolio Projects:**
By project completion, you should have:

- [ ] A working PDF viewer
- [ ] A PDF editor with text editing
- [ ] An OCR document scanner
- [ ] Contributions to this PDF editor project

---

## 10. Getting Help

### Internal Resources

- CLAUDE.MD - Code examples and patterns
- PRD.MD - Feature requirements
- Technical documentation
- Team code reviews

### External Resources

- Stack Overflow (tag: pdf.js, react, canvas)
- GitHub Issues for PDF.js, pdf-lib, Tesseract.js
- Discord: Reactiflux community
- Reddit: r/javascript, r/reactjs

### Best Practices for Asking Questions

1. Search existing issues/Stack Overflow first
2. Provide minimal reproducible example
3. Include error messages and console logs
4. Describe what you've tried
5. Tag relevant technologies

---

**Skill Development Tips:**

- Learn by doing - build small projects for each skill
- Read other people's code (open source)
- Pair program with more experienced developers
- Review your code after 1 week - see what you'd improve
- Teach concepts to others - best way to solidify learning

**Remember:** Everyone starts as a beginner. Focus on consistent progress, not perfection.
