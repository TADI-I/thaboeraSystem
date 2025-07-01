document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const dateRange = document.getElementById('dateRange');
  const customDates = document.querySelector('.custom-dates');
  const startDate = document.getElementById('startDate');
  const endDate = document.getElementById('endDate');
  const groupBy = document.getElementById('groupBy');
  const applyFilters = document.getElementById('applyFilters');
  const exportReport = document.getElementById('exportReport');
  
  // Date range selector
  dateRange.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDates.style.display = 'flex';
    } else {
      customDates.style.display = 'none';
      
      // Set date range based on selection
      const today = new Date();
      let start = new Date();
      
      switch (this.value) {
        case 'today':
          start.setDate(today.getDate());
          break;
        case 'week':
          start.setDate(today.getDate() - 7);
          break;
        case 'month':
          start.setMonth(today.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(today.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(today.getFullYear() - 1);
          break;
      }
      
      startDate.valueAsDate = start;
      endDate.valueAsDate = today;
    }
  });
  
  // Apply filters button
  applyFilters.addEventListener('click', () => {
    loadSalesData();
  });
  
  // Export button
  exportReport.addEventListener('click', () => {
    exportSalesReport();
  });
  
  // Load initial data
  loadSalesData();
  
  function loadSalesData() {
    const filters = {
      dateFrom: startDate.value,
      dateTo: endDate.value,
      groupBy: groupBy.value
    };
    
    simulateAPICall('/api/reports/sales', filters)
      .then(response => {
        if (response.success) {
          renderSalesCharts(response.data);
          renderSalesTable(response.data);
        }
      });
  }
  
  function renderSalesCharts(data) {
    // Sales Trend Chart
    const salesCtx = document.getElementById('salesTrendChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.salesTrendChart) {
      window.salesTrendChart.destroy();
    }
    
    window.salesTrendChart = new Chart(salesCtx, {
      type: 'line',
      data: {
        labels: data.chartData.labels,
        datasets: [{
          label: 'Sales',
          data: data.chartData.sales,
          borderColor: '#3a7bd5',
          backgroundColor: 'rgba(58, 123, 213, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Trend'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
    
    // Product Performance Chart
    const productCtx = document.getElementById('productPerformanceChart').getContext('2d');
    
    // Destroy previous chart if it exists
    if (window.productPerformanceChart) {
      window.productPerformanceChart.destroy();
    }
    
    window.productPerformanceChart = new Chart(productCtx, {
      type: 'bar',
      data: {
        labels: data.topProducts.map(p => p.name),
        datasets: [{
          label: 'Revenue',
          data: data.topProducts.map(p => p.revenue),
          backgroundColor: 'rgba(58, 123, 213, 0.7)',
          borderColor: 'rgba(58, 123, 213, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top Products by Revenue'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }
  
  function renderSalesTable(data) {
    const tableBody = document.getElementById('salesDataTable').querySelector('tbody');
    tableBody.innerHTML = '';
    
    data.periods.forEach(period => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${period.label}</td>
        <td>${period.invoices}</td>
        <td>$${period.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${period.tax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${period.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td>$${period.avgInvoice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
  
  function exportSalesReport() {
    const filters = {
      dateFrom: startDate.value,
      dateTo: endDate.value,
      groupBy: groupBy.value
    };
    
    simulateAPICall('/api/reports/sales/export', filters)
      .then(response => {
        if (response.success) {
          // Create a temporary link to download the report
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.download = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  }
});
