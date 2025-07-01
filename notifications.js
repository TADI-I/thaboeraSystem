
    document.addEventListener('DOMContentLoaded', function() {
      // Check authentication
      if (!localStorage.getItem('authToken')) {
        window.location.href = 'login.html';
        return;
      }
      
      // DOM elements
      const markAllReadBtn = document.getElementById('markAllRead');
      const clearAllBtn = document.getElementById('clearAll');
      const tabBtns = document.querySelectorAll('.tab-btn');
      const notificationItems = document.querySelectorAll('.notification-item');
      const dismissBtns = document.querySelectorAll('.notification-dismiss');
      
      // Tab switching
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          filterNotifications(btn.dataset.tab);
        });
      });
      
      // Mark all as read
      markAllReadBtn.addEventListener('click', () => {
        document.querySelectorAll('.notification-item.unread').forEach(item => {
          item.classList.remove('unread');
          item.querySelector('.unread-badge')?.remove();
        });
        updateUnreadCounts();
        showAlert('All notifications marked as read', 'success');
      });
      
      // Clear all notifications
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all notifications?')) {
          document.querySelector('.notifications-list').innerHTML = `
            <div class="empty-state">
              <i class="far fa-bell-slash"></i>
              <p>No notifications found</p>
            </div>
          `;
          updateUnreadCounts();
          showAlert('All notifications cleared', 'success');
        }
      });
      
      // Dismiss individual notifications
      dismissBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          this.closest('.notification-item').remove();
          updateUnreadCounts();
          
          // Show empty state if no notifications left
          if (document.querySelectorAll('.notification-item').length === 0) {
            document.querySelector('.notifications-list').innerHTML = `
              <div class="empty-state">
                <i class="far fa-bell-slash"></i>
                <p>No notifications found</p>
              </div>
            `;
          }
        });
      });
      
      // Filter notifications by tab
      function filterNotifications(filter) {
        const notifications = document.querySelectorAll('.notification-item');
        
        notifications.forEach(notification => {
          notification.style.display = 'flex';
          
          if (filter === 'unread' && !notification.classList.contains('unread')) {
            notification.style.display = 'none';
          } else if (filter === 'alerts' && 
                     !notification.querySelector('.notification-icon.alert, .notification-icon.warning')) {
            notification.style.display = 'none';
          } else if (filter === 'messages' && 
                     !notification.querySelector('.notification-icon.message')) {
            notification.style.display = 'none';
          }
        });
        
        // Show empty state if no matches
        const visibleNotifications = document.querySelectorAll('.notification-item[style="display: flex;"]');
        const emptyState = document.querySelector('.empty-state');
        
        if (visibleNotifications.length === 0) {
          if (!emptyState) {
            document.querySelector('.notifications-list').innerHTML += `
              <div class="empty-state">
                <i class="far fa-bell-slash"></i>
                <p>No ${filter} notifications found</p>
              </div>
            `;
          } else {
            emptyState.style.display = 'block';
            emptyState.querySelector('p').textContent = `No ${filter} notifications found`;
          }
        } else if (emptyState) {
          emptyState.style.display = 'none';
        }
      }
      
      // Update unread counts in tabs
      function updateUnreadCounts() {
        const unreadCount = document.querySelectorAll('.notification-item.unread').length;
        const alertCount = document.querySelectorAll('.notification-icon.alert, .notification-icon.warning').length;
        const messageCount = document.querySelectorAll('.notification-icon.message').length;
        
        document.querySelector('[data-tab="unread"] .tab-badge').textContent = unreadCount;
        document.querySelector('[data-tab="alerts"] .tab-badge').textContent = alertCount;
        document.querySelector('[data-tab="messages"] .tab-badge').textContent = messageCount;
      }
      
      // Show alert message
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      // Initialize
      updateUnreadCounts();
      
      // Simulate real-time updates (demo only)
      setInterval(() => {
        // In a real app, this would check for new notifications from your API
        if (Math.random() > 0.9) { // 10% chance of new notification for demo
          const types = ['alert', 'message', 'success', 'warning'];
          const icons = {
            alert: 'fa-exclamation-circle',
            message: 'fa-comment-alt',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle'
          };
          const type = types[Math.floor(Math.random() * types.length)];
          const titles = [
            'New Alert',
            'System Notification',
            'New Message',
            'Order Update',
            'Payment Reminder'
          ];
          const messages = [
            'Critical system update required',
            'Your subscription will renew soon',
            'You have a new message from support',
            'Your order has been shipped',
            'Invoice payment received'
          ];
          
          const emptyState = document.querySelector('.empty-state');
          if (emptyState) emptyState.remove();
          
          const notification = document.createElement('div');
          notification.className = 'notification-item unread';
          notification.innerHTML = `
            <div class="unread-badge"></div>
            <div class="notification-icon ${type}">
              <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
              <h3>${titles[Math.floor(Math.random() * titles.length)]}</h3>
              <p>${messages[Math.floor(Math.random() * messages.length)]}</p>
              <span class="notification-time"><i class="far fa-clock"></i> Just now</span>
            </div>
            <button class="notification-dismiss" title="Dismiss">&times;</button>
          `;
          
          document.querySelector('.notifications-list').prepend(notification);
          notification.querySelector('.notification-dismiss').addEventListener('click', function() {
            this.closest('.notification-item').remove();
            updateUnreadCounts();
          });
          
          updateUnreadCounts();
          
          // Only show alert if user is on the All tab
          if (document.querySelector('.tab-btn.active').dataset.tab === 'all') {
            showAlert('New notification received', 'info');
          }
        }
      }, 10000); // Check every 10 seconds
    });
