import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

/* jsPDF's optional doc.html() path carries `import.meta.url`. The app is
   served off the local filesystem inside a WKWebView and never calls
   doc.html(), so the reference is dead code — but it is the kind of dead code
   that turns into a white screen if a web view ever parses the bundle as a
   classic script. Replaced with a plain string at build time. */
const stripImportMeta = {
  name: 'strip-import-meta-url',
  renderChunk(code) {
    return code.includes('import.meta.url')
      ? { code: code.replaceAll('import.meta.url', '"./"'), map: null }
      : null
  },
}

export default defineConfig({
  plugins: [react(), stripImportMeta],
  base: './',
  resolve: {
    alias: {
      // jsPDF lazily pulls in html2canvas and dompurify to support doc.html().
      // MELD+ draws its PDF with the primitive text/rect API and never calls
      // doc.html(), so these are stubbed out rather than shipped as ~380 kB of
      // code the app can never reach.
      html2canvas: path.resolve(__dirname, 'src/empty-module.js'),
      dompurify: path.resolve(__dirname, 'src/empty-module.js'),
      canvg: path.resolve(__dirname, 'src/empty-module.js'),
    },
  },
  build: {
    outDir: 'dist',
    // One entry, one file. Keeps jsPDF's lazy doc.html() branches from
    // emitting separate chunks (and the import.meta.url preload helper that
    // comes with them) into a bundle that is loaded off the local filesystem
    // inside a WKWebView.
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
})
