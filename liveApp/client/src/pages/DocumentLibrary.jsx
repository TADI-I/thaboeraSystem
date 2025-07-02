// DocumentLibrary.jsx
import React, { useEffect, useState, useRef } from 'react';

const categoriesMock = [
  { id: 1, name: 'Contracts' },
  { id: 2, name: 'Invoices' },
  { id: 3, name: 'Reports' },
  { id: 4, name: 'Presentations' },
  { id: 5, name: 'Legal' }
];

const simulateAPICall = (url, data = {}, method = 'GET') => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (method === 'GET' && url === '/api/documents/categories') {
        resolve({ success: true, data: categoriesMock });
      } else if (method === 'GET' && url.startsWith('/api/documents')) {
        // simulate fetching documents
        const docs = Array.from({ length: 5 }, (_, i) => ({
          id: i,
          title: `Document ${i}`,
          category: categoriesMock[i % categoriesMock.length].name,
          fileType: 'pdf',
          fileUrl: '#',
          uploadedAt: new Date().toISOString(),
          size: 1000000,
          uploadedBy: 'John Doe'
        }));
        resolve({ success: true, data: docs });
      } else if (method === 'POST' && url === '/api/documents') {
        resolve({ success: true });
      } else if (method === 'DELETE') {
        resolve({ success: true });
      } else {
        resolve({ success: false });
      }
    }, 300);
  });
};

const DocumentLibrary = () => {
  const [auth, setAuth] = useState(true);
  const [view, setView] = useState('list');
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', description: '', file: null });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const fileInputRef = useRef();

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      setAuth(false);
      window.location.href = 'login.html';
      return;
    }
    loadDocuments();
    loadCategories();
  }, []);

  useEffect(() => {
    loadDocuments(search, filter);
  }, [search, filter]);

  const loadDocuments = (searchTerm = '', category = '') => {
    simulateAPICall(`/api/documents?search=${searchTerm}&category=${category}`)
      .then(res => {
        if (res.success) setDocuments(res.data);
      });
  };

  const loadCategories = () => {
    simulateAPICall('/api/documents/categories')
      .then(res => {
        if (res.success) setCategories(res.data);
      });
  };

  const handleUpload = e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    formData.append('description', form.description);
    formData.append('file', form.file);

    simulateAPICall('/api/documents', formData, 'POST').then(res => {
      if (res.success) {
        alert('Upload successful');
        setModalOpen(false);
        setForm({ title: '', category: '', description: '', file: null });
        loadDocuments();
      } else {
        alert('Upload failed');
      }
    });
  };

  const formatDate = date => new Date(date).toLocaleDateString();
  const formatSize = size => `${(size / 1024 / 1024).toFixed(2)} MB`;

  return auth ? (
    <div className="documents-container">
      <h1><i className="fas fa-folder-open"></i> Document Library</h1>
      <div className="document-actions">
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <i className="fas fa-upload"></i> Upload Document
        </button>
        <div className="document-filters">
          <select onChange={e => setFilter(e.target.value)} value={filter}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <input type="text" placeholder="Search..." onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="document-view-options">
        <button onClick={() => setView('list')} className={view === 'list' ? 'active' : ''}><i className="fas fa-list"></i> List</button>
        <button onClick={() => setView('grid')} className={view === 'grid' ? 'active' : ''}><i className="fas fa-th-large"></i> Grid</button>
      </div>

      {view === 'list' ? (
        <div id="documentsList">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Uploaded</th><th>Size</th><th>Uploaded By</th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? documents.map(doc => (
                <tr key={doc.id}>
                  <td><a href={doc.fileUrl}>{doc.title}</a></td>
                  <td>{doc.category}</td>
                  <td>{formatDate(doc.uploadedAt)}</td>
                  <td>{formatSize(doc.size)}</td>
                  <td>{doc.uploadedBy}</td>
                </tr>
              )) : (
                <tr><td colSpan="5">No documents found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div id="documentsGrid" className="grid-view">
          {documents.length > 0 ? documents.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="document-icon"><i className="fas fa-file"></i></div>
              <div className="document-info">
                <h3><a href={doc.fileUrl}>{doc.title}</a></h3>
                <p>{doc.category}</p>
                <p>{formatDate(doc.uploadedAt)}</p>
                <p>{formatSize(doc.size)}</p>
                <p>{doc.uploadedBy}</p>
              </div>
            </div>
          )) : <p>No documents found</p>}
        </div>
      )}

      {modalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
            <h2>Upload New Document</h2>
            <form onSubmit={handleUpload}>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" required />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description"></textarea>
              <div onClick={() => fileInputRef.current.click()} className="file-upload">Click to upload file</div>
              <input type="file" ref={fileInputRef} onChange={e => setForm({ ...form, file: e.target.files[0] })} hidden required />
              {form.file && <p>Selected file: {form.file.name}</p>}
              <button type="submit" className="btn-primary">Upload</button>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default DocumentLibrary;
