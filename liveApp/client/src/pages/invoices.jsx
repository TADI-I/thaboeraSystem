import React, { useEffect, useState } from 'react';
import { FaFileInvoice, FaPlus, FaFilter, FaEye, FaFilePdf, FaCheckCircle } from 'react-icons/fa';

const mockClients = [
  { id: 1, name: 'Acme Corporation' },
  { id: 2, name: 'Globex Inc' },
  { id: 3, name: 'Soylent Corp' }
];

const getRandomStatus = () => ['paid', 'unpaid', 'overdue'][Math.floor(Math.random() * 3)];

const simulateAPI = (filters) => {
  const invoices = [];
  const today = new Date();
  const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

  for (let i = 1; i <= 15; i++) {
    const status = getRandomStatus();
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    if (filters.status && filters.status !== status) continue;
    if (fromDate && date < fromDate) continue;
    if (toDate && date > toDate) continue;

    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 30);

    let finalStatus = status;
    if (status === 'unpaid' && today > dueDate) finalStatus = 'overdue';

    invoices.push({
      id: i,
      invoiceNumber: `INV-${1000 + i}`,
      client: mockClients[Math.floor(Math.random() * 3)],
      date: date.toISOString(),
      dueDate: dueDate.toISOString(),
      total: Math.random() * 1000 + 100,
      status: finalStatus
    });
  }
  return invoices;
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const data = simulateAPI(filters);
    setInvoices(data);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  return (
    <div className="documents-container">
      <h1><FaFileInvoice /> Invoices</h1>
      <div className="document-actions">
        <button className="btn-primary" onClick={() => alert('Navigate to create invoice')}>
          <FaPlus /> Create Invoice
        </button>
        <div className="document-filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          <button className="btn-secondary" onClick={loadInvoices}><FaFilter /> Apply</button>
        </div>
      </div>

      <table id="invoicesTable">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-state">
                <FaFileInvoice />
                <p>No invoices found matching your criteria</p>
              </td>
            </tr>
          ) : (
            invoices.map(inv => (
              <tr key={inv.id}>
                <td>{inv.invoiceNumber}</td>
                <td>{inv.client.name}</td>
                <td>{formatDate(inv.date)}</td>
                <td>${inv.total.toFixed(2)}</td>
                <td><span className={`status-${inv.status}`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                <td>{formatDate(inv.dueDate)}</td>
                <td className="actions">
                  <button className="btn-view"><FaEye /> View</button>
                  <button className="btn-pdf"><FaFilePdf /> PDF</button>
                  {(inv.status === 'unpaid' || inv.status === 'overdue') && (
                    <button className="btn-mark-paid"><FaCheckCircle /> Paid</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
