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

//regpage

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    
    // Validation
    if (!fullName || !email || !role || !password) {
      showAlert('Please fill in all fields', 'error');
      return;
    }
    
    if (password.length < 8) {
      showAlert('Password must be at least 8 characters', 'error');
      return;
    }
    
    // Simulate API call
    simulateAPICall('/api/register', { fullName, email, role, password })
      .then(response => {
        if (response.success) {
          showAlert('User created successfully!', 'success');
          registerForm.reset();
        } else {
          showAlert(response.message || 'Registration failed', 'error');
        }
      })
      .catch(error => {
        showAlert('An error occurred during registration', 'error');
        console.error('Registration error:', error);
      });
  });
  
  // Reuse showAlert and simulateAPICall functions from login.js
});


// frogot passs

document.addEventListener('DOMContentLoaded', function() {
  const resetRequestForm = document.getElementById('resetRequestForm');
  const resetForm = document.getElementById('resetForm');
  const resetFormSubmit = resetForm.querySelector('form');
  
  // Check if we have a reset token in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  
  if (resetToken) {
    resetRequestForm.style.display = 'none';
    resetForm.style.display = 'block';
  }
  
  resetRequestForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    if (!email) {
      showAlert('Please enter your email', 'error');
      return;
    }
    
    simulateAPICall('/api/password/reset-request', { email })
      .then(response => {
        if (response.success) {
          showAlert('Password reset link sent to your email', 'success');
        } else {
          showAlert(response.message || 'Failed to send reset link', 'error');
        }
      })
      .catch(error => {
        showAlert('An error occurred', 'error');
        console.error('Reset request error:', error);
      });
  });
  
  resetFormSubmit.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showAlert('Password must be at least 8 characters', 'error');
      return;
    }
    
    simulateAPICall('/api/password/reset', { token: resetToken, newPassword })
      .then(response => {
        if (response.success) {
          showAlert('Password updated successfully! You can now login with your new password.', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 3000);
        } else {
          showAlert(response.message || 'Password reset failed', 'error');
        }
      })
      .catch(error => {
        showAlert('An error occurred', 'error');
        console.error('Reset error:', error);
      });
  });
});
