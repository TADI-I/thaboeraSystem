document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const invoicesTable = document.getElementById('invoicesTable').querySelector('tbody');
  const statusFilter = document.getElementById('statusFilter');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const applyFilters = document.getElementById('applyFilters');
  
  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  dateFrom.valueAsDate = thirtyDaysAgo;
  dateTo.valueAsDate = today;
  
  // Apply filters button
  applyFilters.addEventListener('click', () => {
    loadInvoices();
  });
  
  // Load initial invoices
  loadInvoices();
  
  function loadInvoices() {
    const filters = {
      status: statusFilter.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value
    };
    
    simulateAPICall('/api/invoices', filters)
      .then(response => {
        if (response.success) {
          renderInvoices(response.data);
        }
      });
  }
  
  function renderInvoices(invoices) {
    invoicesTable.innerHTML = '';
    
    invoices.forEach(invoice => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${invoice.invoiceNumber}</td>
        <td>${invoice.client.name}</td>
        <td>${formatDate(invoice.date)}</td>
        <td>$${invoice.total.toFixed(2)}</td>
        <td><span class="status-${invoice.status}">${invoice.status}</span></td>
        <td>${formatDate(invoice.dueDate)}</td>
        <td class="actions">
          <button class="btn-view" data-id="${invoice.id}">View</button>
          <button class="btn-pdf" data-id="${invoice.id}">PDF</button>
          ${invoice.status === 'unpaid' ? `<button class="btn-mark-paid" data-id="${invoice.id}">Mark Paid</button>` : ''}
        </td>
      `;
      invoicesTable.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => viewInvoice(btn.dataset.id));
    });
    
    // Add event listeners to PDF buttons
    document.querySelectorAll('.btn-pdf').forEach(btn => {
      btn.addEventListener('click', () => downloadPDF(btn.dataset.id));
    });
    
    // Add event listeners to mark paid buttons
    document.querySelectorAll('.btn-mark-paid').forEach(btn => {
      btn.addEventListener('click', () => markInvoicePaid(btn.dataset.id));
    });
  }
  
  function viewInvoice(invoiceId) {
    window.location.href = `invoice-detail.html?id=${invoiceId}`;
  }
  
  function downloadPDF(invoiceId) {
    // In a real app, this would download the PDF
    simulateAPICall(`/api/invoices/${invoiceId}/pdf`)
      .then(response => {
        if (response.success) {
          // Create a temporary link to download the PDF
          const link = document.createElement('a');
          link.href = response.data.pdfUrl;
          link.download = `invoice_${invoiceId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  }
  
  function markInvoicePaid(invoiceId) {
    if (confirm('Mark this invoice as paid?')) {
      simulateAPICall(`/api/invoices/${invoiceId}/pay`, {}, 'PUT')
        .then(response => {
          if (response.success) {
            loadInvoices();
            showAlert('Invoice marked as paid!', 'success');
          }
        });
    }
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
});
