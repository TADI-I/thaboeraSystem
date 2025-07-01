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
      const productImage = document.getElementById('productImage');
      const imagePreview = document.getElementById('imagePreview');
      const fileName = document.getElementById('fileName');
      
      // Modal close button
      document.querySelector('.close').addEventListener('click', () => {
        productModal.style.display = 'none';
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === productModal) {
          productModal.style.display = 'none';
        }
      });
      
      // Add product button click
      addProductBtn.addEventListener('click', () => {
        document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-box"></i> Add New Product';
        productForm.reset();
        document.getElementById('productId').value = '';
        imagePreview.style.display = 'none';
        fileName.textContent = '';
        productModal.style.display = 'block';
      });
      
      // Image preview
      productImage.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
          }
          reader.readAsDataURL(this.files[0]);
          fileName.textContent = this.files[0].name;
        }
      });
      
      // Product form submission
      productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productId = document.getElementById('productId').value;
        const formData = new FormData();
        
        formData.append('name', document.getElementById('productName').value);
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('category', document.getElementById('productCategory').value);
        formData.append('sku', document.getElementById('productSku').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('cost', document.getElementById('productCost').value);
        formData.append('reorderLevel', document.getElementById('reorderLevel').value);
        
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
              categorySelect.innerHTML = '<option value="">Select a category</option>';
              categoryFilterSelect.innerHTML = '<option value="">All Categories</option>';
              
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
        
        if (products.length === 0) {
          productsTable.innerHTML = `
            <tr>
              <td colspan="6" class="empty-state">
                <i class="fas fa-box-open"></i>
                <p>No products found</p>
              </td>
            </tr>
          `;
          return;
        }
        
        products.forEach(product => {
          const tr = document.createElement('tr');
          
          // Determine stock status
          let stockStatus = '';
          let stockClass = '';
          if (product.stock <= 0) {
            stockStatus = 'Out of Stock';
            stockClass = 'out-of-stock';
          } else if (product.stock < (product.reorderLevel || 5)) {
            stockStatus = 'Low Stock';
            stockClass = 'low-stock';
          } else {
            stockStatus = 'In Stock';
            stockClass = 'in-stock';
          }
          
          tr.innerHTML = `
            <td>
              <div class="product-info">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" class="product-thumb">` : '<div class="product-thumb"><i class="fas fa-box"></i></div>'}
                <div>
                  <strong>${product.name}</strong>
                  ${product.sku ? `<div class="text-muted">SKU: ${product.sku}</div>` : ''}
                </div>
              </div>
            </td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td class="${stockClass}">${stockStatus}</td>
            <td class="actions">
              <button class="btn-edit" data-id="${product.id}">
                <i class="fas fa-edit"></i> Edit
              </button>
              <button class="btn-delete" data-id="${product.id}">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
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
              document.getElementById('productModalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Product';
              document.getElementById('productId').value = product.id;
              document.getElementById('productName').value = product.name;
              document.getElementById('productDescription').value = product.description;
              document.getElementById('productCategory').value = product.categoryId;
              document.getElementById('productSku').value = product.sku || '';
              document.getElementById('productPrice').value = product.price;
              document.getElementById('productStock').value = product.stock;
              document.getElementById('productCost').value = product.cost || '';
              document.getElementById('reorderLevel').value = product.reorderLevel || 5;
              
              if (product.image) {
                imagePreview.src = product.image;
                imagePreview.style.display = 'block';
                fileName.textContent = 'Current image';
              } else {
                imagePreview.style.display = 'none';
                fileName.textContent = '';
              }
              
              productModal.style.display = 'block';
            }
          });
      }
      
      function deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
          simulateAPICall(`/api/products/${productId}`, {}, 'DELETE')
            .then(response => {
              if (response.success) {
                loadProducts();
                showAlert('Product deleted successfully!', 'success');
              }
            });
        }
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
            if (method === 'GET' && url === '/api/products/categories') {
              resolve({
                success: true,
                data: [
                  { id: 1, name: 'Electronics' },
                  { id: 2, name: 'Office Supplies' },
                  { id: 3, name: 'Networking' },
                  { id: 4, name: 'Software' },
                  { id: 5, name: 'Accessories' }
                ]
              });
            } else if (method === 'GET' && url.startsWith('/api/products')) {
              // Generate mock products
              const categories = ['Electronics', 'Office Supplies', 'Networking', 'Software', 'Accessories'];
              const mockProducts = [];
              
              for (let i = 1; i <= 15; i++) {
                mockProducts.push({
                  id: i,
                  name: `Product ${i}`,
                  description: `Description for product ${i}`,
                  category: categories[Math.floor(Math.random() * categories.length)],
                  categoryId: Math.floor(Math.random() * 5) + 1,
                  sku: `SKU-${1000 + i}`,
                  price: Math.random() * 100 + 10,
                  stock: Math.floor(Math.random() * 50),
                  cost: Math.random() * 80 + 5,
                  reorderLevel: 5,
                  image: Math.random() > 0.5 ? `https://picsum.photos/100/100?random=${i}` : null
                });
              }
              
              // Apply filters if provided
              let filteredProducts = mockProducts;
              const searchParams = new URLSearchParams(url.split('?')[1] || '');
              const searchTerm = searchParams.get('search') || '';
              const category = searchParams.get('category') || '';
              
              if (searchTerm) {
                filteredProducts = filteredProducts.filter(product => 
                  product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
              }
              
              if (category) {
                filteredProducts = filteredProducts.filter(product => 
                  product.categoryId.toString() === category)
              }
              
              resolve({
                success: true,
                data: filteredProducts
              });
            } else if ((method === 'POST' || method === 'PUT') && url.includes('/products')) {
              resolve({
                success: true,
                data: { id: Math.floor(Math.random() * 1000) + 100 }
              });
            } else if (method === 'DELETE' && url.includes('/products/')) {
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
