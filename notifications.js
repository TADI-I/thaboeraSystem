document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const notificationsList = document.querySelector('.notifications-list');
  const markAllRead = document.getElementById('markAllRead');
  const clearAll = document.getElementById('clearAll');
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Mark all as read button
  markAllRead.addEventListener('click', () => {
    simulateAPICall('/api/notifications/mark-all-read', {}, 'PUT')
      .then(response => {
        if (response.success) {
          showAlert('All notifications marked as read', 'success');
          loadNotifications();
        }
      });
  });
  
  // Clear all button
  clearAll.addEventListener('click', () => {
    if (confirm('Clear all notifications?')) {
      simulateAPICall('/api/notifications/clear-all', {}, 'DELETE')
        .then(response => {
          if (response.success) {
            showAlert('All notifications cleared', 'success');
            loadNotifications();
          }
        });
    }
  });
  
  // Tab buttons
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      tabButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      loadNotifications(this.dataset.tab);
    });
  });
  
  // Load initial notifications
  loadNotifications();
  
  function loadNotifications(filter = 'all') {
    simulateAPICall(`/api/notifications?filter=${filter}`)
      .then(response => {
        if (response.success) {
          renderNotifications(response.data);
        }
      });
  }
  
  function renderNotifications(notifications) {
    notificationsList.innerHTML = '';
    
    if (notifications.length === 0) {
      notificationsList.innerHTML = '<div class="no-notifications">No notifications found</div>';
      return;
    }
    
    notifications.forEach(notification => {
      const item = document.createElement('div');
      item.className = `notification-item ${notification.read ? '' : 'unread'}`;
      item.innerHTML = `
        <div class="notification-icon ${notification.type}">
          <i class="${getNotificationIcon(notification.type)}"></i>
        </div>
        <div class="notification-content">
          <h3>${notification.title}</h3>
          <p>${notification.message}</p>
          <span class="notification-time">${formatTime(notification.timestamp)}</span>
        </div>
        <button class="notification-dismiss" data-id="${notification.id}">&times;</button>
      `;
      notificationsList.appendChild(item);
      
      // Mark as read when clicked
      item.addEventListener('click', function() {
        if (!notification.read) {
          markNotificationRead(notification.id);
        }
      });
    });
    
    // Add event listeners to dismiss buttons
    document.querySelectorAll('.notification-dismiss').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dismissNotification(btn.dataset.id);
      });
    });
  }
  
  function markNotificationRead(notificationId) {
    simulateAPICall(`/api/notifications/${notificationId}/read`, {}, 'PUT')
      .then(response => {
        if (response.success) {
          // Update the UI without reloading
          const item = document.querySelector(`.notification-dismiss[data-id="${notificationId}"]`).closest('.notification-item');
          item.classList.remove('unread');
        }
      });
  }
  
  function dismissNotification(notificationId) {
    simulateAPICall(`/api/notifications/${notificationId}`, {}, 'DELETE')
      .then(response => {
        if (response.success) {
          // Remove the notification from the UI
          document.querySelector(`.notification-dismiss[data-id="${notificationId}"]`).closest('.notification-item').remove();
          
          // If no notifications left, show message
          if (document.querySelectorAll('.notification-item').length === 0) {
            notificationsList.innerHTML = '<div class="no-notifications">No notifications found</div>';
          }
        }
      });
  }
  
  function getNotificationIcon(type) {
    const icons = {
      'alert': 'icon-warning',
      'message': 'icon-message',
      'reminder': 'icon-alarm',
      'system': 'icon-cog'
    };
    return icons[type] || 'icon-bell';
  }
  
  function formatTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
    
    return date.toLocaleDateString();
  }
});
