document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const quotationsTable = document.getElementById('quotationsTable').querySelector('tbody');
  const statusFilter = document.getElementById('statusFilter');
  const clientFilter = document.getElementById('clientFilter');
  const applyFilters = document.getElementById('applyFilters');
  
  // Apply filters button
  applyFilters.addEventListener('click', () => {
    loadQuotations();
  });
  
  // Load initial quotations
  loadQuotations();
  
  function loadQuotations() {
    const filters = {
      status: statusFilter.value,
      client: clientFilter.value
    };
    
    simulateAPICall('/api/quotations', filters)
      .then(response => {
        if (response.success) {
          renderQuotations(response.data);
        }
      });
  }
  
  function renderQuotations(quotations) {
    quotationsTable.innerHTML = '';
    
    quotations.forEach(quote => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${quote.quoteNumber}</td>
        <td>${quote.client.name}</td>
        <td>${formatDate(quote.date)}</td>
        <td>$${quote.total.toFixed(2)}</td>
        <td><span class="status-${quote.status.toLowerCase()}">${quote.status}</span></td>
        <td>${formatDate(quote.expiryDate)}</td>
        <td class="actions">
          <button class="btn-view" data-id="${quote.id}">View</button>
          <button class="btn-convert" data-id="${quote.id}">Convert to Invoice</button>
          ${quote.status === 'PENDING' ? `<button class="btn-send" data-id="${quote.id}">Send</button>` : ''}
        </td>
      `;
      quotationsTable.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => viewQuotation(btn.dataset.id));
    });
    
    // Add event listeners to convert buttons
    document.querySelectorAll('.btn-convert').forEach(btn => {
      btn.addEventListener('click', () => convertToInvoice(btn.dataset.id));
    });
    
    // Add event listeners to send buttons
    document.querySelectorAll('.btn-send').forEach(btn => {
      btn.addEventListener('click', () => sendQuotation(btn.dataset.id));
    });
  }
  
  function viewQuotation(quotationId) {
    window.location.href = `quotation-detail.html?id=${quotationId}`;
  }
  
  function convertToInvoice(quotationId) {
    if (confirm('Convert this quotation to an invoice?')) {
      simulateAPICall(`/api/quotations/${quotationId}/convert`, {}, 'POST')
        .then(response => {
          if (response.success) {
            showAlert('Quotation converted to invoice!', 'success');
            window.location.href = `create-invoice.html?id=${response.data.invoiceId}`;
          }
        });
    }
  }
  
  function sendQuotation(quotationId) {
    if (confirm('Send this quotation to the client?')) {
      simulateAPICall(`/api/quotations/${quotationId}/send`, {}, 'POST')
        .then(response => {
          if (response.success) {
            loadQuotations();
            showAlert('Quotation sent to client!', 'success');
          }
        });
    }
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
});
