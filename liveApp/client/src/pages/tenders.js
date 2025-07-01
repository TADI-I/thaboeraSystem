document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const tendersTable = document.getElementById('tendersTable').querySelector('tbody');
  const createTenderBtn = document.getElementById('createTenderBtn');
  const statusFilter = document.getElementById('statusFilter');
  const tenderSearch = document.getElementById('tenderSearch');
  const tenderModal = document.getElementById('tenderModal');
  const tenderForm = document.getElementById('tenderForm');
  
  // Modal close button
  document.querySelector('.close').addEventListener('click', () => {
    tenderModal.style.display = 'none';
  });
  
  // Create tender button
  createTenderBtn.addEventListener('click', () => {
    document.getElementById('tenderModalTitle').textContent = 'Create New Tender';
    tenderForm.reset();
    document.getElementById('tenderId').value = '';
    loadStaffForAssignment();
    tenderModal.style.display = 'block';
  });
  
  // Tender form submission
  tenderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tenderId = document.getElementById('tenderId').value;
    const formData = new FormData();
    
    formData.append('title', document.getElementById('tenderTitle').value);
    formData.append('description', document.getElementById('tenderDescription').value);
    formData.append('deadline', document.getElementById('tenderDeadline').value);
    formData.append('status', document.getElementById('tenderStatus').value);
    
    const assignedStaff = Array.from(document.getElementById('assignedStaff').selectedOptions).map(option => option.value);
    assignedStaff.forEach(staffId => {
      formData.append('assignedStaff[]', staffId);
    });
    
    const files = document.getElementById('tenderFiles').files;
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    const url = tenderId ? `/api/tenders/${tenderId}` : '/api/tenders';
    const method = tenderId ? 'PUT' : 'POST';
    
    simulateAPICall(url, formData, method, true)
      .then(response => {
        if (response.success) {
          showAlert(`Tender ${tenderId ? 'updated' : 'created'} successfully!`, 'success');
          tenderModal.style.display = 'none';
          loadTenders();
        } else {
          showAlert(response.message || 'Operation failed', 'error');
        }
      });
  });
  
  // Search and filter
  tenderSearch.addEventListener('input', debounce(() => {
    loadTenders(tenderSearch.value, statusFilter.value);
  }, 300));
  
  statusFilter.addEventListener('change', () => {
    loadTenders(tenderSearch.value, statusFilter.value);
  });
  
  // Load initial tenders
  loadTenders();
  
  function loadTenders(searchTerm = '', status = '') {
    simulateAPICall(`/api/tenders?search=${searchTerm}&status=${status}`)
      .then(response => {
        if (response.success) {
          renderTenders(response.data);
        }
      });
  }
  
  function loadStaffForAssignment() {
    simulateAPICall('/api/users?role=staff')
      .then(response => {
        if (response.success) {
          const staffSelect = document.getElementById('assignedStaff');
          staffSelect.innerHTML = '';
          
          response.data.forEach(staff => {
            const option = document.createElement('option');
            option.value = staff.id;
            option.textContent = staff.name;
            staffSelect.appendChild(option);
          });
        }
      });
  }
  
  function renderTenders(tenders) {
    tendersTable.innerHTML = '';
    
    tenders.forEach(tender => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tender.referenceNumber}</td>
        <td>${tender.title}</td>
        <td><span class="status-${tender.status.toLowerCase()}">${tender.status}</span></td>
        <td>${formatDateTime(tender.deadline)}</td>
        <td>${tender.assignedStaff.map(staff => staff.name).join(', ')}</td>
        <td class="actions">
          <button class="btn-view" data-id="${tender.id}">View</button>
          <button class="btn-edit" data-id="${tender.id}">Edit</button>
        </td>
      `;
      tendersTable.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => viewTender(btn.dataset.id));
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => editTender(btn.dataset.id));
    });
  }
  
  function viewTender(tenderId) {
    window.location.href = `tender-detail.html?id=${tenderId}`;
  }
  
  function editTender(tenderId) {
    simulateAPICall(`/api/tenders/${tenderId}`)
      .then(response => {
        if (response.success) {
          const tender = response.data;
          document.getElementById('tenderModalTitle').textContent = 'Edit Tender';
          document.getElementById('tenderId').value = tender.id;
          document.getElementById('tenderTitle').value = tender.title;
          document.getElementById('tenderDescription').value = tender.description;
          document.getElementById('tenderDeadline').value = tender.deadline.split('T')[0];
          document.getElementById('tenderStatus').value = tender.status;
          
          // Load staff and select the assigned ones
          loadStaffForAssignment().then(() => {
            const staffSelect = document.getElementById('assignedStaff');
            tender.assignedStaff.forEach(staff => {
              const option = Array.from(staffSelect.options).find(opt => opt.value === staff.id);
              if (option) option.selected = true;
            });
          });
          
          tenderModal.style.display = 'block';
        }
      });
  }
  
  function formatDateTime(dateTimeString) {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  }
});
