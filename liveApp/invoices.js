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
        
        if (invoices.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td colspan="7" class="empty-state">
              <i class="fas fa-file-invoice"></i>
              <p>No invoices found matching your criteria</p>
            </td>
          `;
          invoicesTable.appendChild(tr);
          return;
        }
        
        invoices.forEach(invoice => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.client.name}</td>
            <td>${formatDate(invoice.date)}</td>
            <td>$${invoice.total.toFixed(2)}</td>
            <td><span class="status-${invoice.status}">${capitalizeFirstLetter(invoice.status)}</span></td>
            <td>${formatDate(invoice.dueDate)}</td>
            <td class="actions">
              <button class="btn-view" data-id="${invoice.id}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn-pdf" data-id="${invoice.id}">
                <i class="fas fa-file-pdf"></i> PDF
              </button>
              ${invoice.status === 'unpaid' || invoice.status === 'overdue' ? `
                <button class="btn-mark-paid" data-id="${invoice.id}">
                  <i class="fas fa-check-circle"></i> Paid
                </button>
              ` : ''}
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
      
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      function simulateAPICall(url, data = {}, method = 'GET') {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (method === 'GET' && url === '/api/invoices') {
              // Generate mock data
              const mockInvoices = [];
              const statuses = ['paid', 'unpaid', 'overdue'];
              const clients = [
                { id: 1, name: 'Acme Corporation' },
                { id: 2, name: 'Globex Inc' },
                { id: 3, name: 'Soylent Corp' }
              ];
              
              // Apply filters to mock data
              let filteredStatus = data.status || '';
              let dateFrom = data.dateFrom ? new Date(data.dateFrom) : null;
              let dateTo = data.dateTo ? new Date(data.dateTo) : null;
              
              for (let i = 1; i <= 15; i++) {
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 60));
                
                // Skip if doesn't match status filter
                if (filteredStatus && status !== filteredStatus) continue;
                
                // Skip if outside date range
                if (dateFrom && date < dateFrom) continue;
                if (dateTo && date > dateTo) continue;
                
                const dueDate = new Date(date);
                dueDate.setDate(dueDate.getDate() + 30);
                
                // Mark as overdue if unpaid and past due date
                let finalStatus = status;
                if (status === 'unpaid' && new Date() > dueDate) {
                  finalStatus = 'overdue';
                }
                
                mockInvoices.push({
                  id: i,
                  invoiceNumber: `INV-${1000 + i}`,
                  client: clients[Math.floor(Math.random() * clients.length)],
                  date: date.toISOString(),
                  dueDate: dueDate.toISOString(),
                  total: Math.random() * 1000 + 100,
                  status: finalStatus
                });
              }
              
              resolve({
                success: true,
                data: mockInvoices
              });
            } else if (url.includes('/pdf') && method === 'GET') {
              resolve({
                success: true,
                data: { pdfUrl: 'https://example.com/invoice.pdf' }
              });
            } else if (url.includes('/pay') && method === 'PUT') {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/')[3]) }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 500);
        });
      }
    });
