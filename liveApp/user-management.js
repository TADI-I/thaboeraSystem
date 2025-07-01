document.addEventListener('DOMContentLoaded', function() {
  // Check authentication and admin role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.role || user.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
  }
  
  // DOM elements
  const usersTable = document.getElementById('usersTable').querySelector('tbody');
  const userModal = document.getElementById('userModal');
  const userForm = document.getElementById('userForm');
  const addUserBtn = document.getElementById('addUserBtn');
  const userSearch = document.getElementById('userSearch');
  
  // Modal close button
  document.querySelector('.close').addEventListener('click', () => {
    userModal.style.display = 'none';
  });
  
  // Add user button click
  addUserBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add New User';
    userForm.reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    userModal.style.display = 'block';
  });
  
  // User form submission
  userForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
      name: document.getElementById('userName').value,
      email: document.getElementById('userEmail').value,
      role: document.getElementById('userRole').value
    };
    
    // Only include password if it's a new user or password was changed
    const password = document.getElementById('userPassword').value;
    if (password) {
      userData.password = password;
    }
    
    const url = userId ? `/api/users/${userId}` : '/api/users';
    const method = userId ? 'PUT' : 'POST';
    
    simulateAPICall(url, userData, method)
      .then(response => {
        if (response.success) {
          loadUsers();
          userModal.style.display = 'none';
          showAlert(`User ${userId ? 'updated' : 'created'} successfully!`, 'success');
        } else {
          showAlert(response.message || 'Operation failed', 'error');
        }
      });
  });
  
  // Search functionality
  userSearch.addEventListener('input', debounce(() => {
    loadUsers(userSearch.value);
  }, 300));
  
  // Load initial users
  loadUsers();
  
  function loadUsers(searchTerm = '') {
    simulateAPICall(`/api/users?search=${searchTerm}`)
      .then(response => {
        if (response.success) {
          renderUsers(response.data);
        }
      });
  }
  
  function renderUsers(users) {
    usersTable.innerHTML = '';
    
    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${user.id}">Edit</button>
          <button class="btn-delete" data-id="${user.id}">Delete</button>
        </td>
      `;
      usersTable.appendChild(tr);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editUser(btn.dataset.id));
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
  }
  
  function editUser(userId) {
    simulateAPICall(`/api/users/${userId}`)
      .then(response => {
        if (response.success) {
          const user = response.data;
          document.getElementById('modalTitle').textContent = 'Edit User';
          document.getElementById('userId').value = user.id;
          document.getElementById('userName').value = user.name;
          document.getElementById('userEmail').value = user.email;
          document.getElementById('userRole').value = user.role;
          document.getElementById('userPassword').required = false;
          userModal.style.display = 'block';
        }
      });
  }
  
  function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
      simulateAPICall(`/api/users/${userId}`, {}, 'DELETE')
        .then(response => {
          if (response.success) {
            loadUsers();
            showAlert('User deleted successfully!', 'success');
          }
        });
    }
  }
  
  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  }
});
