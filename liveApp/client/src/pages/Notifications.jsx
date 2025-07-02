import React, { useEffect, useState } from 'react';
import './Notifications.css';

const sampleNotifications = [
  {
    id: 1,
    title: 'Low Stock Alert',
    message: 'Product "Network Cable" is below minimum stock level (5 remaining)',
    icon: 'exclamation-circle',
    type: 'alert',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 2,
    title: 'New Message from John',
    message: 'Can you check the invoice #INV-2023-001 when you get a chance?',
    icon: 'comment-alt',
    type: 'message',
    time: 'Yesterday',
    unread: true
  },
  {
    id: 3,
    title: 'Order Completed',
    message: 'Your order #ORD-2023-045 has been successfully delivered',
    icon: 'check-circle',
    type: 'success',
    time: '2 days ago',
    unread: false
  }
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      window.location.href = 'login.html';
    }
  }, []);

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const filterNotifications = (tab) => {
    if (tab === 'all') return notifications;
    if (tab === 'unread') return notifications.filter(n => n.unread);
    return notifications.filter(n => n.type === tab);
  };

  const tabs = [
    { key: 'all', icon: 'inbox' },
    { key: 'unread', icon: 'envelope' },
    { key: 'alert', icon: 'exclamation-triangle' },
    { key: 'message', icon: 'comments' }
  ];

  const filtered = filterNotifications(activeTab);

  return (
    <div className="notifications-container">
      <h1><i className="fas fa-bell"></i> Notifications</h1>

      <div className="notification-actions">
        <button onClick={markAllAsRead} className="btn-secondary">
          <i className="fas fa-check-double"></i> Mark All as Read
        </button>
        <button onClick={clearAll} className="btn-secondary">
          <i className="fas fa-trash-alt"></i> Clear All
        </button>
      </div>

      <div className="notification-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <i className={`fas fa-${tab.icon}`}></i>
            {tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}
            <span className="tab-badge">
              {tab.key === 'all'
                ? notifications.length
                : filterNotifications(tab.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="notifications-list">
        {filtered.length > 0 ? (
          filtered.map(n => (
            <div
              key={n.id}
              className={`notification-item ${n.unread ? 'unread' : ''}`}
            >
              {n.unread && <div className="unread-badge"></div>}
              <div className={`notification-icon ${n.type}`}>
                <i className={`fas fa-${n.icon}`}></i>
              </div>
              <div className="notification-content">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <span className="notification-time">
                  <i className="far fa-clock"></i> {n.time}
                </span>
              </div>
              <button
                className="notification-dismiss"
                title="Dismiss"
                onClick={() => dismissNotification(n.id)}
              >
                &times;
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <i className="far fa-bell-slash"></i>
            <p>No {activeTab} notifications found</p>
          </div>
        )}
      </div>
    </div>
  );
}
