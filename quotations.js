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
        
        if (quotations.length === 0) {
          quotationsTable.innerHTML = `
            <tr>
              <td colspan="7" class="empty-state">
                <i class="fas fa-file-invoice-dollar"></i>
                <p>No quotations found</p>
              </td>
            </tr>
          `;
          return;
        }
        
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
              <button class="btn-view" data-id="${quote.id}">
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn-convert" data-id="${quote.id}">
                <i class="fas fa-exchange-alt"></i> Convert
              </button>
              ${quote.status === 'PENDING' ? `
                <button class="btn-send" data-id="${quote.id}">
                  <i class="fas fa-paper-plane"></i> Send
                </button>
              ` : ''}
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
      
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      function simulateAPICall(url, data = {}, method = 'GET') {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (method === 'GET' && url === '/api/quotations') {
              // Generate mock quotations
              const mockQuotations = [];
              const clients = [
                { id: 1, name: 'Acme Corporation' },
                { id: 2, name: 'Globex Inc' },
                { id: 3, name: 'Soylent Corp' }
              ];
              const statuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
              
              for (let i = 1; i <= 15; i++) {
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 30));
                
                const expiryDate = new Date(date);
                expiryDate.setDate(expiryDate.getDate() + 30);
                
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                
                // Apply filters if provided
                if (data.status && status !== data.status.toUpperCase()) continue;
                if (data.client && !clients.some(c => c.name.toLowerCase().includes(data.client.toLowerCase()))) continue;
                
                mockQuotations.push({
                  id: i,
                  quoteNumber: `QT-${1000 + i}`,
                  client: clients[Math.floor(Math.random() * clients.length)],
                  date: date.toISOString(),
                  expiryDate: expiryDate.toISOString(),
                  total: Math.random() * 1000 + 100,
                  status: status
                });
              }
              
              resolve({
                success: true,
                data: mockQuotations
              });
            } else if (url.includes('/convert') && method === 'POST') {
              resolve({
                success: true,
                data: { invoiceId: Math.floor(Math.random() * 1000) + 100 }
              });
            } else if (url.includes('/send') && method === 'POST') {
              resolve({
                success: true,
                data: { id: parseInt(url.split('/')[3]) }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 800);
        });
      }
    });
