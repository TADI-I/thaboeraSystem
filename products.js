document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const productsTable = document.getElementById('productsTable').querySelector('tbody');
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const addProductBtn = document.getElementById('addProductBtn');
  const productSearch = document.getElementById('productSearch');
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Modal close button
  document.querySelector('.close').addEventListener('click', () => {
    productModal.style.display = 'none';
  });
  
  // Add product button click
  addProductBtn.addEventListener('click', () => {
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    productForm.reset();
    document.getElementById('productId').value = '';
    productModal.style.display = 'block';
  });
  
  // Product form submission
  productForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const formData = new FormData();
    
    formData.append('name', document.getElementById('productName').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('category', document.getElementById('productCategory').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    
    const imageFile = document.getElementById('productImage').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const url = productId ? `/api/products/${productId}` : '/api/products';
    const method = productId ? 'PUT' : 'POST';
    
    simulateAPICall(url, formData, method, true)
      .then(response => {
        if (response.success) {
          loadProducts();
          productModal.style.display = 'none';
          showAlert(`Product ${productId ? 'updated' : 'added'} successfully!`, 'success');
        } else {
          showAlert(response.message || 'Operation failed', 'error');
        }
      });
  });
  
  // Search functionality
  productSearch.addEventListener('input', debounce(() => {
    loadProducts(productSearch.value, categoryFilter.value);
  }, 300));
  
  // Category filter
  categoryFilter.addEventListener('change', () => {
    loadProducts(productSearch.value, categoryFilter.value);
  });
  
  // Load initial products and categories
  loadProducts();
  loadCategories();
  
  function loadProducts(searchTerm = '', category = '') {
    simulateAPICall(`/api/products?search=${searchTerm}&category=${category}`)
      .then(response => {
        if (response.success) {
          renderProducts(response.data);
        }
      });
  }
  
  function loadCategories() {
    simulateAPICall('/api/products/categories')
      .then(response => {
        if (response.success) {
          const categorySelect = document.getElementById('productCategory');
          const categoryFilterSelect = document.getElementById('categoryFilter');
          
          // Clear existing options except the first one
          while (categorySelect.options.length > 1) {
            categorySelect.remove(1);
          }
          while (categoryFilterSelect.options.length > 1) {
            categoryFilterSelect.remove(1);
          }
          
          // Add new options
          response.data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option.cloneNode(true));
            categoryFilterSelect.appendChild(option);
          });
        }
      });
  }
  
  function renderProducts(products) {
    productsTable.innerHTML = '';
    
    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="product-info">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-thumb">` : ''}
            <span>${product.name}</span>
          </div>
        </td>
        <td>${product.category}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td class="${product.stock < 10 ? 'low-stock' : ''}">${product.stock}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${product.id}">Edit</button>
          <button class="btn-delete" data-id="${product.id}">Delete</button>
        </td>
      `;
      productsTable.appendChild(tr);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }
  
  function editProduct(productId) {
    simulateAPICall(`/api/products/${productId}`)
      .then(response => {
        if (response.success) {
          const product = response.data;
          document.getElementById('productModalTitle').textContent = 'Edit Product';
          document.getElementById('productId').value = product.id;
          document.getElementById('productName').value = product.name;
          document.getElementById('productDescription').value = product.description;
          document.getElementById('productCategory').value = product.categoryId;
          document.getElementById('productPrice').value = product.price;
          document.getElementById('productStock').value = product.stock;
          productModal.style.display = 'block';
        }
      });
  }
  
  function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      simulateAPICall(`/api/products/${productId}`, {}, 'DELETE')
        .then(response => {
          if (response.success) {
            loadProducts();
            showAlert('Product deleted successfully!', 'success');
          }
        });
    }
  }
});
