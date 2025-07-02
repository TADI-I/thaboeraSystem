import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('id');
  const isEditMode = Boolean(invoiceId);

  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoice, setInvoice] = useState({
    clientId: '',
    number: '',
    date: '',
    dueDate: '',
    items: [],
    discount: 0,
    notes: '',
    terms: ''
  });
  const [totals, setTotals] = useState({ subtotal: 0, tax: 0, grand: 0 });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return navigate('/login');

    loadClients();
    loadProducts();
    initializeDates();

    if (isEditMode) loadInvoiceData(invoiceId);
    else generateInvoiceNumber();
  }, []);

  useEffect(() => {
    updateTotals();
  }, [invoice.items, invoice.discount]);

  const loadClients = async () => {
    const res = await simulateAPICall('/api/clients');
    if (res.success) setClients(res.data);
  };

  const loadProducts = async () => {
    const res = await simulateAPICall('/api/products');
    if (res.success) setProducts(res.data);
  };

  const initializeDates = () => {
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);
    setInvoice(prev => ({
      ...prev,
      date: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0]
    }));
  };

  const generateInvoiceNumber = () => {
    const prefix = 'INV-';
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    setInvoice(prev => ({ ...prev, number: `${prefix}${randomNum}` }));
  };

  const loadInvoiceData = async id => {
    const res = await simulateAPICall(`/api/invoices/${id}`);
    if (res.success) {
      const inv = res.data;
      setInvoice({
        clientId: inv.client.id,
        number: inv.number,
        date: inv.date.split('T')[0],
        dueDate: inv.dueDate.split('T')[0],
        items: inv.items.map(item => ({
          productId: item.product.id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
          taxRate: item.taxRate
        })),
        discount: inv.discount,
        notes: inv.notes,
        terms: inv.terms
      });
    }
  };

  const updateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    invoice.items.forEach(item => {
      const itemTotal = item.quantity * item.price;
      const itemTax = itemTotal * (item.taxRate / 100);
      subtotal += itemTotal;
      tax += itemTax;
    });
    const grand = subtotal + tax - invoice.discount;
    setTotals({ subtotal, tax, grand });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = field === 'quantity' || field === 'price' || field === 'taxRate' ? parseFloat(value) || 0 : value;
    setInvoice({ ...invoice, items: newItems });
  };

  const handleAddItem = () => {
    setInvoice({
      ...invoice,
      items: [...invoice.items, { productId: '', description: '', quantity: 1, price: 0, taxRate: 0 }]
    });
  };

  const handleRemoveItem = index => {
    const newItems = [...invoice.items];
    newItems.splice(index, 1);
    setInvoice({ ...invoice, items: newItems });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setInvoice({ ...invoice, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleSave();
  };

  const handleSave = async (preview = false, send = false, download = false) => {
    if (!invoice.clientId || invoice.items.length === 0) {
      alert('Please complete the form.');
      return;
    }

    const method = isEditMode ? 'PUT' : 'POST';
    const url = isEditMode ? `/api/invoices/${invoiceId}` : '/api/invoices';
    const res = await simulateAPICall(url, invoice, method);

    if (res.success) {
      const savedId = res.data.id;
      if (preview) window.open(`/invoice-preview.html?id=${savedId}`, '_blank');
      else if (send) await simulateAPICall(`/api/invoices/${savedId}/send`, {}, 'POST');
      else if (download) window.open(`/api/invoices/${savedId}/pdf`, '_blank');
      else navigate(`/create-invoice?id=${savedId}`);
    } else {
      alert('Error saving invoice.');
    }
  };

  return (
    <div className="document-creation-container">
      <div className="header-actions">
        <h1>{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <button className="btn-secondary" onClick={() => navigate('/invoices')}>Back to Invoices</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Client</label>
            <select name="clientId" value={invoice.clientId} onChange={handleChange} required>
              <option value="">Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Invoice #</label>
            <input type="text" value={invoice.number} readOnly />
          </div>
          <div className="form-group">
            <label>Invoice Date</label>
            <input type="date" name="date" value={invoice.date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" name="dueDate" value={invoice.dueDate} onChange={handleChange} required />
          </div>
        </div>

        <div className="invoice-items">
          <h3>Items</h3>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <select
                        value={item.productId}
                        onChange={e => {
                          const product = products.find(p => p.id === parseInt(e.target.value));
                          handleItemChange(i, 'productId', e.target.value);
                          if (product) {
                            handleItemChange(i, 'price', product.price);
                            handleItemChange(i, 'description', product.description);
                          }
                        }}
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                      </select>
                    </td>
                    <td><input value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} /></td>
                    <td><input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} /></td>
                    <td><input type="number" step="0.01" value={item.price} onChange={e => handleItemChange(i, 'price', e.target.value)} /></td>
                    <td>
                      <select value={item.taxRate} onChange={e => handleItemChange(i, 'taxRate', e.target.value)}>
                        <option value="0">0%</option>
                        <option value="10">10%</option>
                        <option value="20">20%</option>
                      </select>
                    </td>
                    <td>{(item.quantity * item.price).toFixed(2)}</td>
                    <td><button type="button" className="btn-remove-item" onClick={() => handleRemoveItem(i)}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary" onClick={handleAddItem}>Add Item</button>
        </div>

        <div className="invoice-totals">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <label htmlFor="discount">Discount</label>
            <input type="number" name="discount" value={invoice.discount} onChange={handleChange} />
            <span>{invoice.discount.toFixed(2)}</span>
          </div>
          <div className="totals-row">
            <span>Tax:</span>
            <span>{totals.tax.toFixed(2)}</span>
          </div>
          <div className="totals-row grand-total">
            <span>Total:</span>
            <span>{totals.grand.toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea name="notes" value={invoice.notes} onChange={handleChange}></textarea>
        </div>

        <div className="form-group">
          <label>Terms & Conditions</label>
          <textarea name="terms" value={invoice.terms} onChange={handleChange}></textarea>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">Save Invoice</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(true)}>Preview</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(false, true)}>Send to Client</button>
          <button type="button" className="btn-secondary" onClick={() => handleSave(false, false, true)}>Download PDF</button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;

// Replace this with real API fetch later
function simulateAPICall(url, data = {}, method = 'GET') {
  console.log(`API Call: ${method} ${url}`, data);
  if (url === '/api/clients') {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Acme Corp' },
        { id: 2, name: 'Globex Corporation' },
        { id: 3, name: 'Soylent Corp' }
      ]
    });
  }
  if (url === '/api/products') {
    return Promise.resolve({
      success: true,
      data: [
        { id: 1, name: 'Web Design', price: 1000, description: 'Custom website design' },
        { id: 2, name: 'Development', price: 150, description: 'Hourly development work' },
        { id: 3, name: 'Consulting', price: 200, description: 'Business consulting' }
      ]
    });
  }
  if (url.startsWith('/api/invoices/') && method === 'GET') {
    return Promise.resolve({
      success: true,
      data: {
        id: url.split('/').pop(),
        number: `INV-${url.split('/').pop().padStart(6, '0')}`,
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        client: { id: 1, name: 'Acme Corp' },
        items: [
          { product: { id: 1, name: 'Web Design' }, description: 'Custom website design', quantity: 1, price: 1000, taxRate: 20 }
        ],
        discount: 0,
        notes: '',
        terms: 'Payment due within 30 days'
      }
    });
  }
  return Promise.resolve({ success: true, data: { id: 999, ...data } });
}
