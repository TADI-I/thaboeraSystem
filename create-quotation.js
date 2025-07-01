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
  
  // Similar functions to create-invoice.js for managing items and totals
  // (addItemRow, updateItemTotal, updateTotals, loadClients, loadProducts)
  
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
});
