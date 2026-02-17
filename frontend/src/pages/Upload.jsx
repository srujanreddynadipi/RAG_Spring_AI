import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Upload.css';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await documentAPI.list();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setMessage(null);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setMessage(null);

    try {
      await documentAPI.upload(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setMessage({ type: 'success', text: 'Document uploaded and processed successfully!' });
      setFile(null);
      setUploadProgress(0);
      loadDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload document' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUrlUpload = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await documentAPI.uploadUrl(url);
      setMessage({ type: 'success', text: 'URL content uploaded and processed successfully!' });
      setUrl('');
      loadDocuments();
    } catch (error) {
      console.error('Error uploading URL:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to upload URL content' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.delete(documentId);
      setMessage({ type: 'success', text: 'Document deleted successfully' });
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage({ type: 'error', text: 'Failed to delete document' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h2>Document Management</h2>
        <div className="header-actions">
          <button onClick={() => navigate('/chat')} className="btn btn-secondary">
            Back to Chat
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="upload-section">
        <div className="upload-tabs">
          <button
            className={`tab ${uploadType === 'file' ? 'active' : ''}`}
            onClick={() => setUploadType('file')}
          >
            Upload File
          </button>
          <button
            className={`tab ${uploadType === 'url' ? 'active' : ''}`}
            onClick={() => setUploadType('url')}
          >
            Upload from URL
          </button>
        </div>

        {uploadType === 'file' ? (
          <form onSubmit={handleFileUpload} className="upload-form">
            <div className="file-input-wrapper">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.txt,.md"
                disabled={loading}
                id="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                {file ? file.name : 'Choose a file (PDF, DOCX, TXT, MD)'}
              </label>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !file}
            >
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUrlUpload} className="upload-form">
            <div className="form-group">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL (https://example.com/page)"
                disabled={loading}
                className="url-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !url.trim()}
            >
              {loading ? 'Processing...' : 'Upload from URL'}
            </button>
          </form>
        )}
      </div>

      <div className="documents-section">
        <h3>Your Documents</h3>
        {documents.length === 0 ? (
          <p className="empty-message">No documents uploaded yet.</p>
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-info">
                  <h4>{doc.fileName}</h4>
                  <p className="document-meta">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                  </p>
                  <p className="document-meta">
                    Chunks: {doc.chunkCount || 0}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
