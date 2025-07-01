// create-invoice.js
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const invoiceForm = document.getElementById('invoiceForm');
  const clientSelect = document.getElementById('clientSelect');
  const invoiceNumber = document.getElementById('invoiceNumber');
  const itemsTable = document.getElementById('itemsTable').querySelector('tbody');
  const addItemBtn = document.getElementById('addItemBtn');
  const previewInvoice = document.getElementById('previewInvoice');
  const sendInvoice = document.getElementById('sendInvoice');
  const downloadInvoice = document.getElementById('downloadInvoice');
  const backButton = document.getElementById('backButton');
  const formTitle = document.getElementById('formTitle');
  
  // Check if we're editing an existing invoice
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');
  const isEditMode = !!invoiceId;
  
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toISOString().split('T')[0];
  
  document.getElementById('invoiceDate').value = today;
  document.getElementById('dueDate').value = dueDateStr;
  
  // Initialize form
  if (isEditMode) {
    formTitle.textContent = 'Edit Invoice';
    loadInvoiceData(invoiceId);
  } else {
    generateInvoiceNumber();
  }
  
  // Load clients and products
  loadClients();
  
  // Event listeners
  addItemBtn.addEventListener('click', addItemRow);
  invoiceForm.addEventListener('submit', handleFormSubmit);
  previewInvoice.addEventListener('click', () => handleSave(true, false));
  sendInvoice.addEventListener('click', () => {
    if (confirm('Send this invoice to the client?')) {
      handleSave(false, true);
    }
  });
  downloadInvoice.addEventListener('click', () => handleSave(false, false, true));
  backButton.addEventListener('click', () => window.location.href = 'invoices.html');
  
  // Initialize with one empty item row
  addItemRow();
  
  // Tax and discount inputs
  document.getElementById('discount').addEventListener('input', updateTotals);
  
  function generateInvoiceNumber() {
    // This would typically come from your backend
    const prefix = 'INV-';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    invoiceNumber.value = `${prefix}${randomNum}`;
  }
  
  function addItemRow(item = null) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select class="item-select" required>
          <option value="">Select Product</option>
        </select>
      </td>
      <td><input type="text" class="item-description" value="${item?.description || ''}"></td>
      <td><input type="number" class="item-quantity" min="1" value="${item?.quantity || 1}"></td>
      <td><input type="number" class="item-price" step="0.01" value="${item?.price?.toFixed(2) || '0.00'}"></td>
      <td>
        <select class="item-tax">
          <option value="0" ${item?.taxRate === 0 ? 'selected' : ''}>0%</option>
          <option value="10" ${item?.taxRate === 10 ? 'selected' : ''}>10%</option>
          <option value="20" ${item?.taxRate === 20 ? 'selected' : ''}>20%</option>
        </select>
      </td>
      <td class="item-total">${item ? (item.quantity * item.price).toFixed(2) : '0.00'}</td>
      <td><button type="button" class="btn-remove-item">×</button></td>
    `;
    
    itemsTable.appendChild(tr);
    
    // Populate product dropdown
    const select = tr.querySelector('.item-select');
    loadProducts().then(products => {
      products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        option.dataset.price = product.price;
        option.dataset.description = product.description;
        select.appendChild(option);
        
        // Select the product if it matches the current item
        if (item && item.productId === product.id) {
          option.selected = true;
        }
      });
    });
    
    // Add event listeners
    const quantity = tr.querySelector('.item-quantity');
    const price = tr.querySelector('.item-price');
    const removeBtn = tr.querySelector('.btn-remove-item');
    
    select.addEventListener('change', function() {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.dataset.price) {
        price.value = selectedOption.dataset.price;
        if (selectedOption.dataset.description) {
          tr.querySelector('.item-description').value = selectedOption.dataset.description;
        }
        updateItemTotal(tr);
      }
    });
    
    quantity.addEventListener('input', () => updateItemTotal(tr));
    price.addEventListener('input', () => updateItemTotal(tr));
    tr.querySelector('.item-tax').addEventListener('change', updateTotals);
    
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
    let totalTax = 0;
    
    document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
      const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
      const price = parseFloat(row.querySelector('.item-price').value) || 0;
      const taxRate = parseFloat(row.querySelector('.item-tax').value) || 0;
      
      const itemTotal = quantity * price;
      const itemTax = itemTotal * (taxRate / 100);
      
      subtotal += itemTotal;
      totalTax += itemTax;
    });
    
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const grandTotal = subtotal + totalTax - discount;
    
    document.getElementById('subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('taxAmount').textContent = totalTax.toFixed(2);
    document.getElementById('discountAmount').textContent = discount.toFixed(2);
    document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
  }
  
  function loadClients() {
    return simulateAPICall('/api/clients')
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
        return response;
      });
  }
  
  function loadProducts() {
    return simulateAPICall('/api/products')
      .then(response => {
        if (response.success) {
          return response.data;
        }
        return [];
      });
  }
  
  function loadInvoiceData(invoiceId) {
    return simulateAPICall(`/api/invoices/${invoiceId}`)
      .then(response => {
        if (response.success) {
          const invoice = response.data;
          
          // Set basic info
          invoiceNumber.value = invoice.number;
          document.getElementById('invoiceDate').value = invoice.date.split('T')[0];
          document.getElementById('dueDate').value = invoice.dueDate.split('T')[0];
          document.getElementById('discount').value = invoice.discount;
          document.getElementById('invoiceNotes').value = invoice.notes || '';
          document.getElementById('invoiceTerms').value = invoice.terms || '';
          
          // Set client
          clientSelect.value = invoice.client.id;
          
          // Clear existing items
          itemsTable.innerHTML = '';
          
          // Add items
          invoice.items.forEach(item => {
            addItemRow({
              productId: item.product.id,
              description: item.description,
              quantity: item.quantity,
              price: item.price,
              taxRate: item.taxRate || 0
            });
          });
          
          updateTotals();
        }
        return response;
      });
  }
  
  function handleFormSubmit(e) {
    e.preventDefault();
    handleSave();
  }
  
  function handleSave(preview = false, send = false, download = false) {
    const clientId = clientSelect.value;
    if (!clientId) {
      showAlert('Please select a client', 'error');
      return;
    }
    
    const items = [];
    let hasErrors = false;
    
    document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
      const select = row.querySelector('.item-select');
      const productId = select.value;
      
      if (!productId) {
        showAlert('Please select a product for all items', 'error');
        hasErrors = true;
        return;
      }
      
      items.push({
        productId,
        description: row.querySelector('.item-description').value,
        quantity: parseFloat(row.querySelector('.item-quantity').value),
        price: parseFloat(row.querySelector('.item-price').value),
        taxRate: parseFloat(row.querySelector('.item-tax').value)
      });
    });
    
    if (hasErrors) return;
    
    if (items.length === 0) {
      showAlert('Please add at least one item', 'error');
      return;
    }
    
    const invoiceData = {
      clientId,
      number: invoiceNumber.value,
      date: document.getElementById('invoiceDate').value,
      dueDate: document.getElementById('dueDate').value,
      items,
      discount: parseFloat(document.getElementById('discount').value) || 0,
      notes: document.getElementById('invoiceNotes').value,
      terms: document.getElementById('invoiceTerms').value
    };
    
    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/invoices/${invoiceId}` : '/api/invoices';
    
    simulateAPICall(url, invoiceData, method)
      .then(response => {
        if (response.success) {
          const savedInvoiceId = response.data.id;
          
          if (preview) {
            window.open(`invoice-preview.html?id=${savedInvoiceId}`, '_blank');
          } else if (send) {
            sendInvoiceToClient(savedInvoiceId);
          } else if (download) {
            downloadInvoicePDF(savedInvoiceId);
          } else {
            showAlert(`Invoice ${isEditMode ? 'updated' : 'created'} successfully!`, 'success');
            if (!isEditMode) {
              window.location.href = `create-invoice.html?id=${savedInvoiceId}`;
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
  
  function downloadInvoicePDF(invoiceId) {
    // This would typically redirect to a PDF generation endpoint
    window.open(`/api/invoices/${invoiceId}/pdf`, '_blank');
  }
  
  // Helper function to show alerts
  function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
  
  // Mock API function (replace with actual fetch calls)
  function simulateAPICall(url, data = {}, method = 'GET') {
    console.log(`API Call: ${method} ${url}`, data);
    
    // Mock responses for demonstration
    if (url === '/api/clients') {
      return Promise.resolve({
        success: true,
        data: [
          { id: 1, name: 'Acme Corp' },
          { id: 2, name: 'Globex Corporation' },
          { id: 3, name: 'Soylent Corp' }
        ]
      });
    }
    
    if (url === '/api/products') {
      return Promise.resolve({
        success: true,
        data: [
          { id: 1, name: 'Web Design', price: 1000, description: 'Custom website design' },
          { id: 2, name: 'Development', price: 150, description: 'Hourly development work' },
          { id: 3, name: 'Consulting', price: 200, description: 'Business consulting' }
        ]
      });
    }
    
    if (url.startsWith('/api/invoices/') && method === 'GET') {
      const invoiceId = url.split('/').pop();
      return Promise.resolve({
        success: true,
        data: {
          id: invoiceId,
          number: `INV-${invoiceId.padStart(6, '0')}`,
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          client: { id: 1, name: 'Acme Corp' },
          items: [
            { 
              product: { id: 1, name: 'Web Design' }, 
              description: 'Custom website design',
              quantity: 1,
              price: 1000,
              taxRate: 20
            }
          ],
          discount: 0,
          notes: '',
          terms: 'Payment due within 30 days'
        }
      });
    }
    
    if (url === '/api/invoices' || url.startsWith('/api/invoices/')) {
      return Promise.resolve({
        success: true,
        data: {
          id: invoiceId || Math.floor(Math.random() * 1000),
          ...data
        }
      });
    }
    
    return Promise.resolve({
      success: true,
      data: {}
    });
  }
});
