import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const ICONS = {
  pdf_to_word: '📄', pdf_to_text: '📝', pdf_to_images: '🖼️',
  word_to_pdf: '📑', text_to_pdf: '✍️', images_to_pdf: '📸',
  extract_images: '🎨', split_pdf: '✂️', merge_pdfs: '🔗',
  reverse_pdf: '↩️', compress_pdf: '🗜️', rotate_pdf: '🔄',
  add_watermark: '💧', remove_pages: '🗑️', pdf_to_powerpoint: '🎯',
  add_page_numbers: '🔢', repair_pdf: '🔧',
};

const CONVERSION_IDS = ['pdf_to_word','pdf_to_text','pdf_to_images','word_to_pdf','text_to_pdf','images_to_pdf'];

export default function Navbar({ operations = [] }) {
  const [openMenu, setOpenMenu] = useState(null); // 'convert' | 'all' | null
  const navRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const onPointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const toggle = (name) => setOpenMenu(prev => prev === name ? null : name);
  const close  = () => setOpenMenu(null);

  const conversionOps = operations.filter(op => CONVERSION_IDS.includes(op.id));
  const otherOps      = operations.filter(op =>
    !['merge_pdfs','split_pdf',...CONVERSION_IDS].includes(op.id)
  );

  const DropdownItem = ({ op }) => (
    <Link
      to={`/${op.id}`}
      className="nb-dd-item"
      onClick={close}
    >
      <span className="nb-dd-icon">{ICONS[op.id] || '📋'}</span>
      <span className="nb-dd-name">{op.name}</span>
    </Link>
  );

  return (
    <nav className="nb-bar" ref={navRef}>
      <div className="nb-container">
        {/* Logo */}
        <Link to="/" className="nb-logo" onClick={close}>PDFizz</Link>

        {/* Static links */}
        <Link to="/merge_pdfs" className="nb-link" onClick={close}>MERGE PDF</Link>
        <Link to="/split_pdf"  className="nb-link" onClick={close}>SPLIT PDF</Link>

        {/* Convert PDF dropdown */}
        <div className="nb-dd-wrap">
          <button
            className={`nb-link nb-dd-btn ${openMenu === 'convert' ? 'nb-active' : ''}`}
            onClick={() => toggle('convert')}
            type="button"
          >
            CONVERT PDF
            <svg className={`nb-chevron ${openMenu === 'convert' ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {openMenu === 'convert' && (
            <div className="nb-dd-menu">
              <div className="nb-dd-section">
                <div className="nb-dd-section-title">CONVERT TO PDF</div>
                {conversionOps.filter(op => ['word_to_pdf','text_to_pdf','images_to_pdf'].includes(op.id))
                  .map(op => <DropdownItem key={op.id} op={op} />)}
              </div>
              <div className="nb-dd-section">
                <div className="nb-dd-section-title">CONVERT FROM PDF</div>
                {conversionOps.filter(op => ['pdf_to_word','pdf_to_text','pdf_to_images'].includes(op.id))
                  .map(op => <DropdownItem key={op.id} op={op} />)}
              </div>
            </div>
          )}
        </div>

        {/* All PDF Tools dropdown */}
        <div className="nb-dd-wrap nb-dd-right">
          <button
            className={`nb-link nb-all-btn ${openMenu === 'all' ? 'nb-active' : ''}`}
            onClick={() => toggle('all')}
            type="button"
          >
            ALL PDF TOOLS
            <svg className={`nb-chevron ${openMenu === 'all' ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {openMenu === 'all' && (
            <div className="nb-dd-menu nb-dd-menu-large nb-dd-menu-right">
              {otherOps.map(op => <DropdownItem key={op.id} op={op} />)}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
