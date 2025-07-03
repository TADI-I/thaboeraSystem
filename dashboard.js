document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Load user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  document.getElementById('welcomeMessage').textContent = `Welcome, ${user.name || 'User'}!`;
  
  // Initialize charts
  initializeCharts();
  
  // Load recent activity
  loadRecentActivity();
  
  // Load stats
  loadStats();
  
  function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Sales',
          data: [12000, 19000, 15000, 18000, 22000, 25000],
          borderColor: '#3a7bd5',
          backgroundColor: 'rgba(58, 123, 213, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          }
        }
      }
    });
    
    // Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
    const inventoryChart = new Chart(inventoryCtx, {
      type: 'bar',
      data: {
        labels: ['Laptops', 'Monitors', 'Keyboards', 'Mice', 'Cables'],
        datasets: [{
          label: 'Current Stock',
          data: [45, 32, 68, 92, 150],
          backgroundColor: [
            'rgba(58, 123, 213, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(58, 123, 213, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          }
        }
      }
    });
  }
  
  function loadRecentActivity() {
    simulateAPICall('/api/activity')
      .then(response => {
        if (response.success) {
          const activityList = document.querySelector('.activity-list');
          activityList.innerHTML = '';
          
          response.data.forEach(activity => {
            const li = document.createElement('li');
            li.innerHTML = `
              <span class="activity-type ${activity.type}">${activity.type}</span>
              <span class="activity-message">${activity.message}</span>
              <span class="activity-time">${formatTime(activity.timestamp)}</span>
            `;
            activityList.appendChild(li);
          });
        }
      });
  }
  
  function loadStats() {
    simulateAPICall('/api/stats')
      .then(response => {
        if (response.success) {
          document.querySelector('.card:nth-child(1) p').textContent = `$${response.data.totalSales.toLocaleString()}`;
          document.querySelector('.card:nth-child(2) p').textContent = response.data.openTickets;
          // Update other stats as needed
        }
      });
  }
  
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
});
