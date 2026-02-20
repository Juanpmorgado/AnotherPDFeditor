# PDF Editor

A pixel-perfect, client-side PDF editing web application that allows users to upload PDFs and edit text/images directly in the browser while preserving exact formatting, fonts, colors, and layout.

## Features

- **✨ Pixel-Perfect Text Editing** - Click on any text to edit it while preserving exact formatting, fonts, and positioning
- **🖼️ Image Insertion** - Insert images from your computer or URL
- **🔍 OCR Support** - Extract editable text from scanned PDFs using Tesseract.js
- **📄 Multi-page Support** - Navigate through multi-page documents seamlessly
- **🔎 Zoom Controls** - Zoom in/out (50%-300%) for precise editing
- **↩️ Undo/Redo** - Track and revert your changes (up to 10 actions)
- **🔒 100% Client-side** - No server uploads, your files stay private
- **🆓 Free to Use** - All core features available for free

## Quick Start

### Prerequisites

You need Node.js (version 16 or higher) and npm installed on your system.

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Upload PDF** - Click "Upload PDF" button to select a PDF file (max 10MB)
2. **Edit Text** - Click on any text element in the PDF to edit it inline
   - A text editor panel will appear with the selected text
   - Modify the text content and adjust font size
   - Click "Apply Changes" to update the PDF
3. **Insert Images** - Click "Insert Image" button
   - Upload from computer (JPEG, PNG, GIF, WebP)
   - Or provide an image URL
4. **Navigate Pages** - Use the page navigation controls at the bottom
   - Previous/Next buttons
   - Or enter a specific page number
5. **Zoom** - Use zoom controls in the toolbar
   - Zoom In/Out buttons
   - Current zoom level displayed as percentage
6. **Undo/Redo** - Use the undo/redo buttons to revert changes
7. **Download** - Click "Download" to save your edited PDF
   - Free tier downloads include a watermark

## Technology Stack

- **React 18** - UI framework
- **PDF.js** - PDF rendering
- **pdf-lib** - PDF editing and manipulation
- **Tesseract.js** - OCR for scanned documents
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## File Constraints

- Maximum file size: 10MB
- Supported formats: PDF
- Image formats: JPEG, PNG, GIF, WebP

## Project Structure

```
PDFeditor/
├── src/
│   ├── components/          # React components
│   │   ├── PDFViewer.jsx    # Main PDF canvas renderer
│   │   ├── Toolbar.jsx      # Top navigation bar with tools
│   │   ├── PageNavigation.jsx  # Page selector
│   │   ├── TextEditor.jsx   # Text editing panel
│   │   └── ImageInserter.jsx   # Image upload modal
│   ├── lib/                 # Library wrappers
│   │   ├── pdfLoader.js     # PDF.js loading and rendering
│   │   ├── pdfEditor.js     # pdf-lib editing operations
│   │   ├── ocrProcessor.js  # Tesseract.js OCR wrapper
│   │   └── canvasRenderer.js   # Canvas drawing utilities
│   ├── hooks/               # Custom React hooks
│   │   ├── usePDFState.js   # PDF state management
│   │   └── useHistory.js    # Undo/redo implementation
│   ├── utils/               # Utilities
│   │   ├── validators.js    # File validation
│   │   ├── watermark.js     # Watermark application
│   │   └── fontLibrary.js   # Font mapping and matching
│   ├── styles/              # Global styles
│   │   └── index.css        # Tailwind CSS imports
│   ├── App.jsx              # Main application component
│   └── main.jsx             # React entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── package.json             # Dependencies
├── CLAUDE.MD                # AI assistant instructions
├── PRD.md                   # Product requirements document
└── SKILLS.md                # Developer skill requirements
```

## Privacy & Security

All PDF processing happens entirely in your browser. Your files are never uploaded to any server, ensuring complete privacy and security.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.
