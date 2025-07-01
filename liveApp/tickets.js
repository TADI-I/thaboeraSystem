document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // DOM elements
  const ticketsTable = document.getElementById('ticketsTable').querySelector('tbody');
  const createTicketBtn = document.getElementById('createTicketBtn');
  const statusFilter = document.getElementById('statusFilter');
  const priorityFilter = document.getElementById('priorityFilter');
  const ticketSearch = document.getElementById('ticketSearch');
  const ticketModal = document.getElementById('ticketModal');
  const ticketForm = document.getElementById('ticketForm');
  
  // Modal close button
  document.querySelector('.close').addEventListener('click', () => {
    ticketModal.style.display = 'none';
  });
  
  // Create ticket button
  createTicketBtn.addEventListener('click', () => {
    ticketForm.reset();
    loadClientsForTicket();
    ticketModal.style.display = 'block';
  });
  
  // Ticket form submission
  ticketForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('subject', document.getElementById('ticketSubject').value);
    formData.append('clientId', document.getElementById('ticketClient').value);
    formData.append('priority', document.getElementById('ticketPriority').value);
    formData.append('description', document.getElementById('ticketDescription').value);
    
    const files = document.getElementById('ticketAttachments').files;
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i]);
    }
    
    simulateAPICall('/api/tickets', formData, 'POST', true)
      .then(response => {
        if (response.success) {
          showAlert('Ticket created successfully!', 'success');
          ticketModal.style.display = 'none';
          loadTickets();
        } else {
          showAlert(response.message || 'Failed to create ticket', 'error');
        }
      });
  });
  
  // Search and filter
  ticketSearch.addEventListener('input', debounce(() => {
    loadTickets(ticketSearch.value, statusFilter.value, priorityFilter.value);
  }, 300));
  
  statusFilter.addEventListener('change', () => {
    loadTickets(ticketSearch.value, statusFilter.value, priorityFilter.value);
  });
  
  priorityFilter.addEventListener('change', () => {
    loadTickets(ticketSearch.value, statusFilter.value, priorityFilter.value);
  });
  
  // Load initial tickets
  loadTickets();
  
  function loadTickets(searchTerm = '', status = '', priority = '') {
    simulateAPICall(`/api/tickets?search=${searchTerm}&status=${status}&priority=${priority}`)
      .then(response => {
        if (response.success) {
          renderTickets(response.data);
        }
      });
  }
  
  function loadClientsForTicket() {
    simulateAPICall('/api/clients')
      .then(response => {
        if (response.success) {
          const clientSelect = document.getElementById('ticketClient');
          clientSelect.innerHTML = '<option value="">Select Client</option>';
          
          response.data.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
          });
        }
      });
  }
  
  function renderTickets(tickets) {
    ticketsTable.innerHTML = '';
    
    tickets.forEach(ticket => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${ticket.id}</td>
        <td>${ticket.subject}</td>
        <td>${ticket.client.name}</td>
        <td><span class="status-${ticket.status.toLowerCase()}">${ticket.status}</span></td>
        <td><span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
        <td>${formatDate(ticket.createdAt)}</td>
        <td>${ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</td>
        <td class="actions">
          <button class="btn-view" data-id="${ticket.id}">View</button>
          ${!ticket.assignedTo ? `<button class="btn-assign" data-id="${ticket.id}">Assign</button>` : ''}
        </td>
      `;
      ticketsTable.appendChild(tr);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => viewTicket(btn.dataset.id));
    });
    
    // Add event listeners to assign buttons
    document.querySelectorAll('.btn-assign').forEach(btn => {
      btn.addEventListener('click', () => assignTechnician(btn.dataset.id));
    });
  }
  
  function viewTicket(ticketId) {
    window.location.href = `ticket-detail.html?id=${ticketId}`;
  }
  
  function assignTechnician(ticketId) {
    const assignModal = document.createElement('div');
    assignModal.className = 'modal';
    assignModal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Assign Technician</h2>
        <form id="assignForm">
          <div class="form-group">
            <label>Select Technician</label>
            <select id="technicianSelect" required>
              <option value="">Select Technician</option>
            </select>
          </div>
          <button type="submit" class="btn-primary">Assign</button>
        </form>
      </div>
    `;
    
    document.body.appendChild(assignModal);
    
    // Load technicians
    simulateAPICall('/api/users?role=technician')
      .then(response => {
        if (response.success) {
          const select = assignModal.querySelector('#technicianSelect');
          response.data.forEach(tech => {
            const option = document.createElement('option');
            option.value = tech.id;
            option.textContent = tech.name;
            select.appendChild(option);
          });
        }
      });
    
    // Form submission
    assignModal.querySelector('#assignForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const technicianId = assignModal.querySelector('#technicianSelect').value;
      
      simulateAPICall(`/api/tickets/${ticketId}/assign`, { technicianId }, 'PUT')
        .then(response => {
          if (response.success) {
            showAlert('Technician assigned successfully!', 'success');
            loadTickets();
            document.body.removeChild(assignModal);
          }
        });
    });
    
    // Close modal when clicking X
    assignModal.querySelector('.close').addEventListener('click', function() {
      document.body.removeChild(assignModal);
    });
  }
  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
});
