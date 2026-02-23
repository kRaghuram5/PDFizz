import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './PDFOperationPage.css';
import Toast from './Toast';
import FilePreview from './FilePreview';
import SplitPDFPanel from './SplitPDFPanel';
import { convertFiles, downloadFile } from '../api';

/* ===== ACCEPT TYPES ===== */
const ACCEPT_MAP = {
  PDF: { accept: '.pdf', mimePrefix: 'application/pdf', label: 'PDF' },
  DOCX: { accept: '.docx,.doc', mimePrefix: 'application/', label: 'Word document' },
  TXT: { accept: '.txt', mimePrefix: 'text/', label: 'text file' },
  Images: { accept: '.png,.jpg,.jpeg,.bmp,.gif,.tiff,.tif,.webp', mimePrefix: 'image/', label: 'image' },
};

/* ===== PER-OPERATION CONFIG ===== */
const OPERATION_CONFIG = {
  /* ---- Convert FROM PDF ---- */
  pdf_to_word: {
    title: 'PDF to WORD Converter',
    subtitle: 'Convert your PDF to WORD',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#4f46e5',
    accentLight: '#eef2ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#4f46e5" opacity="0.15" stroke="#4f46e5" strokeWidth="2"/>
        <path d="M14 16h12M14 22h12M14 28h8" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#2563eb" strokeWidth="2"/>
        <path d="M29 28h8M29 32h8M29 36h5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="30" y="26" fontSize="6" fill="#2563eb" fontWeight="bold">W</text>
      </svg>
    ),
  },
  pdf_to_text: {
    title: 'PDF to TEXT Converter',
    subtitle: 'Convert your PDF to TEXT',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#0891b2',
    accentLight: '#ecfeff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#0891b2" opacity="0.15" stroke="#0891b2" strokeWidth="2"/>
        <path d="M14 16h12M14 22h12M14 28h8" stroke="#0891b2" strokeWidth="2" strokeLinecap="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#0891b2" strokeWidth="2"/>
        <path d="M29 28h8M29 32h8M29 36h5" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="29" y="26" fontSize="6" fill="#0891b2" fontWeight="bold">Tx</text>
      </svg>
    ),
  },
  pdf_to_images: {
    title: 'PDF to IMAGE Converter',
    subtitle: 'Convert your PDF to IMAGE',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#9333ea',
    accentLight: '#faf5ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#9333ea" opacity="0.15" stroke="#9333ea" strokeWidth="2"/>
        <path d="M14 16h12M14 22h12M14 28h8" stroke="#9333ea" strokeWidth="2" strokeLinecap="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#9333ea" strokeWidth="2"/>
        <circle cx="30" cy="28" r="3" stroke="#9333ea" strokeWidth="1.5"/>
        <path d="M26 40l4-5 3 3 3-4 4 6" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  pdf_to_powerpoint: {
    title: 'PDF to PowerPoint Converter',
    subtitle: 'Convert your PDF to PowerPoint',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#ea580c',
    accentLight: '#fff7ed',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#ea580c" opacity="0.15" stroke="#ea580c" strokeWidth="2"/>
        <path d="M14 16h12M14 22h12M14 28h8" stroke="#ea580c" strokeWidth="2" strokeLinecap="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#ea580c" strokeWidth="2"/>
        <text x="28" y="36" fontSize="7" fill="#ea580c" fontWeight="bold">P</text>
      </svg>
    ),
  },

  /* ---- Convert TO PDF ---- */
  word_to_pdf: {
    title: 'WORD to PDF Converter',
    subtitle: 'Convert your Word document to PDF',
    selectLabel: 'Select Word file',
    dropLabel: 'or drop DOCX here',
    inputType: 'DOCX',
    accent: '#2563eb',
    accentLight: '#eff6ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#2563eb" opacity="0.15" stroke="#2563eb" strokeWidth="2"/>
        <text x="12" y="26" fontSize="8" fill="#2563eb" fontWeight="bold">W</text>
        <path d="M32 20l6 6-6 6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#dc2626" strokeWidth="2"/>
        <text x="28" y="36" fontSize="7" fill="#dc2626" fontWeight="bold">PDF</text>
      </svg>
    ),
  },
  text_to_pdf: {
    title: 'TEXT to PDF Converter',
    subtitle: 'Convert your text file to PDF',
    selectLabel: 'Select text file',
    dropLabel: 'or drop TXT file here',
    inputType: 'TXT',
    accent: '#059669',
    accentLight: '#ecfdf5',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#059669" opacity="0.15" stroke="#059669" strokeWidth="2"/>
        <text x="12" y="26" fontSize="7" fill="#059669" fontWeight="bold">Tx</text>
        <path d="M32 20l6 6-6 6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#dc2626" strokeWidth="2"/>
        <text x="28" y="36" fontSize="7" fill="#dc2626" fontWeight="bold">PDF</text>
      </svg>
    ),
  },
  images_to_pdf: {
    title: 'Images to PDF Converter',
    subtitle: 'Combine your images into a PDF',
    selectLabel: 'Select images',
    dropLabel: 'or drop images here',
    inputType: 'Images',
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#7c3aed" opacity="0.15" stroke="#7c3aed" strokeWidth="2"/>
        <circle cx="16" cy="16" r="4" stroke="#7c3aed" strokeWidth="1.5"/>
        <path d="M8 34l6-8 5 5 4-6 7 9" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M32 20l6 6-6 6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="24" y="20" width="18" height="24" rx="3" fill="white" stroke="#dc2626" strokeWidth="2"/>
        <text x="28" y="36" fontSize="7" fill="#dc2626" fontWeight="bold">PDF</text>
      </svg>
    ),
  },

  /* ---- PDF Tools ---- */
  extract_images: {
    title: 'Extract Images from PDF',
    subtitle: 'Extract all images from your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#d946ef',
    accentLight: '#fdf4ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="4" width="28" height="36" rx="3" fill="#d946ef" opacity="0.15" stroke="#d946ef" strokeWidth="2"/>
        <path d="M14 16h12M14 22h12M14 28h8" stroke="#d946ef" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="34" cy="28" r="8" fill="white" stroke="#d946ef" strokeWidth="2"/>
        <circle cx="32" cy="26" r="2" stroke="#d946ef" strokeWidth="1.5"/>
        <path d="M28 34l3-4 2 2 3-3 4 5" stroke="#d946ef" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  reverse_pdf: {
    title: 'Reverse PDF',
    subtitle: 'Reverse the pages of your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#dc2626',
    accentLight: '#fef2f2',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="24" height="32" rx="3" fill="#dc2626" opacity="0.15" stroke="#dc2626" strokeWidth="2"/>
        <path d="M16 18h8M16 24h8M16 30h4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 14v20M36 14l-5 5M36 14l5 5M36 34l-5-5M36 34l5-5" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  merge_pdfs: {
    title: 'Merge PDFs',
    subtitle: 'Combine multiple PDFs into one',
    selectLabel: 'Select PDF files',
    dropLabel: 'or drop PDFs here',
    inputType: 'PDF',
    accent: '#0d9488',
    accentLight: '#f0fdfa',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="6" width="18" height="24" rx="3" fill="#0d9488" opacity="0.15" stroke="#0d9488" strokeWidth="2"/>
        <rect x="26" y="6" width="18" height="24" rx="3" fill="#0d9488" opacity="0.15" stroke="#0d9488" strokeWidth="2"/>
        <rect x="14" y="28" width="20" height="16" rx="3" fill="white" stroke="#0d9488" strokeWidth="2"/>
        <path d="M20 36h8M24 32v8" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  split_pdf: {
    title: 'Split PDF',
    subtitle: 'Extract a range of pages from your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#e11d48',
    accentLight: '#fff1f2',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="8" width="16" height="28" rx="3" fill="#e11d48" opacity="0.15" stroke="#e11d48" strokeWidth="2"/>
        <rect x="28" y="8" width="16" height="28" rx="3" fill="#e11d48" opacity="0.15" stroke="#e11d48" strokeWidth="2"/>
        <path d="M24 10v28" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round"/>
        <path d="M8 18h8M8 24h8M8 28h4" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M32 18h8M32 24h8M32 28h4" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  compress_pdf: {
    title: 'Compress PDF',
    subtitle: 'Reduce your PDF file size',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#16a34a',
    accentLight: '#f0fdf4',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="4" width="28" height="36" rx="3" fill="#16a34a" opacity="0.15" stroke="#16a34a" strokeWidth="2"/>
        <path d="M24 10v8M24 26v8" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M18 18h12M18 26h12" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 14l4 4 4-4M20 30l4-4 4 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  rotate_pdf: {
    title: 'Rotate PDF',
    subtitle: 'Rotate all pages in your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#ca8a04',
    accentLight: '#fefce8',
    hasParams: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="8" width="24" height="32" rx="3" fill="#ca8a04" opacity="0.15" stroke="#ca8a04" strokeWidth="2"/>
        <path d="M18 20h8M18 26h8M18 32h4" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 12a14 14 0 0 1 0 24" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/>
        <path d="M36 12l-4 4M36 12l4 4" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  add_watermark: {
    title: 'Add Watermark',
    subtitle: 'Add text watermark to your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#6366f1',
    accentLight: '#eef2ff',
    hasParams: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="28" height="36" rx="3" fill="#6366f1" opacity="0.15" stroke="#6366f1" strokeWidth="2"/>
        <path d="M16 18h12M16 24h12M16 30h8" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        <text x="14" y="34" fontSize="14" fill="#6366f1" opacity="0.25" fontWeight="bold" transform="rotate(-30 24 24)">W</text>
      </svg>
    ),
  },
  remove_pages: {
    title: 'Remove Pages',
    subtitle: 'Remove specific pages from your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#b91c1c',
    accentLight: '#fef2f2',
    hasParams: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="24" height="32" rx="3" fill="#b91c1c" opacity="0.15" stroke="#b91c1c" strokeWidth="2"/>
        <path d="M16 18h8M16 24h8M16 30h4" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="36" cy="32" r="8" fill="white" stroke="#b91c1c" strokeWidth="2"/>
        <path d="M32 32h8" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  add_page_numbers: {
    title: 'Add Page Numbers',
    subtitle: 'Add page numbers to your PDF',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#4338ca',
    accentLight: '#eef2ff',
    hasParams: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="28" height="36" rx="3" fill="#4338ca" opacity="0.15" stroke="#4338ca" strokeWidth="2"/>
        <path d="M16 18h12M16 24h12M16 28h8" stroke="#4338ca" strokeWidth="2" strokeLinecap="round"/>
        <text x="18" y="40" fontSize="10" fill="#4338ca" fontWeight="bold">1 2 3</text>
      </svg>
    ),
  },
  repair_pdf: {
    title: 'Repair PDF',
    subtitle: 'Repair damaged or corrupt PDF files',
    selectLabel: 'Select PDF file',
    dropLabel: 'or drop PDF here',
    inputType: 'PDF',
    accent: '#0369a1',
    accentLight: '#f0f9ff',
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="6" width="24" height="32" rx="3" fill="#0369a1" opacity="0.15" stroke="#0369a1" strokeWidth="2"/>
        <path d="M16 18h8M16 24h8M16 30h4" stroke="#0369a1" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="36" cy="30" r="9" fill="white" stroke="#0369a1" strokeWidth="2"/>
        <path d="M33 27l3 3 5-5" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
};

const PDFOperationPage = ({ operation }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversionPhase, setConversionPhase] = useState(null); // null | 'converting' | 'done' | 'downloaded' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [toasts, setToasts] = useState([]);
  const [operationParams, setOperationParams] = useState({});
  const [reorderDragIdx, setReorderDragIdx] = useState(null);
  const [reorderOverIdx, setReorderOverIdx] = useState(null);
  const fileInputRef = useRef(null);
  const addMoreInputRef = useRef(null);

  const isMerge = operation.id === 'merge_pdfs';
  const isSplit = operation.id === 'split_pdf';
  const isSingleFile = isSplit || ['remove_pages', 'add_watermark', 'add_page_numbers'].includes(operation.id);

  const config = OPERATION_CONFIG[operation.id] || {
    title: operation.name,
    subtitle: operation.description,
    selectLabel: 'Select file',
    dropLabel: 'or drop file here',
    inputType: 'PDF',
    accent: '#4f46e5',
    accentLight: '#eef2ff',
    icon: null,
  };

  const acceptInfo = ACCEPT_MAP[config.inputType] || ACCEPT_MAP.PDF;

  const addToast = (message, type = 'info') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => {
      if (config.inputType === 'PDF') return f.type === 'application/pdf';
      if (config.inputType === 'Images') return f.type.startsWith('image/');
      if (config.inputType === 'DOCX') return f.name.match(/\.docx?$/i);
      if (config.inputType === 'TXT') return f.name.match(/\.txt$/i);
      return true;
    });
    if (droppedFiles.length === 0) {
      addToast(`Please drop ${acceptInfo.label} files only.`, 'warning');
      return;
    }
    if (isSplit) {
      setFiles([droppedFiles[0]]);
    } else {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddMoreClick = (e) => {
    e.stopPropagation();
    addMoreInputRef.current?.click();
  };

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      if (isSplit) {
        setFiles([selected[0]]);
      } else {
        setFiles(prev => [...prev, ...selected]);
      }
    }
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ===== Drag-to-reorder (merge_pdfs only) =====
  const handleReorderDragStart = (e, index) => {
    setReorderDragIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make the default drag image semi-transparent
    if (e.currentTarget) {
      e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
    }
  };

  const handleReorderDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== reorderOverIdx) {
      setReorderOverIdx(index);
    }
  };

  const handleReorderDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (reorderDragIdx === null || reorderDragIdx === dropIndex) {
      setReorderDragIdx(null);
      setReorderOverIdx(null);
      return;
    }
    setFiles(prev => {
      const updated = [...prev];
      const [moved] = updated.splice(reorderDragIdx, 1);
      updated.splice(dropIndex, 0, moved);
      return updated;
    });
    setReorderDragIdx(null);
    setReorderOverIdx(null);
  };

  const handleReorderDragEnd = () => {
    setReorderDragIdx(null);
    setReorderOverIdx(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleConvert = async () => {
    if (!files.length) {
      addToast('Please select at least one file.', 'warning');
      return;
    }
    try {
      setLoading(true);
      setConversionPhase('converting');
      const result = await convertFiles(files, operation.id, operationParams);
      if (result.success && result.download_url) {
        setConversionPhase('done');
        const blobPath = result.download_url.replace('/api/download/', '');
        setTimeout(() => {
          downloadFile(blobPath);
          setConversionPhase('downloaded');
        }, 1000);
        // Don't clear files here — keep them visible while the status panel is shown.
        // Files are cleared when the user clicks "Convert another file" (handleReset).
      } else {
        setConversionPhase('error');
        setErrorMsg(result.error || 'Conversion failed.');
      }
    } catch (error) {
      setConversionPhase('error');
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConversionPhase(null);
    setErrorMsg('');
    setFiles([]);
  };

  return (
    <div className="pdf-op-page" style={{ '--accent': config.accent, '--accent-light': config.accentLight }}>
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            duration={3000}
          />
        ))}
      </div>

      {/* Top Bar */}
      <nav className="pdf-op-navbar">
        <Link to="/" className="pdf-op-back" title="Back to Home">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 10H5M5 10l5-5M5 10l5 5"/>
          </svg>
        </Link>
        <Link to="/" className="pdf-op-logo">
          <span className="pdf-op-logo-text">PDFizz</span>
        </Link>
        <div className="pdf-op-navbar-spacer" />
      </nav>

      {/* Hero Area */}
      <div className="pdf-op-hero">
        <div className="pdf-op-hero-icon">{config.icon}</div>
        <h1 className="pdf-op-hero-title">{config.title}</h1>
        <p className="pdf-op-hero-subtitle">{config.subtitle}</p>
      </div>

      {/* Upload Card */}
      <div className={`pdf-op-card${isSplit && files.length > 0 ? ' pdf-op-card--split' : ''}`}>
        {files.length === 0 ? (
          <div
            className={`pdf-op-dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="pdf-op-dropzone-inner">
              <div className="pdf-op-upload-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <button
                className="pdf-op-select-btn"
                onClick={handleSelectClick}
                type="button"
              >
                {config.selectLabel}
              </button>
              <p className="pdf-op-drop-label">{config.dropLabel}</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptInfo.accept}
              multiple={!isSingleFile}
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>
        ) : operation.id === 'split_pdf' ? (
          <SplitPDFPanel
            file={files[0]}
            accent={config.accent}
            onReset={() => setFiles([])}
          />
        ) : (
          <div className="pdf-op-files-area">
            {!conversionPhase && (<>
            <div className="pdf-op-files-header">
              <h3 className="pdf-op-files-title">
                {files.length} file{files.length !== 1 ? 's' : ''} selected
              </h3>
              <button
                className="pdf-op-add-btn"
                onClick={handleAddMoreClick}
                title="Add more files"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="10" y1="4" x2="10" y2="16"/>
                  <line x1="4" y1="10" x2="16" y2="10"/>
                </svg>
              </button>
              <input
                ref={addMoreInputRef}
                type="file"
                accept={acceptInfo.accept}
                multiple
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
            </div>

            {isMerge && files.length > 1 && (
              <p className="pdf-op-reorder-hint">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M7 2v10M7 2L4.5 4.5M7 2l2.5 2.5M7 12L4.5 9.5M7 12l2.5-2.5"/>
                </svg>
                Drag to reorder before merging
              </p>
            )}

            <ul className="pdf-op-file-list">
              {files.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className={`pdf-op-file-item${
                    isMerge ? ' reorderable' : ''
                  }${
                    reorderDragIdx === index ? ' dragging' : ''
                  }${
                    reorderOverIdx === index && reorderDragIdx !== index ? ' drag-over' : ''
                  }`}
                  draggable={isMerge}
                  onDragStart={isMerge ? (e) => handleReorderDragStart(e, index) : undefined}
                  onDragOver={isMerge ? (e) => handleReorderDragOver(e, index) : undefined}
                  onDrop={isMerge ? (e) => handleReorderDrop(e, index) : undefined}
                  onDragEnd={isMerge ? handleReorderDragEnd : undefined}
                >
                  {isMerge && (
                    <div className="pdf-op-drag-handle" title="Drag to reorder">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="5" cy="3" r="1.2" fill="currentColor"/>
                        <circle cx="9" cy="3" r="1.2" fill="currentColor"/>
                        <circle cx="5" cy="7" r="1.2" fill="currentColor"/>
                        <circle cx="9" cy="7" r="1.2" fill="currentColor"/>
                        <circle cx="5" cy="11" r="1.2" fill="currentColor"/>
                        <circle cx="9" cy="11" r="1.2" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                  {isMerge && (
                    <span className="pdf-op-file-order">{index + 1}</span>
                  )}
                  <div className="pdf-op-file-preview">
                    <FilePreview file={file} accent={config.accent} />
                  </div>
                  <div className="pdf-op-file-info">
                    <span className="pdf-op-file-name">{file.name}</span>
                    <span className="pdf-op-file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    className="pdf-op-file-remove"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="4" y1="4" x2="12" y2="12"/>
                      <line x1="12" y1="4" x2="4" y2="12"/>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* Drop more zone */}
            <div
              className={`pdf-op-drop-more ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <span>+ Drop more files here</span>
            </div>

            {/* Inline Parameters */}
            {operation.id === 'rotate_pdf' && (() => {
              const rot = operationParams.rotation ?? '90';
              const isCustom = !['90', '180', '270'].includes(rot);
              const presets = [
                {
                  value: '90',
                  label: 'Right Rotate',
                  deg: '90°',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2v6h-6"/>
                      <path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>
                    </svg>
                  ),
                },
                {
                  value: '180',
                  label: 'Invert',
                  deg: '180°',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="17 1 21 5 17 9"/>
                      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                      <polyline points="7 23 3 19 7 15"/>
                      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                    </svg>
                  ),
                },
                {
                  value: '270',
                  label: 'Left Rotate',
                  deg: '270°',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 2v6h6"/>
                      <path d="M3 13a9 9 0 1 0 3-7.7L3 8"/>
                    </svg>
                  ),
                },
                {
                  value: 'custom',
                  label: 'Custom',
                  deg: '?°',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                    </svg>
                  ),
                },
              ];
              return (
                <div className="pdf-op-params">
                  <h4 className="pdf-op-params-title">Rotation</h4>
                  <div className="pdf-op-rotate-btns">
                    {presets.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`pdf-op-rotate-btn ${
                          opt.value === 'custom'
                            ? isCustom ? 'active' : ''
                            : rot === opt.value && !isCustom ? 'active' : ''
                        }`}
                        onClick={() =>
                          setOperationParams((p) => ({
                            ...p,
                            rotation: opt.value === 'custom' ? '' : opt.value,
                          }))
                        }
                      >
                        {opt.icon}
                        <span className="pdf-op-rotate-label">{opt.label}</span>
                        <span className="pdf-op-rotate-deg">{opt.deg}</span>
                      </button>
                    ))}
                  </div>
                  {isCustom && (
                    <div className="pdf-op-rotate-custom">
                      <label htmlFor="rotation-custom">Angle in degrees</label>
                      <input
                        id="rotation-custom"
                        type="number"
                        min="0"
                        max="359"
                        placeholder="e.g. 45"
                        value={rot}
                        onChange={(e) =>
                          setOperationParams((p) => ({ ...p, rotation: e.target.value }))
                        }
                        className="pdf-op-param-input"
                        autoFocus
                      />
                      <span className="pdf-op-param-hint">Any angle from 0° to 359°</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {operation.id === 'add_watermark' && (() => {
              const wmText  = operationParams.watermark    || '';
              const wmPos   = operationParams.wm_position  || 'center';
              const wmFont  = operationParams.wm_font      || 'helv';
              const wmColor = operationParams.wm_color     || '#888888';
              const wmSize  = operationParams.wm_size      || '36';
              const POS_GRID = [
                ['top-left','top-center','top-right'],
                ['center-left','center','center-right'],
                ['bottom-left','bottom-center','bottom-right'],
              ];
              const POS_LABELS = {
                'top-left':'Top Left','top-center':'Top Center','top-right':'Top Right',
                'center-left':'Mid Left','center':'Center','center-right':'Mid Right',
                'bottom-left':'Bot Left','bottom-center':'Bottom','bottom-right':'Bot Right',
              };
              const FONTS = [
                {v:'helv', label:'Helvetica'},
                {v:'tiro', label:'Times Roman'},
                {v:'cour', label:'Courier'},
              ];
              return (
                <div className="pdf-op-params">
                  <h4 className="pdf-op-params-title">Watermark Settings</h4>
                  <div className="pdf-op-param-group" style={{marginBottom:12}}>
                    <input
                      type="text" maxLength="100"
                      value={wmText}
                      onChange={e => setOperationParams(p => ({...p, watermark: e.target.value}))}
                      placeholder="Watermark text"
                      className="pdf-op-param-input"
                    />
                  </div>
                  <div className="pdf-op-wm-layout">
                    <div>
                      <span className="pdf-op-mini-label">Position</span>
                      <div className="pdf-op-wm-preview">
                        <div className="pdf-op-wm-page">
                          {POS_GRID.map(row => row.map(pos => (
                            <button key={pos} type="button" title={POS_LABELS[pos]}
                              className={`pdf-op-wm-dot ${wmPos === pos ? 'active' : ''}`}
                              onClick={() => setOperationParams(p => ({...p, wm_position: pos}))}
                            >
                              {wmPos === pos && <span className="pdf-op-wm-dot-text">{wmText || 'W'}</span>}
                            </button>
                          )))}
                        </div>
                      </div>
                      <span className="pdf-op-param-hint" style={{textAlign:'center',display:'block',marginTop:4}}>{POS_LABELS[wmPos]}</span>
                    </div>
                    <div className="pdf-op-wm-options">
                      <div className="pdf-op-param-group">
                        <span className="pdf-op-mini-label">Font</span>
                        <div className="pdf-op-wm-font-btns">
                          {FONTS.map(f => (
                            <button key={f.v} type="button"
                              className={`pdf-op-wm-font-btn ${wmFont === f.v ? 'active' : ''}`}
                              onClick={() => setOperationParams(p => ({...p, wm_font: f.v}))}
                            >{f.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="pdf-op-wm-row">
                        <div className="pdf-op-param-group">
                          <span className="pdf-op-mini-label">Color</span>
                          <div className="pdf-op-wm-color-wrap">
                            <input type="color" value={wmColor}
                              onChange={e => setOperationParams(p => ({...p, wm_color: e.target.value}))}
                              className="pdf-op-wm-color"
                            />
                            <span className="pdf-op-wm-color-hex">{wmColor}</span>
                          </div>
                        </div>
                        <div className="pdf-op-param-group">
                          <span className="pdf-op-mini-label">Size</span>
                          <input type="number" min="8" max="120" value={wmSize}
                            onChange={e => setOperationParams(p => ({...p, wm_size: e.target.value}))}
                            className="pdf-op-param-input pdf-op-wm-size"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {operation.id === 'remove_pages' && (() => {
              const rmTab   = operationParams.rm_tab    || 'range';
              const rmRanges = operationParams.rm_ranges || [{start:'', end:''}];
              const rmPages  = operationParams.pages     || '';
              const addRange    = () => setOperationParams(p => ({...p, rm_ranges:[...(p.rm_ranges||[{start:'',end:''}]), {start:'',end:''}]}));
              const removeRange = i  => setOperationParams(p => ({...p, rm_ranges:(p.rm_ranges||[]).filter((_,idx)=>idx!==i)}));
              const updateRange = (i, field, val) => setOperationParams(p => ({
                ...p, rm_ranges:(p.rm_ranges||[{start:'',end:''}]).map((r,idx)=>idx===i?{...r,[field]:val}:r)
              }));
              return (
                <div className="pdf-op-params">
                  <h4 className="pdf-op-params-title">Pages to Remove</h4>
                  <div className="pdf-op-mini-tabs">
                    <button type="button" className={rmTab==='range'?'active':''}
                      onClick={()=>setOperationParams(p=>({...p,rm_tab:'range'}))}>By Range</button>
                    <button type="button" className={rmTab==='pages'?'active':''}
                      onClick={()=>setOperationParams(p=>({...p,rm_tab:'pages'}))}>By Pages</button>
                  </div>
                  {rmTab === 'range' ? (
                    <div className="pdf-op-rm-ranges">
                      {rmRanges.map((r, i) => (
                        <div key={i} className="pdf-op-rm-row">
                          <input type="number" min="1" placeholder="From"
                            value={r.start} onChange={e => updateRange(i,'start',e.target.value)}
                            className="pdf-op-param-input pdf-op-rm-input"
                          />
                          <span className="pdf-op-rm-dash">–</span>
                          <input type="number" min="1" placeholder="To"
                            value={r.end} onChange={e => updateRange(i,'end',e.target.value)}
                            className="pdf-op-param-input pdf-op-rm-input"
                          />
                          {rmRanges.length > 1 && (
                            <button type="button" className="pdf-op-rm-del" onClick={()=>removeRange(i)}>
                              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="pdf-op-rm-add" onClick={addRange}>+ Add Range</button>
                      <span className="pdf-op-param-hint">Pages in these ranges will be deleted</span>
                    </div>
                  ) : (
                    <div className="pdf-op-param-group" style={{marginTop:8}}>
                      <input type="text" value={rmPages}
                        onChange={e => setOperationParams(p => ({...p, pages: e.target.value}))}
                        placeholder="e.g. 1, 3, 5"
                        className="pdf-op-param-input"
                      />
                      <span className="pdf-op-param-hint">Comma-separated page numbers</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {operation.id === 'add_page_numbers' && (() => {
              const pnPos  = operationParams.pn_position || 'footer-center';
              const pnSize = operationParams.pn_size     || '10';
              const POSITIONS = [
                {v:'header-left',label:'Left'},{v:'header-center',label:'Center'},{v:'header-right',label:'Right'},
                {v:'footer-left',label:'Left'},{v:'footer-center',label:'Center'},{v:'footer-right',label:'Right'},
              ];
              const isHeader = pnPos.startsWith('header');
              const align    = pnPos.split('-')[1];
              return (
                <div className="pdf-op-params">
                  <h4 className="pdf-op-params-title">Page Number Settings</h4>
                  <div className="pdf-op-pn-layout">
                    <div className="pdf-op-pn-section">
                      <span className="pdf-op-mini-label">Header</span>
                      <div className="pdf-op-pn-row">
                        {POSITIONS.slice(0,3).map(p => (
                          <button key={p.v} type="button"
                            className={`pdf-op-pn-btn ${pnPos===p.v?'active':''}`}
                            onClick={()=>setOperationParams(pr=>({...pr,pn_position:p.v}))}
                          >{p.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className="pdf-op-pn-preview">
                      <div className="pdf-op-pn-page">
                        <div className={`pdf-op-pn-mark pdf-op-pn-mark--${isHeader?'header':'footer'} pdf-op-pn-mark--${align}`}>
                          <span>1</span>
                        </div>
                        <div className="pdf-op-pn-lines">
                          <div/><div/><div/><div/>
                        </div>
                      </div>
                    </div>
                    <div className="pdf-op-pn-section">
                      <span className="pdf-op-mini-label">Footer</span>
                      <div className="pdf-op-pn-row">
                        {POSITIONS.slice(3).map(p => (
                          <button key={p.v} type="button"
                            className={`pdf-op-pn-btn ${pnPos===p.v?'active':''}`}
                            onClick={()=>setOperationParams(pr=>({...pr,pn_position:p.v}))}
                          >{p.label}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pdf-op-pn-size-row">
                    <span className="pdf-op-mini-label">Font Size</span>
                    <input type="number" min="6" max="24" value={pnSize}
                      onChange={e=>setOperationParams(p=>({...p,pn_size:e.target.value}))}
                      className="pdf-op-param-input pdf-op-pn-size-input"
                    />
                    <span className="pdf-op-param-hint" style={{marginLeft:4}}>pt</span>
                  </div>
                </div>
              );
            })()}

            </>)}

            {/* Conversion Status / Convert Button */}
            {conversionPhase ? (
              <div className="pdf-op-status-panel">
                {conversionPhase === 'converting' && (
                  <div className="pdf-op-status pdf-op-status--converting">
                    <div className="pdf-op-status-icon-wrap">
                      <div className="pdf-op-pulse-ring" />
                      <div className="pdf-op-spinner-lg" />
                    </div>
                    <div className="pdf-op-status-body">
                      <div className="pdf-op-status-title-row">
                        <span className="pdf-op-status-title">Converting your file</span>
                        <span className="pdf-op-status-dots"><span>.</span><span>.</span><span>.</span></span>
                      </div>
                      <span className="pdf-op-status-sub">Please wait, this may take a moment</span>
                      <div className="pdf-op-progress-bar"><div className="pdf-op-progress-fill" /></div>
                    </div>
                  </div>
                )}
                {conversionPhase === 'done' && (
                  <div className="pdf-op-status pdf-op-status--done">
                    <div className="pdf-op-status-icon-wrap pdf-op-check-wrap">
                      <svg className="pdf-op-check-svg" viewBox="0 0 52 52">
                        <circle className="pdf-op-check-circle" cx="26" cy="26" r="24" />
                        <path className="pdf-op-check-tick" d="M14 27l8 8 16-16" />
                      </svg>
                    </div>
                    <div className="pdf-op-status-body">
                      <span className="pdf-op-status-title">Conversion complete!</span>
                      <span className="pdf-op-status-sub">Preparing your download...</span>
                    </div>
                  </div>
                )}
                {conversionPhase === 'downloaded' && (
                  <div className="pdf-op-status pdf-op-status--downloaded">
                    <div className="pdf-op-status-icon-wrap pdf-op-dl-wrap">
                      <svg viewBox="0 0 52 52" fill="none">
                        <circle cx="26" cy="26" r="24" fill="none" stroke="var(--accent)" strokeWidth="2.5"/>
                        <path d="M26 16v16M18 26l8 8 8-8" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 36h16" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="pdf-op-status-body">
                      <span className="pdf-op-status-title">Download started!</span>
                      <span className="pdf-op-status-sub">Your file is ready.</span>
                      <div className="pdf-op-explore-section">
                        <p className="pdf-op-explore-prompt">Want to do more with PDFizz?</p>
                        <div className="pdf-op-explore-btns">
                          <button type="button" className="pdf-op-explore-btn pdf-op-explore-btn--primary" onClick={handleReset}>
                            Convert another file
                          </button>
                          <Link to="/" className="pdf-op-explore-btn pdf-op-explore-btn--ghost">
                            Explore more tools →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {conversionPhase === 'error' && (
                  <div className="pdf-op-status pdf-op-status--error">
                    <div className="pdf-op-status-icon-wrap pdf-op-err-wrap">
                      <svg viewBox="0 0 52 52" fill="none">
                        <circle cx="26" cy="26" r="24" fill="none" stroke="#ef4444" strokeWidth="2.5"/>
                        <path d="M20 20l12 12M32 20L20 32" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="pdf-op-status-body">
                      <span className="pdf-op-status-title">Something went wrong</span>
                      <span className="pdf-op-status-sub">{errorMsg}</span>
                      <button type="button" className="pdf-op-explore-btn pdf-op-explore-btn--primary" onClick={handleReset} style={{marginTop:14}}>
                        Try again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="pdf-op-convert-btn"
                onClick={handleConvert}
                disabled={files.length === 0}
                type="button"
              >
                Convert {files.length > 1 ? `${files.length} files` : 'file'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="pdf-op-footer-info">
        <div className="pdf-op-footer-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="6"/>
            <path d="M8 5v3l2 2"/>
          </svg>
          <span>Fast conversion</span>
        </div>
        <div className="pdf-op-footer-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
            <rect x="3" y="3" width="10" height="10" rx="2"/>
            <path d="M6 8h4M8 6v4"/>
          </svg>
          <span>Multiple files</span>
        </div>
        <div className="pdf-op-footer-item">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"/>
          </svg>
          <span>100% Free</span>
        </div>
      </div>
    </div>
  );
};

export default PDFOperationPage;
