document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
      showAlert('Please fill in all fields', 'error');
      return;
    }
    
    // Simulate API call
    simulateAPICall('/api/login', { email, password })
      .then(response => {
        if (response.success) {
          // Store user token and redirect
          localStorage.setItem('authToken', response.token);
          window.location.href = 'dashboard.html';
        } else {
          showAlert(response.message || 'Login failed', 'error');
        }
      })
      .catch(error => {
        showAlert('An error occurred during login', 'error');
        console.error('Login error:', error);
      });
  });
  
  function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.auth-container');
    container.insertBefore(alertDiv, loginForm);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
  
  function simulateAPICall(url, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // This is a mock response - in a real app, you'd make an actual API call
        if (data.email === 'admin@example.com' && data.password === 'admin123') {
          resolve({
            success: true,
            token: 'mock-auth-token-123456',
            user: {
              id: 1,
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'admin'
            }
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid credentials'
          });
        }
      }, 1000);
    });
  }
});
