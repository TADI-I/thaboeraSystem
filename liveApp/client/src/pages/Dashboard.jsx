import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import './Dashboard.css'; // We'll extract the CSS into a separate file

const Dashboard = () => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [user, setUser] = useState({
    name: 'Admin User',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  });
  const [stats, setStats] = useState({
    totalSales: 12345,
    openTickets: 8,
    newCustomers: 24,
    inventoryItems: 138
  });

  useEffect(() => {
    // Initialize charts after component mounts
    initializeCharts();
    
    // Check authentication
    if (!localStorage.getItem('authToken')) {
      window.location.href = '/login';
    }
    
    // Load user data
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (storedUser.name) setUser(storedUser);
    
    // Load stats (simulated API call)
    loadStats();
  }, []);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const initializeCharts = () => {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
      new Chart(salesCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Monthly Sales (R)',
            data: [12000, 15000, 18000, 14000, 22000, 25000],
            borderColor: '#d32f2f',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            fill: true,
            tension: 0.3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
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

    // Inventory Chart
    const inventoryCtx = document.getElementById('inventoryChart');
    if (inventoryCtx) {
      new Chart(inventoryCtx, {
        type: 'bar',
        data: {
          labels: ['Laptops', 'Desktops', 'Routers', 'Cables', 'Monitors'],
          datasets: [{
            label: 'Items in Stock',
            data: [20, 15, 35, 50, 18],
            backgroundColor: [
              'rgba(211, 47, 47, 0.7)',
              'rgba(233, 30, 99, 0.7)',
              'rgba(156, 39, 176, 0.7)',
              'rgba(63, 81, 181, 0.7)',
              'rgba(3, 169, 244, 0.7)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  const loadStats = async () => {
    // Simulate API call
    try {
      // const response = await fetch('/api/stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Toggle */}
      <button className="mobile-menu-toggle" onClick={toggleSidebar}>
        <i className="fas fa-bars"></i>
      </button>
      
      {/* Sidebar Navigation */}
      <nav className={`sidebar ${sidebarActive ? 'active' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={toggleSidebar}>
            <i className="fas fa-times"></i>
          </button>
          <div className="company-logo">IT</div>
          <h2>ThaboEra IT Solutions</h2>
        </div>
        
        <div className="sidebar-menu">
          {/* Dashboard */}
          <div className="menu-section">
            <a href="/dashboard" className="menu-item active">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </a>
          </div>
          
          {/* Authentication */}
          <div className="menu-section">
            <div className="menu-section-title">Account</div>
            <a href="/profile" className="menu-item">
              <i className="fas fa-user-circle"></i>
              <span>My Profile</span>
            </a>
            <a href="#" className="menu-item" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </a>
          </div>
          
          {/* User Management */}
          <div className="menu-section">
            <div className="menu-section-title">Management</div>
            <a href="/user-management" className="menu-item">
              <i className="fas fa-users-cog"></i>
              <span>User Management</span>
            </a>
            <a href="/company-settings" className="menu-item">
              <i className="fas fa-cog"></i>
              <span>Company Settings</span>
            </a>
          </div>
          
          {/* Inventory */}
          <div className="menu-section">
            <div className="menu-section-title">Inventory</div>
            <a href="/products" className="menu-item">
              <i className="fas fa-boxes"></i>
              <span>Products</span>
            </a>
            <a href="/suppliers" className="menu-item">
              <i className="fas fa-truck"></i>
              <span>Suppliers</span>
            </a>
            <a href="/documents" class="menu-item">
      <i class="fas fa-file-alt"></i>
      <span>Documents</span>
    </a>
          </div>
          
          {/* Sales */}
          <div className="menu-section">
            <div className="menu-section-title">Sales</div>
            <a href="/invoices" className="menu-item">
              <i className="fas fa-file-invoice-dollar"></i>
              <span>Invoices</span>
            </a>
            <a href="/create-invoice" className="menu-item">
              <i className="fas fa-plus-circle"></i>
              <span>Create Invoice</span>
            </a>
            <a href="/quotations" className="menu-item">
              <i className="fas fa-file-signature"></i>
              <span>Quotations</span>
            </a>
            <a href="/create-quotation" className="menu-item">
              <i className="fas fa-plus-circle"></i>
              <span>Create Quotation</span>
            </a>
          </div>
          
          {/* Reports */}
          <div className="menu-section">
            <div className="menu-section-title">Reports</div>
            <a href="/sales-reports" className="menu-item">
              <i className="fas fa-chart-line"></i>
              <span>Sales Reports</span>
            </a>
            <a href="/stock-reports" className="menu-item">
              <i className="fas fa-chart-pie"></i>
              <span>Stock Reports</span>
            </a>
            <a href="/audit-logs" class="menu-item">
      <i class="fas fa-clipboard-list"></i>
      <span>Logs</span>
    </a>
          </div>
        </div>
      </nav>
      
      {/* Overlay for mobile menu */}
      <div 
        className={`sidebar-overlay ${sidebarActive ? 'active' : ''}`} 
        onClick={toggleSidebar}
      ></div>

      {/* Main Dashboard */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="user-menu">
            <div className="notifications">
              <i className="fas fa-bell"></i>
              <span className="badge">3</span>
            </div>
            
            <div className="user-profile">
              <img src={user.avatar} alt="User" />
              <span>{user.name}</span>
            </div>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="content-area">
          <h1>Dashboard Overview</h1>
          
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="card">
              <h3>Total Sales</h3>
              <p>${stats.totalSales.toLocaleString()}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                12% from last month
              </div>
            </div>
            
            <div className="card">
              <h3>Open Tickets</h3>
              <p>{stats.openTickets}</p>
              <div className="trend down">
                <i className="fas fa-arrow-down"></i>
                3% from last week
              </div>
            </div>
            
            <div className="card">
              <h3>New Customers</h3>
              <p>{stats.newCustomers}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                8% from last month
              </div>
            </div>
            
            <div className="card">
              <h3>Inventory Items</h3>
              <p>{stats.inventoryItems}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i>
                5 new items
              </div>
            </div>
          </div>
          
          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-container">
              <h3>Monthly Sales</h3>
              <canvas id="salesChart"></canvas>
            </div>
            
            <div className="chart-container">
              <h3>Inventory Levels</h3>
              <canvas id="inventoryChart"></canvas>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <ul className="activity-list">
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New invoice #INV-2023-105 created</div>
                  <div className="activity-time">10 minutes ago</div>
                </div>
              </li>
              
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-user"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New user registered: John Smith</div>
                  <div className="activity-time">1 hour ago</div>
                </div>
              </li>
              
              <li className="activity-item">
                <div className="activity-icon">
                  <i className="fas fa-truck"></i>
                </div>
                <div className="activity-content">
                  <div className="activity-title">New shipment received from TechSupplies Inc.</div>
                  <div className="activity-time">3 hours ago</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;