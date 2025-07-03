import React, { useEffect, useState } from 'react';
import './profile.css';

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(storedUser);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.match('image.*') || file.size > 2 * 1024 * 1024) {
      alert('ERROR: Invalid file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const newAvatar = event.target.result;
      setUser((prev) => ({ ...prev, avatar: newAvatar }));
      simulateAPICall('/api/users/avatar', { image: newAvatar }, 'POST').then((res) => {
        if (res.success) {
          alert('SUCCESS: Profile image updated');
          const updatedUser = { ...user, avatar: res.data.avatarUrl };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!user.name || !user.email || !validateEmail(user.email)) {
      alert('ERROR: Invalid name or email');
      return;
    }
    simulateAPICall('/api/users/profile', user, 'PUT').then((res) => {
      if (res.success) {
        alert('SUCCESS: Profile updated');
        localStorage.setItem('user', JSON.stringify(user));
      }
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const currentPassword = e.target.currentPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('ERROR: Fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('ERROR: Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      alert('ERROR: Password too short');
      return;
    }

    simulateAPICall('/api/users/password', { currentPassword, newPassword }, 'PUT').then((res) => {
      if (res.success) {
        alert('SUCCESS: Password updated');
        setNewPassword('');
        setPasswordStrength(0);
        e.target.reset();
      } else {
        alert('ERROR: Password change failed');
      }
    });
  };

  const handleNewPasswordInput = (value) => {
    setNewPassword(value);
    let strength = 0;
    if (value.length >= 8) strength++;
    if (value.length >= 12) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^a-zA-Z0-9]/.test(value)) strength++;
    setPasswordStrength((strength / 6) * 100);
  };

  const togglePassword = (e) => {
    const input = e.target.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    e.target.classList.toggle('fa-eye');
    e.target.classList.toggle('fa-eye-slash');
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          <img
            id="profileImage"
            src={user.avatar || 'default-avatar.jpg'}
            alt="Profile"
          />
          <button id="changeImageBtn" onClick={() => document.getElementById('imageUpload').click()}>
            <i className="fas fa-camera"></i>
          </button>
          <input type="file" id="imageUpload" accept="image/*" onChange={handleImageChange} />
        </div>
        <h1>{user.name || 'John Doe'}</h1>
        <p>{user.email || 'john@example.com'}</p>
      </div>

      <div className="profile-details">
        <h2><i className="fas fa-user-circle"></i> Account Information</h2>
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={user.phone || ''}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-primary">
            <i className="fas fa-save"></i> Update Profile
          </button>
        </form>

        <h2><i className="fas fa-lock"></i> Change Password</h2>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="password-wrapper">
              <input type="password" name="currentPassword" required />
              <i className="fas fa-eye toggle-password" onClick={togglePassword}></i>
            </div>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <div className="password-wrapper">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => handleNewPasswordInput(e.target.value)}
                required
              />
              <i className="fas fa-eye toggle-password" onClick={togglePassword}></i>
            </div>
            <div className="password-strength">
              <div
                className="password-strength-bar"
                style={{ width: `${passwordStrength}%`, backgroundColor: passwordStrength < 40 ? 'var(--danger)' : passwordStrength < 70 ? 'var(--warning)' : 'var(--success)' }}
              ></div>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="password-wrapper">
              <input type="password" name="confirmPassword" required />
              <i className="fas fa-eye toggle-password" onClick={togglePassword}></i>
            </div>
          </div>
          <button type="submit" className="btn-primary">
            <i className="fas fa-key"></i> Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function simulateAPICall(url, data = {}, method = 'GET') {
  console.log(`API Call: ${method} ${url}`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === '/api/users/profile' && method === 'PUT') {
        resolve({ success: true });
      } else if (url === '/api/users/password' && method === 'PUT') {
        resolve({ success: Math.random() > 0.2 });
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

export default ProfilePage;
