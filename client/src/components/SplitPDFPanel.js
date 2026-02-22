import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SplitPDFPanel.css';
import { convertFiles, downloadFile } from '../api';
import Toast from './Toast';

/* ===== PDF.js lazy loader ===== */
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

/* ===== First Page Preview (large) ===== */
const FirstPagePreview = React.memo(({ pdfDoc, totalPages, accent }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!pdfDoc) return;
    let cancelled = false;
    pdfDoc.getPage(1).then((page) => {
      if (cancelled) return;
      const vp = page.getViewport({ scale: 1 });
      const scale = Math.min(220 / vp.width, 300 / vp.height);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        if (!cancelled) setRendered(true);
      });
    });
    return () => { cancelled = true; };
  }, [pdfDoc]);

  if (!pdfDoc) {
    return (
      <div className="spl-preview-placeholder">
        <div className="spl-preview-spinner" />
        <span>Loading preview...</span>
      </div>
    );
  }

  return (
    <div className="spl-preview-canvas-wrap">
      <canvas ref={canvasRef} className={`spl-preview-canvas ${rendered ? 'visible' : ''}`} />
      {!rendered && <div className="spl-preview-placeholder"><div className="spl-preview-spinner" /></div>}
      <div className="spl-preview-badge" style={{ background: accent }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        {totalPages > 0 ? `${totalPages} pages` : ''}
      </div>
    </div>
  );
});

/* ===== Page Thumbnail ===== */
const PageThumb = React.memo(({ pdfDoc, pageNum, selected, onToggle }) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    pdfDoc.getPage(pageNum).then((page) => {
      if (cancelled) return;
      const vp = page.getViewport({ scale: 1 });
      const scale = Math.min(120 / vp.width, 160 / vp.height);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        if (!cancelled) setRendered(true);
      });
    });
    return () => { cancelled = true; };
  }, [pdfDoc, pageNum]);

  return (
    <div
      className={`spl-page-thumb ${selected ? 'selected' : ''} ${rendered ? '' : 'loading'}`}
      onClick={() => onToggle(pageNum)}
    >
      <canvas ref={canvasRef} />
      <div className="spl-page-num">{pageNum}</div>
      {selected && (
        <div className="spl-page-check">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="9" fill="#e11d48"/>
            <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
});

/* ===== Main Component ===== */
const SplitPDFPanel = ({ file, accent, onReset }) => {
  // Main tab: 'range' | 'pages'
  const [tab, setTab] = useState('range');
  // Range sub-mode: 'custom' | 'fixed'
  const [rangeMode, setRangeMode] = useState('custom');
  
  // Custom ranges state
  const [customRanges, setCustomRanges] = useState([{ from: '', to: '' }]);
  const [mergeRanges, setMergeRanges] = useState(false);
  
  // Fixed split state
  const [numParts, setNumParts] = useState('');
  
  // Pages mode state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState(new Set());
  
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Load PDF when file is provided
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    const url = URL.createObjectURL(file);

    loadPdfJs().then(lib => lib.getDocument(url).promise).then(doc => {
      if (!cancelled) {
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
      }
    }).catch(() => {
      if (!cancelled) addToast('Failed to load PDF preview', 'error');
    });

    return () => { cancelled = true; URL.revokeObjectURL(url); };
  }, [file, addToast]);

  // Custom ranges handlers
  const addRange = () => {
    setCustomRanges(prev => [...prev, { from: '', to: '' }]);
  };

  const updateRange = (idx, field, value) => {
    setCustomRanges(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const removeRange = (idx) => {
    if (customRanges.length <= 1) return;
    setCustomRanges(prev => prev.filter((_, i) => i !== idx));
  };

  // Pages mode handlers
  const togglePage = (pageNum) => {
    setSelectedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageNum)) next.delete(pageNum);
      else next.add(pageNum);
      return next;
    });
  };

  const selectAllPages = () => {
    const all = new Set();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const deselectAllPages = () => {
    setSelectedPages(new Set());
  };

  // Convert / Split
  const handleSplit = async () => {
    if (!file) return;

    let params = {};

    if (tab === 'range') {
      if (rangeMode === 'custom') {
        const validRanges = customRanges
          .filter(r => r.from && r.to)
          .map(r => ({ from: parseInt(r.from), to: parseInt(r.to) }));
        if (validRanges.length === 0) {
          addToast('Please fill in at least one range', 'warning');
          return;
        }
        for (const r of validRanges) {
          if (r.from > r.to || r.from < 1 || r.to > totalPages) {
            addToast(`Invalid range: ${r.from}-${r.to}. PDF has ${totalPages} pages.`, 'warning');
            return;
          }
        }
        params = { split_mode: 'custom_ranges', ranges: JSON.stringify(validRanges), merge_ranges: mergeRanges ? 'true' : 'false' };
      } else {
        const n = parseInt(numParts);
        if (!n || n < 1) {
          addToast('Please enter a valid number of parts', 'warning');
          return;
        }
        if (n > totalPages) {
          addToast(`Cannot split into ${n} parts â€” PDF only has ${totalPages} pages`, 'warning');
          return;
        }
        params = { split_mode: 'fixed', num_parts: n.toString() };
      }
    } else {
      // Pages mode
      if (selectedPages.size === 0) {
        addToast('Please select at least one page', 'warning');
        return;
      }
      params = { split_mode: 'extract_pages', selected_pages: JSON.stringify([...selectedPages].sort((a, b) => a - b)) };
    }

    try {
      setLoading(true);
      addToast('Splitting your PDF...', 'info');
      const result = await convertFiles([file], 'split_pdf', params);
      if (result.success && result.download_url) {
        addToast('Split completed! Downloading...', 'success');
        const blobPath = result.download_url.replace('/api/download/', '');
        setTimeout(() => downloadFile(blobPath), 500);
      } else {
        addToast(result.error || 'Split failed.', 'error');
      }
    } catch (error) {
      addToast(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pagesPerPart = numParts && totalPages ? Math.ceil(totalPages / parseInt(numParts || 1)) : 0;

  return (
    <div className="spl-panel">
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type}
            onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            duration={3000} />
        ))}
      </div>

      {/* Two-panel layout */}
      <div className="spl-layout">

        {/* LEFT â€” PDF Preview */}
        <div className="spl-preview-pane">
          <FirstPagePreview pdfDoc={pdfDoc} totalPages={totalPages} accent={accent} />
          <div className="spl-preview-info">
            <span className="spl-file-name">{file.name}</span>
            <button className="spl-file-change" onClick={onReset} type="button">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 4L4 12M4 4l8 8"/>
              </svg>
              Change
            </button>
          </div>
        </div>

        {/* RIGHT â€” Controls */}
        <div className="spl-controls-pane">

          {/* Tab switcher */}
          <div className="spl-tabs">
            <button
              className={`spl-tab ${tab === 'range' ? 'active' : ''}`}
              onClick={() => setTab('range')}
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="2" width="5" height="12" rx="1"/>
                <rect x="9" y="2" width="5" height="12" rx="1"/>
              </svg>
              By Range
            </button>
            <button
              className={`spl-tab ${tab === 'pages' ? 'active' : ''}`}
              onClick={() => setTab('pages')}
              type="button"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="1" width="6" height="6" rx="1"/>
                <rect x="9" y="1" width="6" height="6" rx="1"/>
                <rect x="1" y="9" width="6" height="6" rx="1"/>
                <rect x="9" y="9" width="6" height="6" rx="1"/>
              </svg>
              By Pages
            </button>
          </div>

          {/* RANGE TAB */}
          {tab === 'range' && (
            <div className="spl-range-section">
              <div className="spl-range-toggle">
                <button
                  className={`spl-range-mode ${rangeMode === 'custom' ? 'active' : ''}`}
                  onClick={() => setRangeMode('custom')}
                  type="button"
                >Custom</button>
                <button
                  className={`spl-range-mode ${rangeMode === 'fixed' ? 'active' : ''}`}
                  onClick={() => setRangeMode('fixed')}
                  type="button"
                >Fixed</button>
              </div>

              {rangeMode === 'custom' ? (
                <div className="spl-custom-ranges">
                  {customRanges.map((range, idx) => (
                    <div key={idx} className={`spl-range-row${customRanges.length === 1 ? ' single' : ''}`}>
                      <span className="spl-range-badge">#{idx + 1}</span>
                      <div className="spl-range-inputs">
                        <input
                          type="number"
                          min="1"
                          max={totalPages || 999}
                          placeholder="From"
                          value={range.from}
                          onChange={(e) => updateRange(idx, 'from', e.target.value)}
                          className="spl-range-input"
                        />
                        <span className="spl-range-arrow">
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 8h10M9 4l4 4-4 4"/>
                          </svg>
                        </span>
                        <input
                          type="number"
                          min="1"
                          max={totalPages || 999}
                          placeholder="To"
                          value={range.to}
                          onChange={(e) => updateRange(idx, 'to', e.target.value)}
                          className="spl-range-input"
                        />
                      </div>
                      {customRanges.length > 1 && (
                        <button className="spl-range-remove" onClick={() => removeRange(idx)} title="Remove" type="button">
                          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="spl-add-range" onClick={addRange} type="button">
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/>
                    </svg>
                    Add Range
                  </button>
                  {customRanges.length > 1 && (
                    <label className={`spl-merge-option ${mergeRanges ? 'active' : ''}`}>
                      <span className={`spl-checkbox ${mergeRanges ? 'checked' : ''}`} onClick={(e) => { e.preventDefault(); setMergeRanges(v => !v); }}>
                        {mergeRanges && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6l2.5 2.5 4.5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <div className="spl-merge-text">
                        <span className="spl-merge-title">Merge all into one PDF</span>
                        <span className="spl-merge-desc">{mergeRanges ? 'Combined into a single file' : 'Each range â†’ separate PDF in ZIP'}</span>
                      </div>
                    </label>
                  )}
                </div>
              ) : (
                <div className="spl-fixed-ranges">
                  <p className="spl-fixed-label">Split into equal parts:</p>
                  <div className="spl-fixed-input-row">
                    <input
                      type="number"
                      min="1"
                      max={totalPages || 999}
                      placeholder="e.g. 3"
                      value={numParts}
                      onChange={(e) => setNumParts(e.target.value)}
                      className="spl-fixed-input"
                    />
                    <span className="spl-fixed-unit">parts</span>
                  </div>
                  {numParts && totalPages > 0 && parseInt(numParts) > 0 && parseInt(numParts) <= totalPages && (
                    <div className="spl-fixed-preview">
                      <span className="spl-fixed-preview-icon">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <circle cx="8" cy="8" r="6"/>
                          <path d="M8 5v3l2 1.5"/>
                        </svg>
                      </span>
                      <span className="spl-fixed-preview-text">
                        <strong>{totalPages}</strong> Ã· <strong>{numParts}</strong> = ~<strong>{pagesPerPart}</strong> page{pagesPerPart !== 1 ? 's' : ''} each
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PAGES TAB */}
          {tab === 'pages' && (
            <div className="spl-pages-section">
              <div className="spl-pages-toolbar">
                <button className="spl-pages-select-btn" onClick={selectAllPages} type="button">All</button>
                <button className="spl-pages-select-btn" onClick={deselectAllPages} type="button">None</button>
                <span className="spl-pages-count">{selectedPages.size}/{totalPages}</span>
              </div>
              <div className="spl-pages-grid">
                {pdfDoc && Array.from({ length: totalPages }, (_, i) => (
                  <PageThumb
                    key={i + 1}
                    pdfDoc={pdfDoc}
                    pageNum={i + 1}
                    selected={selectedPages.has(i + 1)}
                    onToggle={togglePage}
                  />
                ))}
                {!pdfDoc && totalPages === 0 && (
                  <div className="spl-pages-loading">Loading pages...</div>
                )}
              </div>
            </div>
          )}

          {/* Split button */}
          <button
            className={`spl-split-btn ${loading ? 'loading' : ''}`}
            onClick={handleSplit}
            disabled={loading}
            type="button"
            style={{ '--accent': accent }}
          >
            {loading ? (
              <><span className="spl-spinner" />Splitting...</>
            ) : (
              <>
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="9" y1="2" x2="9" y2="16" strokeDasharray="3 2"/>
                  <path d="M4 5h4M4 9h4M4 13h2"/>
                  <path d="M10 5h4M10 9h4M10 13h2"/>
                </svg>
                Split PDF
              </>
            )}
          </button>

        </div>{/* end controls pane */}
      </div>{/* end layout */}
    </div>
  );
};

export default SplitPDFPanel;
