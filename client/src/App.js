import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import PDFOperationPage from './components/PDFOperationPage';
import Toast from './components/Toast';
import { getOperations } from './api';

function App() {
  const [operations, setOperations] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [backendOnline, setBackendOnline] = useState(true);

  const fetchOperations = useCallback(async () => {
    try {
      const ops = await getOperations();
      setOperations(ops);
      setBackendOnline(true);
    } catch (error) {
      setBackendOnline(false);
      console.error('Error:', error);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [fetchOperations]);

  const addToast = (message, type = 'info') => {
    const id = Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const currentOperation = (operationId) => {
    return operations.find(op => op.id === operationId);
  };

  return (
    <Router>
      <div className="App">
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

        <Routes>
          {/* Home Page */}
          <Route 
            path="/" 
            element={<HomePage operations={operations} backendOnline={backendOnline} />} 
          />
          
          {/* Individual Operation Pages */}
          {operations.map(op => (
            <Route 
              key={op.id}
              path={`/${op.id}`} 
              element={
                currentOperation(op.id) ? (
                  <PDFOperationPage operation={currentOperation(op.id)} />
                ) : (
                  <Navigate to="/" />
                )
              } 
            />
          ))}

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
