
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
        document.getElementById('profileName').textContent = user.name || 'John Doe';
        document.getElementById('profileEmail').textContent = user.email || 'john@example.com';
        document.getElementById('fullName').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        
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
          // Validate image file
          if (!file.type.match('image.*')) {
            showAlert('Please select an image file', 'error');
            return;
          }
          
          if (file.size > 2 * 1024 * 1024) { // 2MB limit
            showAlert('Image size should be less than 2MB', 'error');
            return;
          }
          
          const reader = new FileReader();
          reader.onload = function(event) {
            document.getElementById('profileImage').src = event.target.result;
            
            // Simulate upload to server
            simulateAPICall('/api/users/avatar', { image: event.target.result }, 'POST')
              .then(response => {
                if (response.success) {
                  showAlert('Profile image updated successfully!', 'success');
                  // Update user in local storage
                  const user = JSON.parse(localStorage.getItem('user') || {});
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
        
        const name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        if (!name || !email) {
          showAlert('Name and email are required', 'error');
          return;
        }
        
        if (!validateEmail(email)) {
          showAlert('Please enter a valid email address', 'error');
          return;
        }
        
        simulateAPICall('/api/users/profile', { name, email, phone }, 'PUT')
          .then(response => {
            if (response.success) {
              showAlert('Profile updated successfully!', 'success');
              // Update user in local storage
              const user = JSON.parse(localStorage.getItem('user') || {});
              user.name = name;
              user.email = email;
              user.phone = phone;
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
        
        if (!currentPassword || !newPassword || !confirmPassword) {
          showAlert('All password fields are required', 'error');
          return;
        }
        
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
              document.getElementById('passwordStrengthBar').style.width = '0%';
            } else {
              showAlert(response.message || 'Password change failed', 'error');
            }
          });
      });
      
      // Password strength meter
      document.getElementById('newPassword').addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.getElementById('passwordStrengthBar');
        let strength = 0;
        
        // Check length
        if (password.length >= 8) strength += 1;
        if (password.length >= 12) strength += 1;
        
        // Check for mixed case
        if (password.match(/[a-z]/) strength += 1;
        if (password.match(/[A-Z]/)) strength += 1;
        
        // Check for numbers and special chars
        if (password.match(/[0-9]/)) strength += 1;
        if (password.match(/[^a-zA-Z0-9]/)) strength += 1;
        
        // Update strength bar
        const width = (strength / 6) * 100;
        strengthBar.style.width = `${width}%`;
        
        // Update color
        if (width < 40) {
          strengthBar.style.backgroundColor = var(--danger);
        } else if (width < 70) {
          strengthBar.style.backgroundColor = var(--warning);
        } else {
          strengthBar.style.backgroundColor = var(--success);
        }
      });
      
      // Toggle password visibility
      document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
          const input = this.previousElementSibling;
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          this.classList.toggle('fa-eye');
          this.classList.toggle('fa-eye-slash');
        });
      });
      
      // Helper functions
      function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
      }
      
      function showAlert(message, type) {
        alert(`${type.toUpperCase()}: ${message}`);
      }
      
      function simulateAPICall(url, data = {}, method = 'GET') {
        console.log(`API Call: ${method} ${url}`, data);
        return new Promise(resolve => {
          setTimeout(() => {
            if (url === '/api/users/profile' && method === 'PUT') {
              resolve({ success: true });
            } else if (url === '/api/users/password' && method === 'PUT') {
              resolve({ success: Math.random() > 0.2 }); // 80% success rate for demo
            } else if (url === '/api/users/avatar' && method === 'POST') {
              resolve({ 
                success: true,
                data: { avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg' }
              });
            } else {
              resolve({ success: false, message: 'API error' });
            }
          }, 800);
        });
      }
    });
