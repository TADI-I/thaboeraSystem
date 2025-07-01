document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Load user data
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Populate profile
  if (user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
    
    if (user.avatar) {
      document.getElementById('profileImage').src = user.avatar;
    }
  }
  
  // Profile image upload
  document.getElementById('changeImageBtn').addEventListener('click', () => {
    document.getElementById('imageUpload').click();
  });
  
  document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById('profileImage').src = event.target.result;
        
        // Simulate upload to server
        simulateAPICall('/api/users/avatar', { image: event.target.result }, 'POST')
          .then(response => {
            if (response.success) {
              showAlert('Profile image updated successfully!', 'success');
              // Update user in local storage
              const user = JSON.parse(localStorage.getItem('user'));
              user.avatar = response.data.avatarUrl;
              localStorage.setItem('user', JSON.stringify(user));
            }
          });
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Profile form submission
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    
    simulateAPICall('/api/users/profile', { name, email }, 'PUT')
      .then(response => {
        if (response.success) {
          showAlert('Profile updated successfully!', 'success');
          // Update user in local storage
          const user = JSON.parse(localStorage.getItem('user'));
          user.name = name;
          user.email = email;
          localStorage.setItem('user', JSON.stringify(user));
          
          // Update profile display
          document.getElementById('profileName').textContent = name;
          document.getElementById('profileEmail').textContent = email;
        }
      });
  });
  
  // Password form submission
  document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showAlert('Password must be at least 8 characters', 'error');
      return;
    }
    
    simulateAPICall('/api/users/password', { currentPassword, newPassword }, 'PUT')
      .then(response => {
        if (response.success) {
          showAlert('Password changed successfully!', 'success');
          document.getElementById('passwordForm').reset();
        } else {
          showAlert(response.message || 'Password change failed', 'error');
        }
      });
  });
});
