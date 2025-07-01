document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const documentsList = document.getElementById('documentsList');
  const documentsGrid = document.getElementById('documentsGrid');
  const listViewBtn = document.getElementById('listView');
  const gridViewBtn = document.getElementById('gridView');
  const uploadModal = document.getElementById('uploadModal');
  const uploadForm = document.getElementById('uploadForm');
  const uploadDocumentBtn = document.getElementById('uploadDocumentBtn');
  const categoryFilter = document.getElementById('categoryFilter');
  const documentSearch = document.getElementById('documentSearch');
  
  // View toggle buttons
  listViewBtn.addEventListener('click', () => {
    documentsList.style.display = 'block';
    documentsGrid.style.display = 'none';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
  });
  
  gridViewBtn.addEventListener('click', () => {
    documentsList.style.display = 'none';
    documentsGrid.style.display = 'flex';
    listViewBtn.classList.remove('active');
    gridViewBtn.classList.add('active');
  });
  
  // Upload modal
  uploadDocumentBtn.addEventListener('click', () => {
    uploadModal.style.display = 'block';
  });
  
  document.querySelector('.close').addEventListener('click', () => {
    uploadModal.style.display = 'none';
  });
  
  // Upload form submission
  uploadForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('documentTitle').value);
    formData.append('category', document.getElementById('documentCategory').value);
    formData.append('description', document.getElementById('documentDescription').value);
    formData.append('file', document.getElementById('documentFile').files[0]);
    
    simulateAPICall('/api/documents', formData, 'POST', true)
      .then(response => {
        if (response.success) {
          showAlert('Document uploaded successfully!', 'success');
          uploadForm.reset();
          uploadModal.style.display = 'none';
          loadDocuments();
        } else {
          showAlert(response.message || 'Upload failed', 'error');
        }
      });
  });
  
  // Search and filter
  documentSearch.addEventListener('input', debounce(() => {
    loadDocuments(documentSearch.value, categoryFilter.value);
  }, 300));
  
  categoryFilter.addEventListener('change', () => {
    loadDocuments(documentSearch.value, categoryFilter.value);
  });
  
  // Load initial documents and categories
  loadDocuments();
  loadCategories();
  
  function loadDocuments(searchTerm = '', category = '') {
    simulateAPICall(`/api/documents?search=${searchTerm}&category=${category}`)
      .then(response => {
        if (response.success) {
          renderDocuments(response.data);
        }
      });
  }
  
  function loadCategories() {
    simulateAPICall('/api/documents/categories')
      .then(response => {
        if (response.success) {
          categoryFilter.innerHTML = '<option value="">All Categories</option>';
          const uploadCategorySelect = document.getElementById('documentCategory');
          uploadCategorySelect.innerHTML = '';
          
          response.data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option.cloneNode(true));
            uploadCategorySelect.appendChild(option);
          });
        }
      });
  }
  
  function renderDocuments(documents) {
    // Clear existing documents
    documentsList.querySelector('tbody').innerHTML = '';
    documentsGrid.innerHTML = '';
    
    // List view
    documents.forEach(doc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <a href="${doc.fileUrl}" target="_blank">${doc.title}</a>
        </td>
        <td>${doc.category}</td>
        <td>${formatDate(doc.uploadedAt)}</td>
        <td>${formatFileSize(doc.size)}</td>
        <td>${doc.uploadedBy}</td>
        <td class="actions">
          <button class="btn-download" data-id="${doc.id}">Download</button>
          <button class="btn-delete" data-id="${doc.id}">Delete</button>
        </td>
      `;
      documentsList.querySelector('tbody').appendChild(tr);
    });
    
    // Grid view
    documents.forEach(doc => {
      const card = document.createElement('div');
      card.className = 'document-card';
      card.innerHTML = `
        <div class="document-icon">
          <i class="${getFileIcon(doc.fileType)}"></i>
        </div>
        <div class="document-info">
          <h3><a href="${doc.fileUrl}" target="_blank">${doc.title}</a></h3>
          <p>${doc.category}</p>
          <p>Uploaded: ${formatDate(doc.uploadedAt)}</p>
          <p>Size: ${formatFileSize(doc.size)}</p>
        </div>
        <div class="document-actions">
          <button class="btn-download" data-id="${doc.id}">Download</button>
        </div>
      `;
      documentsGrid.appendChild(card);
    });
    
    // Add event listeners to download buttons
    document.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', () => downloadDocument(btn.dataset.id));
    });
    
    // Add event listeners to delete buttons (list view only)
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteDocument(btn.dataset.id));
    });
  }
  
  function downloadDocument(documentId) {
    simulateAPICall(`/api/documents/${documentId}/download`)
      .then(response => {
        if (response.success) {
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  }
  
  function deleteDocument(documentId) {
    if (confirm('Are you sure you want to delete this document?')) {
      simulateAPICall(`/api/documents/${documentId}`, {}, 'DELETE')
        .then(response => {
          if (response.success) {
            showAlert('Document deleted successfully!', 'success');
            loadDocuments();
          }
        });
    }
  }
  
  function getFileIcon(fileType) {
    const fileTypes = {
      'pdf': 'icon-pdf',
      'doc': 'icon-word',
      'docx': 'icon-word',
      'xls': 'icon-excel',
      'xlsx': 'icon-excel',
      'ppt': 'icon-powerpoint',
      'pptx': 'icon-powerpoint',
      'jpg': 'icon-image',
      'jpeg': 'icon-image',
      'png': 'icon-image',
      'gif': 'icon-image',
      'zip': 'icon-archive',
      'rar': 'icon-archive'
    };
    
    const extension = fileType.toLowerCase();
    return fileTypes[extension] || 'icon-file';
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateStrin
