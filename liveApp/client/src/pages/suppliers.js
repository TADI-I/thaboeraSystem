    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication
      if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
      }
      
      // DOM elements
      const suppliersTable = document.getElementById('suppliersTable').querySelector('tbody');
      const supplierModal = document.getElementById('supplierModal');
      const supplierForm = document.getElementById('supplierForm');
      const addSupplierBtn = document.getElementById('addSupplierBtn');
      const supplierSearch = document.getElementById('supplierSearch');
      
      // Initialize Select2
      $('#suppliedProducts').select2({
        placeholder: "Select products supplied",
        allowClear: true
      });
      
      // Modal close button
      document.querySelector('.close').addEventListener('click', () => {
        supplierModal.style.display = 'none';
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === supplierModal) {
          supplierModal.style.display = 'none';
        }
      });
      
      // Add supplier button click
      addSupplierBtn.addEventListener('click', () => {
        document.getElementById('supplierModalTitle').innerHTML = '<i class="fas fa-truck"></i> Add New Supplier';
        supplierForm.reset();
        document.getElementById('supplierId').value = '';
        $('#suppliedProducts').val(null).trigger('change');
        supplierModal.style.display = 'block';
        loadProductsForSupplier();
      });
      
      // Supplier form submission
      supplierForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const supplierId = document.getElementById('supplierId').value;
        const supplierData = {
          name: document.getElementById('supplierName').value.trim(),
          contactPerson: document.getElementById('contactPerson').value.trim(),
          email: document.getElementById('supplierEmail').value.trim(),
          phone: document.getElementById('supplierPhone').value.trim(),
          address: document.getElementById('supplierAddress').value.trim(),
          notes: document.getElementById('supplierNotes').value.trim(),
          suppliedProducts: $('#suppliedProducts').val() || []
        };
        
        // Validate required fields
        if (!supplierData.name || !supplierData.contactPerson || !supplierData.email) {
          showAlert('Name, contact person and email are required', 'error');
          return;
        }
        
        if (!validateEmail(supplierData.email)) {
          showAlert('Please enter a valid email address', 'error');
          return;
        }
        
        const url = supplierId ? `/api/suppliers/${supplierId}` : '/api/suppliers';
        const method = supplierId ? 'PUT' : 'POST';
        
        simulateAPICall(url, supplierData, method)
          .then(response => {
            if (response.success) {
              loadSuppliers();
              supplierModal.style.display = 'none';
              showAlert(`Supplier ${supplierId ? 'updated' : 'added'} successfully!`, 'success');
            } else {
              showAlert(response.message || 'Operation failed', 'error');
            }
          });
      });
      
      // Search functionality
      supplierSearch.addEventListener('input', debounce(() => {
        loadSuppliers(supplierSearch.value);
      }, 300));
      
      // Load initial suppliers
      loadSuppliers();
      
      function loadSuppliers(searchTerm = '') {
        simulateAPICall(`/api/suppliers?search=${searchTerm}`)
          .then(response => {
            if (response.success) {
              renderSuppliers(response.data);
            }
          });
      }
      
      function loadProductsForSupplier() {
        simulateAPICall('/api/products')
          .then(response => {
            if (response.success) {
              const productSelect = $('#suppliedProducts');
              productSelect.empty();
              
              response.data.forEach(product => {
                const option = new Option(product.name, product.id, false, false);
                productSelect.append(option);
              });
            }
          });
      }
      
      function renderSuppliers(suppliers) {
        suppliersTable.innerHTML = '';
        
        if (suppliers.length === 0) {
          suppliersTable.innerHTML = `
            <tr>
              <td colspan="6" class="empty-state">
                <i class="fas fa-truck"></i>
                <p>No suppliers found</p>
              </td>
            </tr>
          `;
          return;
        }
        
        suppliers.forEach(supplier => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <strong>${supplier.name}</strong>
              ${supplier.notes ? `<div class="text-muted">${supplier.notes}</div>` : ''}
            </td>
            <td>${supplier.contactPerson}</td>
            <td><a href="mailto:${supplier.email}">${supplier.email}</a></td>
            <td>${supplier.phone || '-'}</td>
            <td>
              ${supplier.suppliedProducts && supplier.suppliedProducts.length > 0 ? 
                supplier.suppliedProducts.map(p => `<span class="product-tag">${p.name}</span>`).join('') : 
                '-'}
            </td>
            <td class="actions">
              <button class="btn-edit" data-id="${supplier.id}">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn-delete" data-id="${supplier.id}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
            </td>
          `;
          suppliersTable.appendChild(tr);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', () => editSupplier(btn.dataset.id));
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', () => deleteSupplier(btn.dataset.id));
        });
      }
      
      function editSupplier(supplierId) {
        simulateAPICall(`/api/suppliers/${supplierId}`)
          .then(response => {
            if (response.success) {
              const supplier = response.data;
              document.getElementById('supplierModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Supplier';
              document.getElementById('supplierId').value = supplier.id;
              document.getElementById('supplierName').value = supplier.name;
              document.getElementById('contactPerson').value = supplier.contactPerson;
              document.getElementById('supplierEmail').value = supplier.email;
              document.getElementById('supplierPhone').value = supplier.phone || '';
              document.getElementById('supplierAddress').value = supplier.address || '';
              document.getElementById('supplierNotes').value = supplier.notes || '';
              
              // Load products and select the ones this supplier provides
              loadProductsForSupplier().then(() => {
                if (supplier.suppliedProducts && supplier.suppliedProducts.length > 0) {
                  $('#suppliedProducts').val(supplier.suppliedProducts.map(p => p.id)).trigger('change');
                } else {
                  $('#suppliedProducts').val(null).trigger('change');
                }
              });
              
              supplierModal.style.display = 'block';
            }
          });
      }
      
      function deleteSupplier(supplierId) {
        if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
          simulateAPICall(`/api/suppliers/${supplierId}`, {}, 'DELETE')
            .then(response => {
              if (response.success) {
                loadSuppliers();
                showAlert('Supplier deleted successfully!', 'success');
              }
            });
        }
      }
      
      // Helper functions
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
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
      
      function simulateAPICall(url, data = {}, method = 'GET') {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (method === 'GET' && url === '/api/suppliers') {
              // Generate mock suppliers
              const mockSuppliers = [];
              const products = [
                { id: 1, name: 'Network Cable' },
                { id: 2, name: 'Router' },
                { id: 3, name: 'Switch' },
                { id: 4, name: 'Access Point' }
              ];
              
              for (let i = 1; i <= 10; i++) {
                const suppliedProducts = [];
                const productCount = Math.floor(Math.random() * 3) + 1;
                for (let j = 0; j < productCount; j++) {
                  suppliedProducts.push(products[Math.floor(Math.random() * products.length)]);
                }
                
                mockSuppliers.push({
                  id: i,
                  name: `Supplier ${i}`,
                  contactPerson: `Contact Person ${i}`,
                  email: `supplier${i}@example.com`,
                  phone: `+1 (555) 555-${1000 + i}`,
                  address: `${i} Main St, City ${i}`,
                  notes: i % 3 === 0 ? 'Preferred supplier' : '',
                  suppliedProducts: suppliedProducts
                });
              }
              
              // Apply search filter if provided
              const searchParams = new URLSearchParams(url.split('?')[1] || '');
              const searchTerm = searchParams.get('search') || '';
              
              if (searchTerm) {
                const filtered = mockSuppliers.filter(supplier => 
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
                );
                resolve({ success: true, data: filtered });
              } else {
                resolve({ success: true, data: mockSuppliers });
              }
            } else if (method === 'GET' && url.includes('/suppliers/')) {
              const id = parseInt(url.split('/').pop());
              resolve({
                success: true,
                data: {
                  id: id,
                  name: `Supplier ${id}`,
                  contactPerson: `Contact Person ${id}`,
                  email: `supplier${id}@example.com`,
                  phone: `+1 (555) 555-${1000 + id}`,
                  address: `${id} Main St, City ${id}`,
                  notes: id % 3 === 0 ? 'Preferred supplier' : '',
                  suppliedProducts: [
                    { id: 1, name: 'Network Cable' },
                    { id: 2, name: 'Router' }
                  ]
                }
              });
            } else if (method === 'GET' && url === '/api/products') {
              resolve({
                success: true,
                data: [
                  { id: 1, name: 'Network Cable' },
                  { id: 2, name: 'Router' },
                  { id: 3, name: 'Switch' },
                  { id: 4, name: 'Access Point' },
                  { id: 5, name: 'IP Camera' },
                  { id: 6, name: 'NAS Storage' }
                ]
              });
            } else if ((method === 'POST' || method === 'PUT') && url.includes('/suppliers')) {
              resolve({
                success: true,
                data: { id: Math.floor(Math.random() * 1000) + 100 }
              });
            } else if (method === 'DELETE' && url.includes('/suppliers/')) {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/').pop()) }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 800);
        });
      }
    });
