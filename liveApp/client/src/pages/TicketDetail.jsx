import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';


// Simulated API call
const simulateAPICall = (url, data = null, method = 'GET', isFormData = false) =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          id: 'TKT-2023-001',
          subject: 'Network Connectivity Issues',
          client: { name: 'Acme Corporation' },
          createdAt: '2023-05-15T14:30:00Z',
          assignedTo: { name: 'John Smith' },
          description: 'Users in accounting are having network issues in the mornings.',
          status: 'Open',
          priority: 'High',
          attachments: [
            { name: 'network-diagram.png', url: '#' },
            { name: 'error-log.txt', url: '#' }
          ],
          updates: [
            {
              author: { name: 'John Smith' },
              createdAt: '2023-05-15T15:45:00Z',
              message: 'Checked switch, found packet loss. Replaced cable.',
              attachments: []
            }
          ]
        }
      });
    }, 500);
  });

const TicketDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketId = searchParams.get('id');

  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState('open');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      navigate('/login');
      return;
    }

    if (!ticketId) {
      navigate('/tickets');
      return;
    }

    loadTicket(ticketId);
  }, [ticketId]);

  const loadTicket = async (id) => {
    const response = await simulateAPICall(`/api/tickets/${id}`);
    if (response.success) {
      setTicket(response.data);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('status', status);
    formData.append('message', message);
    Array.from(attachments).forEach(file => formData.append('attachments', file));

    const response = await simulateAPICall(`/api/tickets/${ticketId}/updates`, formData, 'POST', true);
    if (response.success) {
      alert('Update added successfully!');
      setMessage('');
      setAttachments([]);
      loadTicket(ticketId);
    } else {
      alert('Failed to add update');
    }
  };

  const openAssignModal = async () => {
    const res = await simulateAPICall('/api/users?role=technician');
    if (res.success) {
      setTechnicians(res.data || []);
      setShowAssignModal(true);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    const response = await simulateAPICall(`/api/tickets/${ticketId}/assign`, { technicianId: selectedTechnician }, 'PUT');
    if (response.success) {
      alert('Technician assigned!');
      setShowAssignModal(false);
      loadTicket(ticketId);
    }
  };

  const formatDateTime = (dt) => new Date(dt).toLocaleString();

  if (!ticket) return <p>Loading...</p>;

  return (
    <div className="ticket-detail-container">
      <div className="ticket-header">
        <h1>{ticket.subject}</h1>
        <div className="ticket-meta">
          <span className="ticket-id">#{ticket.id}</span>
          <span className={`ticket-status status-${ticket.status.toLowerCase()}`}>{ticket.status}</span>
          <span className={`ticket-priority priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
        </div>
      </div>

      <div className="ticket-info">
        <div className="info-row"><span className="info-label">Client:</span> <span>{ticket.client.name}</span></div>
        <div className="info-row"><span className="info-label">Created:</span> <span>{formatDateTime(ticket.createdAt)}</span></div>
        <div className="info-row">
          <span className="info-label">Assigned To:</span> <span>{ticket.assignedTo?.name || 'Unassigned'}</span>
          <button className="btn-secondary" onClick={openAssignModal}>Reassign</button>
        </div>
      </div>

      <div className="ticket-description">
        <h3>Description</h3>
        <p>{ticket.description}</p>
        <div className="ticket-attachments">
          <h3>Attachments</h3>
          <ul>
            {ticket.attachments.map((att, i) => (
              <li key={i}><a href={att.url} target="_blank" rel="noreferrer">{att.name}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ticket-updates">
        <h3>Updates</h3>
        <div className="updates-list">
          {ticket.updates.map((update, i) => (
            <div className="update-item" key={i}>
              <div className="update-header">
                <span className="update-author">{update.author.name}</span>
                <span className="update-date">{formatDateTime(update.createdAt)}</span>
              </div>
              <div className="update-content">
                <p>{update.message}</p>
                {update.attachments?.length > 0 && (
                  <div className="update-attachments">
                    <strong>Attachments:</strong>
                    <ul>
                      {update.attachments.map((a, j) => (
                        <li key={j}><a href={a.url} target="_blank" rel="noreferrer">{a.name}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="update-form">
          <h3>Add Update</h3>
          <form onSubmit={handleUpdateSubmit}>
            <div className="form-group">
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <textarea placeholder="Add your update..." value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Attachments</label>
              <input type="file" multiple onChange={(e) => setAttachments(e.target.files)} />
            </div>
            <button type="submit" className="btn-primary">Submit Update</button>
          </form>
        </div>
      </div>

      {showAssignModal && (
        <div className="modal" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowAssignModal(false)}>&times;</span>
            <h2>Assign Technician</h2>
            <form onSubmit={handleAssignSubmit}>
              <div className="form-group">
                <label>Select Technician</label>
                <select required value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)}>
                  <option value="">Select Technician</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary">Assign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetail;
