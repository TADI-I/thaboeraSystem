import React, { useEffect, useState } from 'react';
import './quotations.css'; // Move the style into this CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoiceDollar, faPlus, faFilter, faEye, faExchangeAlt, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      loadQuotations();
    }
  }, []);

  const loadQuotations = () => {
    const filters = {
      status: statusFilter,
      client: clientFilter
    };
    simulateAPICall('/api/quotations', filters).then(res => {
      if (res.success) setQuotations(res.data);
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const viewQuotation = (id) => {
    window.location.href = `quotation-detail.html?id=${id}`;
  };

  const convertToInvoice = (id) => {
    if (window.confirm('Convert this quotation to an invoice?')) {
      simulateAPICall(`/api/quotations/${id}/convert`, {}, 'POST').then(res => {
        if (res.success) {
          alert('Quotation converted to invoice!');
          window.location.href = `create-invoice.html?id=${res.data.invoiceId}`;
        }
      });
    }
  };

  const sendQuotation = (id) => {
    if (window.confirm('Send this quotation to the client?')) {
      simulateAPICall(`/api/quotations/${id}/send`, {}, 'POST').then(res => {
        if (res.success) {
          alert('Quotation sent to client!');
          loadQuotations();
        }
      });
    }
  };

  return (
    <div className="documents-container">
      <h1><FontAwesomeIcon icon={faFileInvoiceDollar} /> Quotations</h1>

      <div className="document-actions">
        <button className="btn-primary" onClick={() => window.location.href = 'create-quotation.html'}>
          <FontAwesomeIcon icon={faPlus} /> Create Quotation
        </button>

        <div className="document-filters">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXPIRED">Expired</option>
          </select>

          <input type="text" placeholder="Filter by client..." value={clientFilter} onChange={e => setClientFilter(e.target.value)} />

          <button className="btn-secondary" onClick={loadQuotations}>
            <FontAwesomeIcon icon={faFilter} /> Apply
          </button>
        </div>
      </div>

      <table id="quotationsTable">
        <thead>
          <tr>
            <th>Quote #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-state">
                <FontAwesomeIcon icon={faFileInvoiceDollar} />
                <p>No quotations found</p>
              </td>
            </tr>
          ) : (
            quotations.map(quote => (
              <tr key={quote.id}>
                <td>{quote.quoteNumber}</td>
                <td>{quote.client.name}</td>
                <td>{formatDate(quote.date)}</td>
                <td>${quote.total.toFixed(2)}</td>
                <td><span className={`status-${quote.status.toLowerCase()}`}>{quote.status}</span></td>
                <td>{formatDate(quote.expiryDate)}</td>
                <td className="actions">
                  <button className="btn-view" onClick={() => viewQuotation(quote.id)}>
                    <FontAwesomeIcon icon={faEye} /> View
                  </button>
                  <button className="btn-convert" onClick={() => convertToInvoice(quote.id)}>
                    <FontAwesomeIcon icon={faExchangeAlt} /> Convert
                  </button>
                  {quote.status === 'PENDING' && (
                    <button className="btn-send" onClick={() => sendQuotation(quote.id)}>
                      <FontAwesomeIcon icon={faPaperPlane} /> Send
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Quotations;

function simulateAPICall(url, data = {}, method = 'GET') {
  return new Promise(resolve => {
    setTimeout(() => {
      if (method === 'GET' && url === '/api/quotations') {
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

          if (data.status && status !== data.status) continue;
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

        resolve({ success: true, data: mockQuotations });
      } else if (url.includes('/convert') && method === 'POST') {
        resolve({ success: true, data: { invoiceId: Math.floor(Math.random() * 1000) + 100 } });
      } else if (url.includes('/send') && method === 'POST') {
        resolve({ success: true, data: { id: parseInt(url.split('/')[3]) } });
      } else {
        resolve({ success: false, message: 'API error' });
      }
    }, 800);
  });
}
