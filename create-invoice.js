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
    
    itemsTable.appendChild
