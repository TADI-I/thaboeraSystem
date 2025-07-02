import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import './SalesReports.css'; // Use your existing CSS

const simulateAPICall = (url, filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          chartData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr'],
            sales: [1200, 1500, 1000, 1800]
          },
          topProducts: [
            { name: 'Product A', revenue: 5000 },
            { name: 'Product B', revenue: 3000 },
            { name: 'Product C', revenue: 2000 }
          ],
          periods: [
            {
              label: 'Jan 2025',
              invoices: 25,
              revenue: 15000,
              tax: 1800,
              profit: 5000,
              avgInvoice: 600
            },
            {
              label: 'Feb 2025',
              invoices: 18,
              revenue: 12000,
              tax: 1500,
              profit: 4000,
              avgInvoice: 666.67
            }
          ]
        }
      });
    }, 800);
  });
};

const SalesReports = () => {
  const [dateRange, setDateRange] = useState('month');
  const [groupBy, setGroupBy] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [tableData, setTableData] = useState([]);

  const salesChartRef = useRef(null);
  const productChartRef = useRef(null);
  const salesChartInstance = useRef(null);
  const productChartInstance = useRef(null);

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      window.location.href = 'login.html';
      return;
    }
    handleDateRangeChange('month');
  }, []);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    const today = new Date();
    let start = new Date();

    switch (value) {
      case 'today':
        start = new Date();
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
      case 'custom':
        setShowCustomDates(true);
        return;
    }

    setShowCustomDates(false);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    loadSalesData(start.toISOString().split('T')[0], today.toISOString().split('T')[0]);
  };

  const loadSalesData = (from = startDate, to = endDate) => {
    const filters = {
      dateFrom: from,
      dateTo: to,
      groupBy: groupBy
    };

    simulateAPICall('/api/reports/sales', filters).then((res) => {
      if (res.success) {
        renderCharts(res.data);
        setTableData(res.data.periods);
      }
    });
  };

  const renderCharts = (data) => {
    if (salesChartInstance.current) salesChartInstance.current.destroy();
    if (productChartInstance.current) productChartInstance.current.destroy();

    salesChartInstance.current = new Chart(salesChartRef.current, {
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
          title: { display: true, text: 'Sales Trend' },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        }
      }
    });

    productChartInstance.current = new Chart(productChartRef.current, {
      type: 'bar',
      data: {
        labels: data.topProducts.map(p => p.name),
        datasets: [{
          label: 'Revenue',
          data: data.topProducts.map(p => p.revenue),
          backgroundColor: 'rgba(58, 123, 213, 0.7)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Top Products by Revenue' },
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value.toLocaleString()
            }
          }
        }
      }
    });
  };

  const handleExport = () => {
    const filters = {
      dateFrom: startDate,
      dateTo: endDate,
      groupBy: groupBy
    };

    simulateAPICall('/api/reports/sales/export', filters).then((res) => {
      if (res.success) {
        const link = document.createElement('a');
        link.href = res.data.downloadUrl || '#';
        link.download = `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };

  return (
    <div className="reports-container">
      <h1>Sales Reports</h1>
      <div className="report-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Date Range</label>
            <select value={dateRange} onChange={e => handleDateRangeChange(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {showCustomDates && (
            <div className="filter-group custom-dates">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <span>to</span>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          )}

          <div className="filter-group">
            <label>Group By</label>
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)}>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>

          <button className="btn-primary" onClick={() => loadSalesData()}>Apply</button>
          <button className="btn-secondary" onClick={handleExport}>Export</button>
        </div>
      </div>

      <div className="report-charts">
        <div className="chart-container">
          <canvas ref={salesChartRef}></canvas>
        </div>
        <div className="chart-container">
          <canvas ref={productChartRef}></canvas>
        </div>
      </div>

      <div className="report-data">
        <h2>Detailed Data</h2>
        <table id="salesDataTable">
          <thead>
            <tr>
              <th>Period</th>
              <th>Invoices</th>
              <th>Revenue</th>
              <th>Tax</th>
              <th>Profit</th>
              <th>Avg. Invoice</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((period, index) => (
              <tr key={index}>
                <td>{period.label}</td>
                <td>{period.invoices}</td>
                <td>${period.revenue.toFixed(2)}</td>
                <td>${period.tax.toFixed(2)}</td>
                <td>${period.profit.toFixed(2)}</td>
                <td>${period.avgInvoice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReports;
