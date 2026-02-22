/**
 * API Client for PDF Toolkit Backend
 * Base URL should match your Flask backend (http://localhost:5000)
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Fetch list of available conversion operations
 */
export const getOperations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/operations`);
    if (!response.ok) throw new Error('Failed to fetch operations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching operations:', error);
    throw error;
  }
};

/**
 * Convert files using specified operation
 * @param {File|File[]} files - File(s) to convert
 * @param {string} operation - Operation ID (e.g., 'pdf_to_text')
 * @param {Object} params - Additional parameters for the operation (optional)
 */
export const convertFiles = async (files, operation, params = {}) => {
  try {
    const formData = new FormData();
    
    // Handle both single file and multiple files
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }
    
    formData.append('operation', operation);
    
    // Add operation parameters
    Object.keys(params).forEach(key => {
      const val = params[key];
      formData.append(key, (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val);
    });
    
    const response = await fetch(`${API_BASE_URL}/api/convert`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Conversion failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error converting files:', error);
    throw error;
  }
};

/**
 * Download a converted file
 * @param {string} filename - Name of file to download
 */
export const downloadFile = (blobPath) => {
  const url = `${API_BASE_URL}/api/download/${blobPath}`;
  const filename = blobPath.split('/').pop(); // Extract just filename for download name
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Get API health status
 */
export const getApiStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return await response.json();
  } catch (error) {
    console.error('API is not available:', error);
    return null;
  }
};
