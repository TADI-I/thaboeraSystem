import React, { useEffect, useState } from 'react';
import './TenderManagement.css'; // Reuse existing styles

const TenderManagement = () => {
  const [tenders, setTenders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    id: '',
    title: '',
    description: '',
    deadline: '',
    status: 'open',
    assignedStaff: [],
    files: []
  });
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
    } else {
      loadTenders();
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadTenders();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, status]);

  const loadTenders = async () => {
    const response = await simulateAPICall(`/api/tenders?search=${search}&status=${status}`);
    if (response.success) setTenders(response.data);
  };

  const loadStaff = async () => {
    const response = await simulateAPICall('/api/users?role=staff');
    if (response.success) setStaffList(response.data);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files, options } = e.target;
    if (type === 'file') {
      setForm({ ...form, files: Array.from(files) });
    } else if (type === 'select-multiple') {
      const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
      setForm({ ...form, [name]: selected });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('deadline', form.deadline);
    formData.append('status', form.status);
    form.assignedStaff.forEach(staffId => formData.append('assignedStaff[]', staffId));
    form.files.forEach(file => formData.append('files', file));

    const url = form.id ? `/api/tenders/${form.id}` : '/api/tenders';
    const method = form.id ? 'PUT' : 'POST';
    const response = await simulateAPICall(url, formData, method, true);
    if (response.success) {
      alert(`Tender ${form.id ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      setForm({ id: '', title: '', description: '', deadline: '', status: 'open', assignedStaff: [], files: [] });
      loadTenders();
    } else {
      alert(response.message || 'Operation failed');
    }
  };

  const openCreateModal = () => {
    setForm({ id: '', title: '', description: '', deadline: '', status: 'open', assignedStaff: [], files: [] });
    loadStaff();
    setShowModal(true);
  };

  const handleEdit = async (id) => {
    const response = await simulateAPICall(`/api/tenders/${id}`);
    if (response.success) {
      const t = response.data;
      setForm({
        id: t.id,
        title: t.title,
        description: t.description,
        deadline: t.deadline.split('T')[0],
        status: t.status,
        assignedStaff: t.assignedStaff.map(s => s.id),
        files: []
      });
      await loadStaff();
      setShowModal(true);
    }
  };

  const formatDate = (str) => new Date(str).toLocaleString();

  return (
    <div className="tenders-container">
      <h1>Tenders</h1>
      <div className="tender-actions">
        <button className="btn-primary" onClick={openCreateModal}>Create Tender</button>
        <div className="tender-filters">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="awarded">Awarded</option>
          </select>
          <input
            type="text"
            placeholder="Search tenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <table id="tendersTable">
        <thead>
          <tr>
            <th>Tender #</th>
            <th>Title</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenders.map(t => (
            <tr key={t.id}>
              <td>{t.referenceNumber}</td>
              <td>{t.title}</td>
              <td><span className={`status-${t.status.toLowerCase()}`}>{t.status}</span></td>
              <td>{formatDate(t.deadline)}</td>
              <td>{t.assignedStaff.map(s => s.name).join(', ')}</td>
              <td className="actions">
                <button onClick={() => window.location.href = `tender-detail.html?id=${t.id}`}>View</button>
                <button onClick={() => handleEdit(t.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowModal(false)}>&times;</span>
            <h2>{form.id ? 'Edit Tender' : 'Create New Tender'}</h2>
            <form onSubmit={handleSubmit}>
              <input type="hidden" name="id" value={form.id} />
              <div className="form-group">
                <input type="text" name="title" placeholder="Tender Title" value={form.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="date" name="deadline" value={form.deadline} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleInputChange}>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="awarded">Awarded</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Assigned Staff</label>
                <select name="assignedStaff" multiple value={form.assignedStaff} onChange={handleInputChange}>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Attachments</label>
                <input type="file" name="files" multiple onChange={handleInputChange} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Tender</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenderManagement;
