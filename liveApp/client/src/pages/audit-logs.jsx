import React, { useState, useEffect } from 'react';

const mockUsers = [
  { id: 1, name: 'Admin User' },
  { id: 2, name: 'John Smith' },
  { id: 3, name: 'Sarah Johnson' },
];

const mockLogs = [
  {
    timestamp: new Date(),
    user: 'Admin User',
    action: 'Login',
    entity: 'System',
    details: 'Successful login',
    ip: '192.168.1.1',
  },
  {
    timestamp: new Date(Date.now() - 3600000),
    user: 'John Smith',
    action: 'Update',
    entity: 'Product',
    details: 'Updated product #123',
    ip: '192.168.1.2',
  },
  {
    timestamp: new Date(Date.now() - 86400000),
    user: 'Sarah Johnson',
    action: 'Create',
    entity: 'Invoice',
    details: 'Created invoice #INV-2023-105',
    ip: '192.168.1.3',
  },
];

function formatDateTime(date) {
  return new Date(date).toLocaleString();
}

export default function AuditLogs() {
  // State for filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [logs, setLogs] = useState([]);

  // Pagination state (simplified, no real paging of mock data)
  const [page, setPage] = useState(1);
  const totalPages = 1;

  // On mount, set default date range (last 7 days)
  useEffect(() => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    // Initial load of logs
    setLogs(mockLogs);
  }, []);

  // Handle filter apply button
  function applyFilters() {
    // In real app, you'd fetch filtered data from backend here
    // For mock: filter mockLogs by date range, user, action

    let filtered = mockLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      if (logDate < start || logDate > end) return false;
      if (userFilter && log.user !== mockUsers.find(u => u.id.toString() === userFilter)?.name) return false;
      if (actionFilter && log.action.toLowerCase() !== actionFilter.toLowerCase()) return false;
      return true;
    });

    setLogs(filtered);
    setPage(1);
  }

  function exportLogs() {
    alert('Export functionality would be implemented here');
  }

  function prevPage() {
    alert('Previous page would load more logs');
  }

  function nextPage() {
    alert('Next page would load more logs');
  }

  return (
    <>
      <style>{`
        :root {
          --primary: #d32f2f;
          --primary-light: #ff6659;
          --primary-dark: #9a0007;
          --secondary: #f5f5f5;
          --text: #333;
          --text-light: #666;
          --border: #e0e0e0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        body {
          background-color: #f8f9fa;
          color: var(--text);
        }
        .audit-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px;
        }
        h1 {
          margin-bottom: 20px;
          color: var(--primary);
        }
        .audit-filters {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: flex-end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          min-width: 200px;
          flex: 1;
        }
        .filter-group label {
          margin-bottom: 8px;
          font-size: 14px;
          color: var(--text-light);
          font-weight: 500;
        }
        .filter-group input,
        .filter-group select {
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 4px;
          font-size: 14px;
        }
        .filter-group span {
          text-align: center;
          padding: 0 5px;
          color: var(--text-light);
        }
        .btn-primary {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-primary:hover {
          background-color: var(--primary-dark);
        }
        .btn-secondary {
          background-color: var(--secondary);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s;
          height: 40px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-secondary:hover {
          background-color: #e0e0e0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }
        th, td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
          color: var(--text);
          position: sticky;
          top: 0;
        }
        tr:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 15px;
        }
        .pagination button {
          padding: 8px 16px;
          min-width: 100px;
        }
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        #pageInfo {
          font-size: 14px;
          color: var(--text-light);
        }
        .action-badge {
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          text-transform: capitalize;
          font-size: 13px;
          display: inline-block;
          min-width: 65px;
          text-align: center;
        }
        .action-badge.login { background-color: #4caf50; }
        .action-badge.create { background-color: #2196f3; }
        .action-badge.update { background-color: #ff9800; }
        .action-badge.delete { background-color: #f44336; }
        .action-badge.system { background-color: #9c27b0; }

        /* Responsive */
        @media (max-width: 992px) {
          .audit-container { padding: 20px; }
          .filter-group { min-width: 150px; }
        }
        @media (max-width: 768px) {
          .filter-row { flex-direction: column; align-items: stretch; }
          .filter-group { min-width: 100%; }
          .audit-filters { padding: 15px; }
          th, td { padding: 10px; font-size: 14px; }
          .pagination { flex-direction: column; gap: 10px; }
        }
        @media (max-width: 576px) {
          .audit-container { padding: 15px; }
          table { display: block; overflow-x: auto; white-space: nowrap; }
        }
      `}</style>

      <div className="audit-container">
        <h1>
          <i className="fas fa-clipboard-list" /> Audit Logs
        </h1>

        <div className="audit-filters">
          <div className="filter-row">
            <div className="filter-group">
              <label>
                <i className="fas fa-calendar-alt" /> Date Range
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>to</span>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>
                <i className="fas fa-user" /> User
              </label>
              <select
                id="userFilter"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="">All Users</option>
                {mockUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>
                <i className="fas fa-bolt" /> Action Type
              </label>
              <select
                id="actionFilter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="system">System</option>
              </select>
            </div>

            <button onClick={applyFilters} className="btn-primary" id="applyFilters" type="button">
              <i className="fas fa-filter" /> Apply
            </button>
            <button onClick={exportLogs} className="btn-secondary" id="exportLogs" type="button">
              <i className="fas fa-download" /> Export
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table id="auditLogsTable">
            <thead>
              <tr>
                <th>
                  <i className="fas fa-clock" /> Timestamp
                </th>
                <th>
                  <i className="fas fa-user" /> User
                </th>
                <th>
                  <i className="fas fa-bolt" /> Action
                </th>
                <th>
                  <i className="fas fa-database" /> Entity
                </th>
                <th>
                  <i className="fas fa-info-circle" /> Details
                </th>
                <th>
                  <i className="fas fa-network-wired" /> IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx}>
                    <td>{formatDateTime(log.timestamp)}</td>
                    <td>{log.user}</td>
                    <td>
                      <span className={`action-badge ${log.action.toLowerCase()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entity}</td>
                    <td>{log.details}</td>
                    <td>{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            id="prevPage"
            className="btn-secondary"
            disabled={page === 1}
            onClick={prevPage}
            type="button"
          >
            <i className="fas fa-chevron-left" /> Previous
          </button>
          <span id="pageInfo">
            Page {page} of {totalPages}
          </span>
          <button
            id="nextPage"
            className="btn-secondary"
            disabled={page === totalPages}
            onClick={nextPage}
            type="button"
          >
            Next <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </>
  );
}
