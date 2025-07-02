import React, { useEffect, useState } from 'react';
import './UserManagement.css';

const simulateAPICall = (url, data = {}, method = 'GET') => {
  // Replace with real API
  return new Promise((resolve) => {
    setTimeout(() => {
      if (method === 'GET' && url.includes('/api/users')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const searchTerm = url.split('search=')[1];
        const filtered = users.filter(u => u.name.toLowerCase().includes(searchTerm?.toLowerCase() || ''));
        resolve({ success: true, data: filtered });
      } else if (method === 'GET') {
        const user = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === url.split('/').pop());
        resolve({ success: true, data: user });
      } else if (method === 'POST') {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = { id: Date.now().toString(), ...data };
        localStorage.setItem('users', JSON.stringify([...users, newUser]));
        resolve({ success: true });
      } else if (method === 'PUT') {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const id = url.split('/').pop();
        users = users.map(u => u.id === id ? { ...u, ...data } : u);
        localStorage.setItem('users', JSON.stringify(users));
        resolve({ success: true });
      } else if (method === 'DELETE') {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const id = url.split('/').pop();
        users = users.filter(u => u.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        resolve({ success: true });
      }
    }, 500);
  });
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ id: '', name: '', email: '', role: 'admin', password: '' });
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      window.location.href = 'dashboard.html';
    } else {
      loadUsers();
    }
  }, []);

  const loadUsers = (term = '') => {
    simulateAPICall(`/api/users?search=${term}`).then(res => {
      if (res.success) setUsers(res.data);
    });
  };

  const handleSearch = e => {
    setSearchTerm(e.target.value);
    debounce(() => loadUsers(e.target.value), 300)();
  };

  const handleEdit = id => {
    simulateAPICall(`/api/users/${id}`).then(res => {
      if (res.success) {
        setFormData({ ...res.data, password: '' });
        setModalVisible(true);
      }
    });
  };

  const handleDelete = id => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      simulateAPICall(`/api/users/${id}`, {}, 'DELETE').then(res => {
        if (res.success) {
          loadUsers(searchTerm);
          showAlert('User deleted successfully!', 'success');
        }
      });
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `/api/users/${formData.id}` : '/api/users';

    const payload = { name: formData.name, email: formData.email, role: formData.role };
    if (formData.password) payload.password = formData.password;

    simulateAPICall(url, payload, method).then(res => {
      if (res.success) {
        loadUsers();
        setModalVisible(false);
        showAlert(`User ${formData.id ? 'updated' : 'created'} successfully!`, 'success');
        setFormData({ id: '', name: '', email: '', role: 'admin', password: '' });
      } else {
        showAlert('Operation failed', 'error');
      }
    });
  };

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const debounce = (func, wait) => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  return (
    <div className="management-container">
      <h1>User Management</h1>

      {alert && <div className={`alert ${alert.type}`}>{alert.message}</div>}

      <div className="table-actions">
        <button className="btn-primary" onClick={() => {
          setFormData({ id: '', name: '', email: '', role: 'admin', password: '' });
          setModalVisible(true);
        }}>Add New User</button>
        <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search users..." />
      </div>

      <table id="usersTable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td className="actions">
                <button onClick={() => handleEdit(user.id)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setModalVisible(false)}>&times;</span>
            <h2>{formData.id ? 'Edit User' : 'Add New User'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="hidden" value={formData.id} />
              <div className="form-group">
                <input type="text" placeholder="Full Name" required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Email" required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="form-group">
                <select value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="technician">Technician</option>
                </select>
              </div>
              <div className="form-group">
                <input type="password" placeholder="Password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
