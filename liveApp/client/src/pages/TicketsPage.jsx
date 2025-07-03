import React, { useState, useEffect } from 'react';
import './TicketsPage.css';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    client: '',
    priority: 'medium',
    description: '',
    attachments: []
  });

  useEffect(() => {
    // Fetch tickets and clients from API or local data
    // Example placeholder data
    setTickets([
      {
        id: 'TCK001',
        subject: 'Login issue',
        client: 'John Doe',
        status: 'open',
        priority: 'high',
        created: '2025-07-02',
        assignedTo: 'Agent A'
      }
    ]);
    setClients(['John Doe', 'Jane Smith']);
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    if (id === 'ticketAttachments') {
      setFormData({ ...formData, attachments: Array.from(files) });
    } else {
      setFormData({ ...formData, [id.replace('ticket', '').toLowerCase()]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    console.log('Creating ticket:', formData);
    setShowModal(false);
    setFormData({ subject: '', client: '', priority: 'medium', description: '', attachments: [] });
  };

  const filteredTickets = tickets.filter(ticket =>
    (filters.status === '' || ticket.status === filters.status) &&
    (filters.priority === '' || ticket.priority === filters.priority) &&
    (filters.search === '' || ticket.subject.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return (
    <div className="tickets-container">
      <h1>Support Tickets</h1>

      <div className="ticket-actions">
        <button className="btn-primary" onClick={() => setShowModal(true)}>Create Ticket</button>
        <div className="ticket-filters">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange}>
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <table id="ticketsTable">
        <thead>
          <tr>
            <th>Ticket #</th>
            <th>Subject</th>
            <th>Client</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Created</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.subject}</td>
              <td>{ticket.client}</td>
              <td>{ticket.status}</td>
              <td>{ticket.priority}</td>
              <td>{ticket.created}</td>
              <td>{ticket.assignedTo}</td>
              <td><button>Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>Create New Ticket</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input type="text" id="ticketSubject" placeholder="Subject" value={formData.subject} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <select id="ticketClient" value={formData.client} onChange={handleInputChange} required>
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client} value={client}>{client}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <select id="ticketPriority" value={formData.priority} onChange={handleInputChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="form-group">
                <textarea id="ticketDescription" placeholder="Describe the issue..." value={formData.description} onChange={handleInputChange} required></textarea>
              </div>
              <div className="form-group">
                <label>Attachments</label>
                <input type="file" id="ticketAttachments" onChange={handleInputChange} multiple />
              </div>
              <button type="submit" className="btn-primary">Create Ticket</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsPage;
