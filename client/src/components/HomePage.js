import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ operations, backendOnline }) => {

  const getIcon = (id) => {
    const icons = {
      pdf_to_word: '📄',
      pdf_to_text: '📝',
      pdf_to_images: '🖼️',
      word_to_pdf: '📑',
      text_to_pdf: '✍️',
      images_to_pdf: '📸',
      extract_images: '🎨',
      split_pdf: '✂️',
      merge_pdfs: '🔗',
      reverse_pdf: '↩️',
      compress_pdf: '🗜️',
      rotate_pdf: '🔄',
      add_watermark: '💧',
      remove_pages: '🗑️',
      pdf_to_powerpoint: '🎯',
      add_page_numbers: '🔢',
      repair_pdf: '🔧',
    };
    return icons[id] || '📋';
  };

  const OperationBox = ({ operation }) => (
    <Link
      to={`/${operation.id}`}
      className="op-box"
      title={operation.description}
    >
      <div className="op-box-icon">{getIcon(operation.id)}</div>
      <div className="op-box-name">{operation.name}</div>
    </Link>
  );


  return (
    <div className="home-page">

      {/* Backend Offline Banner */}
      {!backendOnline && (
        <div className="backend-offline-banner">
          <div className="backend-offline-icon">🔌</div>
          <div className="backend-offline-text">
            <strong>Server is not running</strong>
            <span>The backend service is currently offline. Wait Untill it Starts and refresh the page.</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Transform Your PDFs Instantly</h1>
          <p>Professional PDF tools with premium features. 100% free, no signup required. Get started in seconds!</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">14+</span>
              <span className="stat-label">Tools</span>
            </div>
            <div className="stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">No Limits</span>
            </div>
          </div>

          {/* All Operations Grid */}
          <div className="op-boxes-grid">
            {operations.map(op => (
              <OperationBox key={op.id} operation={op} />
            ))}
          </div>
        </div>
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="coming-soon">
        <p>🚀 Coming soon: Edit PDF, OCR, Security tools, and premium features!</p>
      </div>
    </div>
  );
};

export default HomePage;
