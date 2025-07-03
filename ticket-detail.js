document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
    return;
  }
  
  // Get ticket ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get('id');
  
  if (!ticketId) {
    window.location.href = 'tickets.html';
    return;
  }
  
  // DOM elements
  const updateForm = document.getElementById('updateForm');
  const reassignBtn = document.getElementById('reassignBtn');
  
  // Load ticket data
  loadTicket(ticketId);
  
  // Reassign button
  reassignBtn.addEventListener('click', function() {
    assignTechnician(ticketId);
  });
  
  // Update form submission
  updateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('status', document.getElementById('updateStatus').value);
    formData.append('message', document.getElementById('updateText').value);
    
    const files = document.getElementById('updateAttachments').files;
    for (let i = 0; i < files.length; i++) {
      formData.append('attachments', files[i]);
    }
    
    simulateAPICall(`/api/tickets/${ticketId}/updates`, formData, 'POST', true)
      .then(response => {
        if (response.success) {
          showAlert('Update added successfully!', 'success');
          updateForm.reset();
          loadTicket(ticketId); // Refresh ticket data
        } else {
          showAlert(response.message || 'Failed to add update', 'error');
        }
      });
  });
  
  function loadTicket(ticketId) {
    simulateAPICall(`/api/tickets/${ticketId}`)
      .then(response => {
        if (response.success) {
          const ticket = response.data;
          
          // Set ticket info
          document.getElementById('ticketSubject').textContent = ticket.subject;
          document.getElementById('ticketClient').textContent = ticket.client.name;
          document.getElementById('ticketCreated').textContent = formatDateTime(ticket.createdAt);
          document.getElementById('ticketAssigned').textContent = ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned';
          document.getElementById('ticketDescription').textContent = ticket.description;
          
          // Set status class
          document.querySelector('.ticket-status').className = `ticket-status status-${ticket.status.toLowerCase()}`;
          document.querySelector('.ticket-status').textContent = ticket.status;
          
          // Set priority class
          document.querySelector('.ticket-priority').className = `ticket-priority priority-${ticket.priority.toLowerCase()}`;
          document.querySelector('.ticket-priority').textContent = ticket.priority;
          
          // Render attachments
          const attachmentList = document.getElementById('attachmentList');
          attachmentList.innerHTML = '';
          
          ticket.attachments.forEach(attachment => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${attachment.url}" target="_blank">${attachment.name}</a>`;
            attachmentList.appendChild(li);
          });
          
          // Render updates
          const updatesList = document.querySelector('.updates-list');
          updatesList.innerHTML = '';
          
          ticket.updates.forEach(update => {
            const updateItem = document.createElement('div');
            updateItem.className = 'update-item';
            updateItem.innerHTML = `
              <div class="update-header">
                <span class="update-author">${update.author.name}</span>
                <span class="update-date">${formatDateTime(update.createdAt)}</span>
              </div>
              <div class="update-content">
                <p>${update.message}</p>
                ${update.attachments.length > 0 ? `
                  <div class="update-attachments">
                    <strong>Attachments:</strong>
                    <ul>
                      ${update.attachments.map(att => `<li><a href="${att.url}" target="_blank">${att.name}</a></li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `;
            updatesList.appendChild(updateItem);
          });
        }
      });
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
            loadTicket(ticketId); // Refresh ticket data
            document.body.removeChild(assignModal);
          }
        });
    });
    
    // Close modal when clicking X
    assignModal.querySelector('.close').addEventListener('click', function() {
      document.body.removeChild(assignModal);
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
