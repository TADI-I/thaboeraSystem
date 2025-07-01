    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication
      if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
      }
      
      // DOM elements
      const quotationForm = document.getElementById('quotationForm');
      const clientSelect = document.getElementById('clientSelect');
      const itemsTable = document.getElementById('itemsTable').querySelector('tbody');
      const addItemBtn = document.getElementById('addItemBtn');
      const previewQuotation = document.getElementById('previewQuotation');
      const sendQuotation = document.getElementById('sendQuotation');
      
      // Load clients and products
      loadClients();
      loadProducts();
      
      // Add item button
      addItemBtn.addEventListener('click', addItemRow);
      
      // Initialize with one item row
      addItemRow();
      
      // Form submission
      quotationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveQuotation();
      });
      
      // Preview button
      previewQuotation.addEventListener('click', function() {
        saveQuotation(true);
      });
      
      // Send button
      sendQuotation.addEventListener('click', function() {
        if (confirm('Send this quotation to the client?')) {
          saveQuotation(false, true);
        }
      });
      
      // Add new item row
      function addItemRow(itemData = null) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <select class="item-select">
              <!-- Products will be populated by JS -->
            </select>
          </td>
          <td><input type="text" class="item-description" value="${itemData?.description || ''}"></td>
          <td><input type="number" class="item-quantity" min="1" value="${itemData?.quantity || 1}"></td>
          <td><input type="number" class="item-price" step="0.01" value="${itemData?.price || ''}"></td>
          <td class="item-total">${itemData ? (itemData.quantity * itemData.price).toFixed(2) : '0.00'}</td>
          <td><button type="button" class="btn-remove-item"><i class="fas fa-trash-alt"></i></button></td>
        `;
        
        itemsTable.appendChild(row);
        
        // Set product if provided
        if (itemData?.id) {
          setTimeout(() => {
            const select = row.querySelector('.item-select');
            select.value = itemData.id;
          }, 0);
        }
        
        // Add event listeners
        row.querySelector('.item-quantity').addEventListener('input', updateItemTotal);
        row.querySelector('.item-price').addEventListener('input', updateItemTotal);
        row.querySelector('.btn-remove-item').addEventListener('click', function() {
          row.remove();
          updateTotals();
        });
        
        // Update totals
        updateTotals();
        
        return row;
      }
      
      // Update item total
      function updateItemTotal(e) {
        const row = e.target.closest('tr');
        const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(row.querySelector('.item-price').value) || 0;
        const total = (quantity * price).toFixed(2);
        row.querySelector('.item-total').textContent = total;
        updateTotals();
      }
      
      // Update all totals
      function updateTotals() {
        let subtotal = 0;
        
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
          const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
          subtotal += total;
        });
        
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        
        const taxAmount = (subtotal * taxRate / 100).toFixed(2);
        const discountAmount = discount.toFixed(2);
        const grandTotal = (subtotal + parseFloat(taxAmount) - discount).toFixed(2);
        
        document.getElementById('subtotal').textContent = subtotal.toFixed(2);
        document.getElementById('taxAmount').textContent = taxAmount;
        document.getElementById('discountAmount').textContent = discountAmount;
        document.getElementById('grandTotal').textContent = grandTotal;
      }
      
      // Load clients
      function loadClients() {
        simulateAPICall('/api/clients')
          .then(response => {
            if (response.success) {
              clientSelect.innerHTML = '<option value="">Select a client</option>';
              response.data.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = client.name;
                clientSelect.appendChild(option);
              });
              
              // If editing, select the client
              const urlParams = new URLSearchParams(window.location.search);
              const quotationId = urlParams.get('id');
              if (quotationId) {
                // This would be handled in loadQuotationData
              }
            }
          });
      }
      
      // Load products
      function loadProducts() {
        simulateAPICall('/api/products')
          .then(response => {
            if (response.success) {
              const selects = document.querySelectorAll('.item-select');
              selects.forEach(select => {
                select.innerHTML = '<option value="">Select an item</option>';
                response.data.forEach(product => {
                  const option = document.createElement('option');
                  option.value = product.id;
                  option.textContent = product.name;
                  option.dataset.price = product.price;
                  select.appendChild(option);
                });
                
                // Add event listener to update price when product is selected
                select.addEventListener('change', function() {
                  const selectedOption = this.options[this.selectedIndex];
                  if (selectedOption.dataset.price) {
                    const row = this.closest('tr');
                    row.querySelector('.item-price').value = selectedOption.dataset.price;
                    updateItemTotal({ target: row.querySelector('.item-price') });
                  }
                });
              });
            }
          });
      }
      
      function saveQuotation(preview = false, send = false) {
        const clientId = clientSelect.value;
        if (!clientId) {
          showAlert('Please select a client', 'error');
          return;
        }
        
        const items = [];
        document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
          const select = row.querySelector('.item-select');
          const productId = select.value;
          if (productId) {
            items.push({
              productId,
              description: row.querySelector('.item-description').value,
              quantity: parseFloat(row.querySelector('.item-quantity').value),
              price: parseFloat(row.querySelector('.item-price').value)
            });
          }
        });
        
        if (items.length === 0) {
          showAlert('Please add at least one item', 'error');
          return;
        }
        
        const quotationData = {
          clientId,
          date: document.getElementById('quotationDate').value,
          expiryDate: document.getElementById('expiryDate').value,
          items,
          taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
          discount: parseFloat(document.getElementById('discount').value) || 0,
          terms: document.getElementById('quotationTerms').value,
          notes: document.getElementById('quotationNotes').value
        };
        
        let url = '/api/quotations';
        let method = 'POST';
        
        // Check if we're editing an existing quotation
        const urlParams = new URLSearchParams(window.location.search);
        const quotationId = urlParams.get('id');
        if (quotationId) {
          url = `/api/quotations/${quotationId}`;
          method = 'PUT';
        }
        
        simulateAPICall(url, quotationData, method)
          .then(response => {
            if (response.success) {
              if (preview) {
                window.open(`quotation-preview.html?id=${response.data.id}`, '_blank');
              } else if (send) {
                sendQuotationToClient(response.data.id);
              } else {
                showAlert('Quotation saved successfully!', 'success');
                if (!quotationId) {
                  // If this was a new quotation, redirect to edit page
                  window.location.href = `create-quotation.html?id=${response.data.id}`;
                }
              }
            } else {
              showAlert(response.message || 'Failed to save quotation', 'error');
            }
          });
      }
      
      function sendQuotationToClient(quotationId) {
        simulateAPICall(`/api/quotations/${quotationId}/send`, {}, 'POST')
          .then(response => {
            if (response.success) {
              showAlert('Quotation sent to client successfully!', 'success');
              window.location.href = 'quotations.html';
            } else {
              showAlert(response.message || 'Failed to send quotation', 'error');
            }
          });
      }
      
      // If we're editing an existing quotation, load its data
      const urlParams = new URLSearchParams(window.location.search);
      const quotationId = urlParams.get('id');
      if (quotationId) {
        loadQuotationData(quotationId);
      }
      
      function loadQuotationData(quotationId) {
        simulateAPICall(`/api/quotations/${quotationId}`)
          .then(response => {
            if (response.success) {
              const quotation = response.data;
              
              // Set basic info
              document.getElementById('quotationDate').value = quotation.date.split('T')[0];
              document.getElementById('expiryDate').value = quotation.expiryDate.split('T')[0];
              document.getElementById('taxRate').value = quotation.taxRate;
              document.getElementById('discount').value = quotation.discount;
              document.getElementById('quotationTerms').value = quotation.terms || '';
              document.getElementById('quotationNotes').value = quotation.notes || '';
              
              // Set client
              clientSelect.value = quotation.client.id;
              
              // Clear existing items
              itemsTable.innerHTML = '';
              
              // Add items
              quotation.items.forEach(item => {
                addItemRow({
                  id: item.product.id,
                  description: item.description,
                  quantity: item.quantity,
                  price: item.price
                });
              });
              
              // Update totals
              updateTotals();
            }
          });
      }
      
      // Helper functions
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      function simulateAPICall(url, data = {}, method = 'GET') {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (method === 'GET' && url === '/api/clients') {
              resolve({
                success: true,
                data: [
                  { id: 1, name: 'Client One' },
                  { id: 2, name: 'Client Two' },
                  { id: 3, name: 'Client Three' }
                ]
              });
            } else if (method === 'GET' && url === '/api/products') {
              resolve({
                success: true,
                data: [
                  { id: 1, name: 'Product A', price: 100 },
                  { id: 2, name: 'Product B', price: 200 },
                  { id: 3, name: 'Product C', price: 300 }
                ]
              });
            } else if (url.startsWith('/api/quotations') && method === 'POST') {
              resolve({
                success: true,
                data: { id: Math.floor(Math.random() * 1000) + 1 }
              });
            } else if (url.startsWith('/api/quotations') && method === 'PUT') {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/').pop()) }
              });
            } else if (url.endsWith('/send') && method === 'POST') {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/')[3]) }
              });
            } else if (url.startsWith('/api/quotations/') && method === 'GET') {
              resolve({
                success: true,
                data: {
                  id: parseInt(url.split('/').pop()),
                  client: { id: 1, name: 'Client One' },
                  date: '2023-06-15T00:00:00Z',
                  expiryDate: '2023-07-15T00:00:00Z',
                  taxRate: 10,
                  discount: 50,
                  terms: 'Payment due within 30 days',
                  notes: '',
                  items: [
                    {
                      product: { id: 1, name: 'Product A', price: 100 },
                      description: 'Sample description',
                      quantity: 2,
                      price: 100
                    }
                  ]
                }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 500);
        });
      }
    });
