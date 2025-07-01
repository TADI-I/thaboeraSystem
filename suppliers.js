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
  
  // Modal close button
  document.querySelector('.close').addEventListener('click', () => {
    supplierModal.style.display = 'none';
  });
  
  // Add supplier button click
  addSupplierBtn.addEventListener('click', () => {
    document.getElementById('supplierModalTitle').textContent = 'Add New Supplier';
    supplierForm.reset();
    document.getElementById('supplierId').value = '';
    supplierModal.style.display = 'block';
    loadProductsForSupplier(); // Load products for the multi-select
  });
  
  // Supplier form submission
  supplierForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const supplierId = document.getElementById('supplierId').value;
    const supplierData = {
      name: document.getElementById('supplierName').value,
      contactPerson: document.getElementById('contactPerson').value,
      email: document.getElementById('supplierEmail').value,
      phone: document.getElementById('supplierPhone').value,
      address: document.getElementById('supplierAddress').value,
      suppliedProducts: Array.from(document.getElementById('suppliedProducts').selectedOptions).map(option => option.value)
    };
    
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
          const productSelect = document.getElementById('suppliedProducts');
          productSelect.innerHTML = '';
          
          response.data.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
          });
        }
      });
  }
  
  function renderSuppliers(suppliers) {
    suppliersTable.innerHTML = '';
    
    suppliers.forEach(supplier => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${supplier.name}</td>
        <td>${supplier.contactPerson}</td>
        <td>${supplier.email}</td>
        <td>${supplier.phone}</td>
        <td>${supplier.suppliedProducts.map(p => p.name).join(', ')}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${supplier.id}">Edit</button>
          <button class="btn-delete" data-id="${supplier.id}">Delete</button>
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
          document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
          document.getElementById('supplierId').value = supplier.id;
          document.getElementById('supplierName').value = supplier.name;
          document.getElementById('contactPerson').value = supplier.contactPerson;
          document.getElementById('supplierEmail').value = supplier.email;
          document.getElementById('supplierPhone').value = supplier.phone;
          document.getElementById('supplierAddress').value = supplier.address;
          
          // Load products and select the ones this supplier provides
          loadProductsForSupplier().then(() => {
            const productSelect = document.getElementById('suppliedProducts');
            supplier.suppliedProducts.forEach(productId => {
              const option = Array.from(productSelect.options).find(opt => opt.value === productId);
              if (option) option.selected = true;
            });
          });
          
          supplierModal.style.display = 'block';
        }
      });
  }
  
  function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      simulateAPICall(`/api/suppliers/${supplierId}`, {}, 'DELETE')
        .then(response => {
          if (response.success) {
            loadSuppliers();
            showAlert('Supplier deleted successfully!', 'success');
          }
        });
    }
  }
});
