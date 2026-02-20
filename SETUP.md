# Setup Guide

This guide will help you get the PDF Editor project up and running on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.x or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- A modern web browser (Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+)

### Verify Installation

Check your Node.js and npm versions:

```bash
node --version  # Should be v16.x or higher
npm --version   # Should be 7.x or higher
```

## Installation Steps

### 1. Clone or Download the Project

If you have Git installed:
```bash
git clone <repository-url>
cd PDFeditor
```

Or download and extract the ZIP file, then navigate to the project directory.

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- React 18
- PDF.js (for rendering PDFs)
- pdf-lib (for editing PDFs)
- Tesseract.js (for OCR)
- Zustand (for state management)
- Tailwind CSS (for styling)
- Vite (for development and building)

**Note:** The installation may take 2-5 minutes depending on your internet connection.

### 3. Start the Development Server

```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 4. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the PDF Editor interface with an "Upload PDF" button.

## Common Issues and Solutions

### Issue 1: Port 3000 Already in Use

**Error:** `Port 3000 is already in use`

**Solution:** Either:
- Stop the process using port 3000
- Or modify `vite.config.js` to use a different port:
  ```js
  server: {
    port: 3001,  // Change to any available port
    open: true
  }
  ```

### Issue 2: Module Not Found Errors

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Issue 3: PDF.js Worker Error

**Error:** `Setting up fake worker failed`

**Solution:** This is handled automatically by using the CDN worker in `src/lib/pdfLoader.js`. If you still see errors, clear your browser cache.

### Issue 4: Out of Memory Error

**Error:** `JavaScript heap out of memory`

**Solution:** Increase Node.js memory:
```bash
# Linux/Mac
export NODE_OPTIONS=--max-old-space-size=4096
npm run dev

# Windows (Command Prompt)
set NODE_OPTIONS=--max-old-space-size=4096
npm run dev
```

## Development Workflow

### File Watching

Vite automatically watches for file changes. When you save a file, the browser will automatically reload.

### Testing Your Changes

1. Upload a sample PDF
2. Try editing text
3. Test page navigation
4. Try different zoom levels
5. Test undo/redo functionality

### Building for Production

When you're ready to deploy:

```bash
# Create production build
npm run build
```

This creates an optimized build in the `dist/` folder.

To preview the production build locally:

```bash
npm run preview
```

## Project Configuration Files

### `.env` - Environment Variables

```env
VITE_TESSERACT_LANG_PATH=https://tessdata.projectnaptha.com/4.0.0
VITE_MAX_FILE_SIZE=10485760
VITE_WATERMARK_TEXT=Edited with PDF Editor
```

You can modify these values to customize:
- OCR language data path
- Maximum file size (in bytes)
- Watermark text

### `vite.config.js` - Build Configuration

Configures Vite settings:
- Port number
- Build output directory
- Optimizations

### `tailwind.config.js` - Styling Configuration

Configures Tailwind CSS:
- Content paths
- Theme colors
- Custom utilities

## Recommended Development Tools

### VS Code Extensions

If using Visual Studio Code, install these extensions:
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

### Browser DevTools

Use browser developer tools for debugging:
- Chrome DevTools (F12)
- Firefox Developer Tools (F12)
- React Developer Tools extension

## Next Steps

1. **Read the documentation:**
   - `CLAUDE.MD` - Implementation guidance
   - `PRD.md` - Product requirements
   - `SKILLS.md` - Required skills

2. **Explore the codebase:**
   - Start with `src/App.jsx`
   - Review components in `src/components/`
   - Check library wrappers in `src/lib/`

3. **Try the features:**
   - Upload a sample PDF
   - Edit some text
   - Insert an image
   - Download the edited PDF

4. **Make your first change:**
   - Try changing the primary color in `tailwind.config.js`
   - Modify button text in `src/components/Toolbar.jsx`
   - Add a new keyboard shortcut

## Getting Help

If you encounter issues:

1. Check the console for error messages (F12 → Console tab)
2. Review the troubleshooting section in this guide
3. Search for similar issues in the project documentation
4. Check if your Node.js version is compatible

## Performance Tips

For optimal performance:

1. **Use a modern browser** - Chrome/Edge typically perform best
2. **Limit file sizes** - Keep PDFs under 10MB for smooth editing
3. **Close other tabs** - PDF processing is memory-intensive
4. **Use production builds** - Much faster than development mode

## Security Considerations

- All processing happens client-side in your browser
- No files are uploaded to any server
- Use HTTPS when deploying to production
- Be cautious with PDFs from untrusted sources

## Deployment

When ready to deploy:

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

3. Ensure HTTPS is enabled for security

## Success Checklist

- [ ] Node.js 16+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Development server runs (`npm run dev`)
- [ ] Application opens in browser
- [ ] Can upload a PDF
- [ ] Can view and navigate pages
- [ ] Can edit text (click on text)
- [ ] Can zoom in/out
- [ ] Can download edited PDF
- [ ] No console errors

If all items are checked, you're ready to start developing!
