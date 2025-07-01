document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const logsTable = document.getElementById('auditLogsTable').querySelector('tbody');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const userFilter = document.getElementById('userFilter');
  const actionFilter = document.getElementById('actionFilter');
  const applyFilters = document.getElementById('applyFilters');
  const exportLogs = document.getElementById('exportLogs');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  
  // Set default dates (last 7 days)
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  startDate.valueAsDate = sevenDaysAgo;
  endDate.valueAsDate = today;
  
  // Pagination variables
  let currentPage = 1;
  let totalPages = 1;
  
  // Apply filters button
  applyFilters.addEventListener('click', () => {
    currentPage = 1;
    loadAuditLogs();
  });
  
  // Export button
  exportLogs.addEventListener('click', () => {
    exportAuditLogs();
  });
  
  // Pagination buttons
  prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadAuditLogs();
    }
  });
  
  nextPage.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadAuditLogs();
    }
  });
  
  // Load initial logs and users
  loadAuditLogs();
  loadUsersForFilter();
  
  function loadAuditLogs() {
    const filters = {
      startDate: startDate.value,
      endDate: endDate.value,
      userId: userFilter.value,
      actionType: actionFilter.value,
      page: currentPage,
      limit: 20
    };
    
    simulateAPICall('/api/audit-logs', filters)
      .then(response => {
        if (response.success) {
          renderAuditLogs(response.data.logs);
          updatePagination(response.data.total, response.data.limit);
        }
      });
  }
  
  function loadUsersForFilter() {
    simulateAPICall('/api/users')
      .then(response => {
        if (response.success) {
          userFilter.innerHTML = '<option value="">All Users</option>';
          response.data.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.name;
            userFilter.appendChild(option);
          });
        }
      });
  }
  
  function renderAuditLogs(logs) {
    logsTable.innerHTML = '';
    
    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDateTime(log.timestamp)}</td>
        <td>${log.user ? log.user.name : 'System'}</td>
        <td>${log.action}</td>
        <td>${log.entityType}</td>
        <td>${log.details}</td>
        <td>${log.ipAddress}</td>
      `;
      logsTable.appendChild(tr);
    });
  }
  
  function updatePagination(totalItems, itemsPerPage) {
    totalPages = Math.ceil(totalItems / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevPage.disabled = currentPage <= 1;
    nextPage.disabled = currentPage >= totalPages;
  }
  
  function exportAuditLogs() {
    const filters = {
      startDate: startDate.value,
      endDate: endDate.value,
      userId: userFilter.value,
      actionType: actionFilter.value
    };
    
    simulateAPICall('/api/audit-logs/export', filters)
      .then(response => {
        if (response.success) {
          // Create a temporary link to download the report
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  }
  
  function formatDateTime(dateTimeString) {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  }
});
