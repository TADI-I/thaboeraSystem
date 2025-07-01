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
      const documentFile = document.getElementById('documentFile');
      const fileName = document.getElementById('fileName');
      
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
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
          uploadModal.style.display = 'none';
        }
      });
      
      // Show selected file name
      documentFile.addEventListener('change', () => {
        if (documentFile.files.length > 0) {
          fileName.textContent = documentFile.files[0].name;
        } else {
          fileName.textContent = '';
        }
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
              fileName.textContent = '';
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
              uploadCategorySelect.innerHTML = '<option value="">Select a category</option>';
              
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
        
        if (documents.length === 0) {
          const emptyRow = document.createElement('tr');
          emptyRow.innerHTML = `
            <td colspan="6" class="empty-state">
              <i class="fas fa-folder-open"></i>
              <p>No documents found</p>
            </td>
          `;
          documentsList.querySelector('tbody').appendChild(emptyRow);
          
          const emptyGrid = document.createElement('div');
          emptyGrid.className = 'empty-state';
          emptyGrid.style.width = '100%';
          emptyGrid.innerHTML = `
            <i class="fas fa-folder-open"></i>
            <p>No documents found</p>
          `;
          documentsGrid.appendChild(emptyGrid);
          return;
        }
        
        // List view
        documents.forEach(doc => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <a href="${doc.fileUrl}" target="_blank"><i class="${getFileIcon(doc.fileType)}"></i> ${doc.title}</a>
            </td>
            <td><span class="category-tag">${doc.category}</span></td>
            <td>${formatDate(doc.uploadedAt)}</td>
            <td>${formatFileSize(doc.size)}</td>
            <td>${doc.uploadedBy}</td>
            <td class="actions">
              <button class="btn-download" data-id="${doc.id}">
                <i class="fas fa-download"></i>
              </button>
              <button class="btn-delete" data-id="${doc.id}">
                <i class="fas fa-trash-alt"></i>
              </button>
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
              <p><span class="category-tag">${doc.category}</span></p>
              <p><i class="fas fa-calendar-alt"></i> ${formatDate(doc.uploadedAt)}</p>
              <p><i class="fas fa-file"></i> ${formatFileSize(doc.size)}</p>
              <p><i class="fas fa-user"></i> ${doc.uploadedBy}</p>
            </div>
            <div class="document-actions">
              <button class="btn-download" data-id="${doc.id}">
                <i class="fas fa-download"></i> Download
              </button>
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
        const iconMap = {
          'pdf': 'fas fa-file-pdf',
          'doc': 'fas fa-file-word',
          'docx': 'fas fa-file-word',
          'xls': 'fas fa-file-excel',
          'xlsx': 'fas fa-file-excel',
          'ppt': 'fas fa-file-powerpoint',
          'pptx': 'fas fa-file-powerpoint',
          'jpg': 'fas fa-file-image',
          'jpeg': 'fas fa-file-image',
          'png': 'fas fa-file-image',
          'gif': 'fas fa-file-image',
          'zip': 'fas fa-file-archive',
          'rar': 'fas fa-file-archive',
          'txt': 'fas fa-file-alt',
          'csv': 'fas fa-file-csv'
        };
        
        const extension = fileType.toLowerCase();
        return iconMap[extension] || 'fas fa-file';
      }
      
      function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      }
      
      function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      }
      
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      function debounce(func, wait) {
        let timeout;
        return function() {
          const context = this, args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            func.apply(context, args);
          }, wait);
        };
      }
      
      function simulateAPICall(url, data = {}, method = 'GET', isFormData = false) {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (method === 'GET' && url === '/api/documents/categories') {
              resolve({
                success: true,
                data: [
                  { id: 1, name: 'Contracts' },
                  { id: 2, name: 'Invoices' },
                  { id: 3, name: 'Reports' },
                  { id: 4, name: 'Presentations' },
                  { id: 5, name: 'Legal' }
                ]
              });
            } else if (method === 'GET' && url.startsWith('/api/documents')) {
              // Generate mock documents
              const categories = ['Contracts', 'Invoices', 'Reports', 'Presentations', 'Legal'];
              const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'jpg', 'png'];
              const users = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis'];
              
              const mockDocs = [];
              for (let i = 1; i <= 12; i++) {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 365));
                
                mockDocs.push({
                  id: i,
                  title: `Document ${i}`,
                  category: categories[Math.floor(Math.random() * categories.length)],
                  fileType: fileTypes[Math.floor(Math.random() * fileTypes.length)],
                  fileUrl: '#',
                  uploadedAt: date.toISOString(),
                  size: Math.floor(Math.random() * 5000000) + 100000,
                  uploadedBy: users[Math.floor(Math.random() * users.length)]
                });
              }
              
              // Apply filters if provided
              let filteredDocs = mockDocs;
              const searchParams = new URLSearchParams(url.split('?')[1] || '');
              const searchTerm = searchParams.get('search') || '';
              const category = searchParams.get('category') || '';
              
              if (searchTerm) {
                filteredDocs = filteredDocs.filter(doc => 
                  doc.title.toLowerCase().includes(searchTerm.toLowerCase())
              }
              
              if (category) {
                filteredDocs = filteredDocs.filter(doc => 
                  doc.category.toLowerCase() === category.toLowerCase()
                )
              }
              
              resolve({
                success: true,
                data: filteredDocs
              });
            } else if (method === 'POST' && url === '/api/documents') {
              resolve({
                success: true,
                data: { id: Math.floor(Math.random() * 1000) + 100 }
              });
            } else if (method === 'DELETE' && url.startsWith('/api/documents/')) {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/').pop()) }
              });
            } else if (url.includes('/download') && method === 'GET') {
              resolve({
                success: true,
                data: { downloadUrl: 'https://example.com/document.pdf' }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 500);
        });
      }
    });
