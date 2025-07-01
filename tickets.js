// tickets.js
function assignTechnician(ticketId) {
  // This would typically be called when clicking an "Assign" button on a ticket
  
  const assignModal = document.createElement('div');
  assignModal.className = 'modal';
  assignModal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Assign Technician</h2>
      <form id="assignForm">
        <input type="hidden" id="ticketId" value="${ticketId}">
        <div class="form-group">
          <label>Select Technician</label>
          <select id="technicianSelect" required>
            <!-- Technicians will be populated by JS -->
          </select>
        </div>
        <button type="submit" class="btn-primary">Assign</button>
      </form>
    </div>
  `;
  
  document.body.appendChild(assignModal);
  
  // Populate technicians dropdown
  fetchTechnicians().then(technicians => {
    const select = assignModal.querySelector('#technicianSelect');
    technicians.forEach(tech => {
      const option = document.createElement('option');
      option.value = tech.id;
      option.textContent = tech.name;
      select.appendChild(option);
    });
  });
  
  // Handle form submission
  assignModal.querySelector('#assignForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const technicianId = assignModal.querySelector('#technicianSelect').value;
    
    // Here you would typically send the assignment to your backend
    console.log(`Assigning ticket ${ticketId} to technician ${technicianId}`);
    
    // Close modal after assignment
    document.body.removeChild(assignModal);
  });
  
  // Close modal when clicking X
  assignModal.querySelector('.close').addEventListener('click', function() {
    document.body.removeChild(assignModal);
  });
}

// Helper function to fetch technicians (mock)
function fetchTechnicians() {
  return Promise.resolve([
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Brown' }
  ]);
}
