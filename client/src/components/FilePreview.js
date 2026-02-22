import React, { useEffect, useRef, useState } from 'react';

/**
 * Renders a thumbnail preview for a file.
 * - PDF: renders page 1 via PDF.js
 * - Image: shows the image directly
 * - Others: shows a colored file-type label
 */

let pdfjsLib = null;
let pdfjsLoadPromise = null;

function loadPdfJs() {
  if (pdfjsLib) return Promise.resolve(pdfjsLib);
  if (pdfjsLoadPromise) return pdfjsLoadPromise;

  pdfjsLoadPromise = import('pdfjs-dist/build/pdf').then((mod) => {
    const lib = mod.default || mod;
    lib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${lib.version}/pdf.worker.min.js`;
    pdfjsLib = lib;
    return lib;
  });

  return pdfjsLoadPromise;
}

const THUMB_W = 72;
const THUMB_H = 96;

const FilePreview = ({ file, accent }) => {
  const canvasRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | fallback

  useEffect(() => {
    let cancelled = false;

    // PDF files → render page 1
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const url = URL.createObjectURL(file);

      loadPdfJs()
        .then((lib) => lib.getDocument(url).promise)
        .then((doc) => doc.getPage(1))
        .then((page) => {
          if (cancelled) return;
          const vp = page.getViewport({ scale: 1 });
          const scale = Math.min(THUMB_W * 2 / vp.width, THUMB_H * 2 / vp.height);
          const viewport = page.getViewport({ scale });

          const canvas = canvasRef.current;
          if (!canvas) return;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          return page.render({ canvasContext: ctx, viewport }).promise.then(() => {
            if (!cancelled) setStatus('ready');
          });
        })
        .catch(() => {
          if (!cancelled) setStatus('fallback');
        })
        .finally(() => URL.revokeObjectURL(url));

      return () => { cancelled = true; };
    }

    // Image files → show directly
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImgSrc(url);
      setStatus('ready');
      return () => {
        cancelled = true;
        URL.revokeObjectURL(url);
      };
    }

    // Everything else → fallback
    setStatus('fallback');
    return () => { cancelled = true; };
  }, [file]);

  const ext = file.name.split('.').pop().toUpperCase();

  // Fallback: a colored label
  if (status === 'fallback') {
    return (
      <div
        className="file-preview-fallback"
        style={{ '--preview-accent': accent }}
      >
        <span className="file-preview-ext">{ext}</span>
      </div>
    );
  }

  // Image preview
  if (imgSrc) {
    return (
      <div className="file-preview-thumb">
        <img src={imgSrc} alt={file.name} />
      </div>
    );
  }

  // PDF canvas preview (may still be loading)
  return (
    <div className="file-preview-thumb">
      {status === 'loading' && <div className="file-preview-loading" style={{ '--preview-accent': accent }} />}
      <canvas
        ref={canvasRef}
        style={{ display: status === 'ready' ? 'block' : 'none' }}
      />
    </div>
  );
};

export default React.memo(FilePreview);
