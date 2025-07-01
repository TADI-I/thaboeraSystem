 document.addEventListener('DOMContentLoaded', function() {
      // Set default dates (last 7 days)
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      document.getElementById('startDate').valueAsDate = sevenDaysAgo;
      document.getElementById('endDate').valueAsDate = today;
      
      // Mock data - replace with actual API calls
      const mockUsers = [
        { id: 1, name: 'Admin User' },
        { id: 2, name: 'John Smith' },
        { id: 3, name: 'Sarah Johnson' }
      ];
      
      const mockLogs = [
        {
          timestamp: new Date(),
          user: 'Admin User',
          action: 'Login',
          entity: 'System',
          details: 'Successful login',
          ip: '192.168.1.1'
        },
        {
          timestamp: new Date(Date.now() - 3600000),
          user: 'John Smith',
          action: 'Update',
          entity: 'Product',
          details: 'Updated product #123',
          ip: '192.168.1.2'
        },
        {
          timestamp: new Date(Date.now() - 86400000),
          user: 'Sarah Johnson',
          action: 'Create',
          entity: 'Invoice',
          details: 'Created invoice #INV-2023-105',
          ip: '192.168.1.3'
        }
      ];
      
      // Populate user filter
      const userFilter = document.getElementById('userFilter');
      mockUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        userFilter.appendChild(option);
      });
      
      // Render logs
      function renderLogs(logs) {
        const tbody = document.querySelector('#auditLogsTable tbody');
        tbody.innerHTML = '';
        
        if (logs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="text-align: center;">No audit logs found</td>
            </tr>
          `;
          return;
        }
        
        logs.forEach(log => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${formatDateTime(log.timestamp)}</td>
            <td>${log.user}</td>
            <td><span class="action-badge ${log.action.toLowerCase()}">${log.action}</span></td>
            <td>${log.entity}</td>
            <td>${log.details}</td>
            <td>${log.ip}</td>
          `;
          tbody.appendChild(tr);
        });
      }
      
      // Format date/time
      function formatDateTime(date) {
        return new Date(date).toLocaleString();
      }
      
      // Apply filters
      document.getElementById('applyFilters').addEventListener('click', function() {
        // In a real app, this would fetch filtered data from the server
        renderLogs(mockLogs);
      });
      
      // Initial load
      renderLogs(mockLogs);
      
      // Export functionality
      document.getElementById('exportLogs').addEventListener('click', function() {
        alert('Export functionality would be implemented here');
        // In a real app, this would trigger a CSV/Excel download
      });
      
      // Pagination functionality
      document.getElementById('prevPage').addEventListener('click', function() {
        alert('Previous page would load more logs');
      });
      
      document.getElementById('nextPage').addEventListener('click', function() {
        alert('Next page would load more logs');
      });
    });
