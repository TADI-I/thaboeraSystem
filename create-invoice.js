document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const invoiceForm = document.getElementById('invoiceForm');
  const clientSelect = document.getElementById('clientSelect');
  const itemsTable = document.getElementById('itemsTable').querySelector('tbody');
  const addItemBtn = document.getElementById('addItemBtn');
  const previewInvoice = document.getElementById('previewInvoice');
  const sendInvoice = document.getElementById('sendInvoice');
  
  // Load clients and products
  loadClients();
  loadProducts();
  
  // Add item button
  addItemBtn.addEventListener('click', addItemRow);
  
  // Initialize with one item row
  addItemRow();
  
  // Form submission
  invoiceForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveInvoice();
  });
  
  // Preview button
  previewInvoice.addEventListener('click', function() {
    saveInvoice(true);
  });
  
  // Send button
  sendInvoice.addEventListener('click', function() {
    if (confirm('Send this invoice to the client?')) {
      saveInvoice(false, true);
    }
  });
  
  function addItemRow(product = null) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select class="item-select">
          <option value="">Select Product</option>
        </select>
      </td>
      <td><input type="text" class="item-description" ${product ? `value="${product.description}"` : ''}></td>
      <td><input type="number" class="item-quantity" min="1" value="${product ? product.quantity : 1}"></td>
      <td><input type="number" class="item-price" step="0.01" value="${product ? product.price.toFixed(2) : '0.00'}"></td>
      <td class="item-total">${product ? (product.quantity * product.price).toFixed(2) : '0.00'}</td>
      <td><button type="button" class="btn-remove-item">Remove</button></td>
    `;
    
    itemsTable.appendChild(tr);
    
    // Add event listeners to the new row
    const select = tr.querySelector('.item-select');
    const quantity = tr.querySelector('.item-quantity');
    const price = tr.querySelector('.item-price');
    const removeBtn = tr.querySelector('.btn-remove-item');
    
    // Populate product dropdown
    simulateAPICall('/api/products')
      .then(response => {
        if (response.success) {
          response.data.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            option.dataset.price = product.price;
            select.appendChild(option);
            
            // Select the product if it matches the one passed in
            if (product && product.id === product.id) {
              option.selected = true;
            }
          });
        }
      });
    
    // Update totals when product, quantity or price changes
    select.addEventListener('change', function() {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.dataset.price) {
        price.value = selectedOption.dataset.price;
        updateItemTotal(tr);
      }
    });
    
    quantity.addEventListener('input', () => updateItemTotal(tr));
    price.addEventListener('input', () => updateItemTotal(tr));
    
    removeBtn.addEventListener('click', function() {
      tr.remove();
      updateTotals();
    });
  }
  
  function updateItemTotal(row) {
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = (quantity * price).toFixed(2);
    row.querySelector('.item-total').textContent = total;
    updateTotals();
  }
  
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
    const grandTotal = (subtotal + parseFloat(taxAmount) - parseFloat(discountAmount)).toFixed(2);
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('taxAmount').textContent = taxAmount;
    document.getElementById('discountAmount').textContent = discountAmount;
    document.getElementById('grandTotal').textContent = grandTotal;
  }
  
  function loadClients() {
    simulateAPICall('/api/clients')
      .then(response => {
        if (response.success) {
          clientSelect.innerHTML = '<option value="">Select Client</option>';
          response.data.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
          });
        }
      });
  }
  
  function loadProducts() {
    // Already handled in addItemRow
  }
  
  function saveInvoice(preview = false, send = false) {
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
    
    const invoiceData = {
      clientId,
      date: document.getElementById('invoiceDate').value,
      dueDate: document.getElementById('dueDate').value,
      items,
      taxRate: parseFloat(document.getElementById('taxRate').value) || 0,
      discount: parseFloat(document.getElementById('discount').value) || 0,
      notes: document.getElementById('invoiceNotes').value
    };
    
    let url = '/api/invoices';
    let method = 'POST';
    
    // Check if we're editing an existing invoice
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
      url = `/api/invoices/${invoiceId}`;
      method = 'PUT';
    }
    
    simulateAPICall(url, invoiceData, method)
      .then(response => {
        if (response.success) {
          if (preview) {
            window.open(`invoice-preview.html?id=${response.data.id}`, '_blank');
          } else if (send) {
            sendInvoiceToClient(response.data.id);
          } else {
            showAlert('Invoice saved successfully!', 'success');
            if (!invoiceId) {
              // If this was a new invoice, redirect to edit page
              window.location.href = `create-invoice.html?id=${response.data.id}`;
            }
          }
        } else {
          showAlert(response.message || 'Failed to save invoice', 'error');
        }
      });
  }
  
  function sendInvoiceToClient(invoiceId) {
    simulateAPICall(`/api/invoices/${invoiceId}/send`, {}, 'POST')
      .then(response => {
        if (response.success) {
          showAlert('Invoice sent to client successfully!', 'success');
          window.location.href = 'invoices.html';
        } else {
          showAlert(response.message || 'Failed to send invoice', 'error');
        }
      });
  }
  
  // If we're editing an existing invoice, load its data
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');
  if (invoiceId) {
    loadInvoiceData(invoiceId);
  }
  
  function loadInvoiceData(invoiceId) {
    simulateAPICall(`/api/invoices/${invoiceId}`)
      .then(response => {
        if (response.success) {
          const invoice = response.data;
          
          // Set basic info
          document.getElementById('invoiceDate').value = invoice.date.split('T')[0];
          document.getElementById('dueDate').value = invoice.dueDate.split('T')[0];
          document.getElementById('taxRate').value = invoice.taxRate;
          document.getElementById('discount').value = invoice.discount;
          document.getElementById('invoiceNotes').value = invoice.notes || '';
          
          // Set client
          clientSelect.value = invoice.client.id;
          
          // Clear existing items
          itemsTable.innerHTML = '';
          
          // Add items
          invoice.items.forEach(item => {
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
});
