import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const simulateAPICall = (url, data = {}, method = 'GET') => {
  console.log(`API Call: ${method} ${url}`, data);
  return new Promise(resolve => {
    setTimeout(() => {
      if (method === 'GET' && url === '/api/clients') {
        resolve({ success: true, data: [
          { id: 1, name: 'Client One' },
          { id: 2, name: 'Client Two' },
          { id: 3, name: 'Client Three' }
        ]});
      } else if (method === 'GET' && url === '/api/products') {
        resolve({ success: true, data: [
          { id: 1, name: 'Product A', price: 100 },
          { id: 2, name: 'Product B', price: 200 },
          { id: 3, name: 'Product C', price: 300 }
        ]});
      } else if (url.startsWith('/api/quotations') && method === 'POST') {
        resolve({ success: true, data: { id: Math.floor(Math.random() * 1000) + 1 }});
      } else if (url.startsWith('/api/quotations') && method === 'PUT') {
        resolve({ success: true, data: { id: parseInt(url.split('/').pop()) }});
      } else if (url.endsWith('/send') && method === 'POST') {
        resolve({ success: true });
      } else if (url.startsWith('/api/quotations/') && method === 'GET') {
        resolve({ success: true, data: {
          id: parseInt(url.split('/').pop()),
          client: { id: 1, name: 'Client One' },
          date: '2023-06-15T00:00:00Z',
          expiryDate: '2023-07-15T00:00:00Z',
          taxRate: 10,
          discount: 50,
          terms: 'Payment due within 30 days',
          notes: '',
          items: [
            { product: { id: 1, name: 'Product A', price: 100 }, description: 'Sample', quantity: 2, price: 100 }
          ]
        }});
      } else {
        resolve({ success: false, message: 'API error' });
      }
    }, 500);
  });
};

export default function QuotationForm() {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [quotation, setQuotation] = useState({
    clientId: '',
    quotationNumber: '',
    quotationDate: '',
    dueDate: '',
    taxRate: 0,
    discount: 0,
    terms: '',
    notes: '',
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const quotationId = searchParams.get('id');

  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      window.location.href = 'login.html';
      return;
    }
    simulateAPICall('/api/clients').then(res => res.success && setClients(res.data));
    simulateAPICall('/api/products').then(res => res.success && setProducts(res.data));
    if (quotationId) {
      simulateAPICall(`/api/quotations/${quotationId}`).then(res => {
        if (res.success) {
          const q = res.data;
          setQuotation({
            clientId: q.client.id,
            quotationDate: q.date.split('T')[0],
            dueDate: q.expiryDate.split('T')[0],
            taxRate: q.taxRate,
            discount: q.discount,
            terms: q.terms,
            notes: q.notes,
          });
          setItems(q.items.map(item => ({
            id: item.product.id,
            description: item.description,
            quantity: item.quantity,
            price: item.price
          })));
        }
      });
    }
  }, [quotationId]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) : value;
    setItems(updated);
  };

  const addItemRow = () => {
    setItems([...items, { id: '', description: '', quantity: 1, price: 0 }]);
  };

  const removeItemRow = index => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = (subtotal * (quotation.taxRate || 0)) / 100;
  const grandTotal = subtotal + taxAmount - (quotation.discount || 0);

  const handleSubmit = (e, preview = false, send = false) => {
    e.preventDefault();
    if (!quotation.clientId || items.length === 0) {
      alert('Please select client and add items.');
      return;
    }
    const data = {
      ...quotation,
      items: items.map(item => ({
        productId: item.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price
      }))
    };
    const url = quotationId ? `/api/quotations/${quotationId}` : '/api/quotations';
    const method = quotationId ? 'PUT' : 'POST';
    simulateAPICall(url, data, method).then(res => {
      if (res.success) {
        const id = res.data.id;
        if (preview) {
          window.open(`quotation-preview.html?id=${id}`, '_blank');
        } else if (send) {
          simulateAPICall(`/api/quotations/${id}/send`, {}, 'POST').then(() => navigate('/quotations'));
        } else {
          alert('Quotation saved successfully');
          if (!quotationId) navigate(`/create-quotation?id=${id}`);
        }
      } else alert(res.message || 'Failed to save quotation');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Client</label>
          <select value={quotation.clientId} onChange={e => setQuotation({ ...quotation, clientId: e.target.value })} required>
            <option value="">Select Client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Quotation Date</label>
          <input type="date" value={quotation.quotationDate} onChange={e => setQuotation({ ...quotation, quotationDate: e.target.value })} required />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={quotation.dueDate} onChange={e => setQuotation({ ...quotation, dueDate: e.target.value })} required />
        </div>
      </div>
      <h3>Items</h3>
      <table>
        <thead>
          <tr>
            <th>Item</th><th>Description</th><th>Qty</th><th>Price</th><th>Total</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i}>
              <td>
                <select value={item.id} onChange={e => handleItemChange(i, 'id', e.target.value)}>
                  <option value=''>Select</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </td>
              <td><input value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} /></td>
              <td><input type='number' value={item.quantity} min='1' onChange={e => handleItemChange(i, 'quantity', e.target.value)} /></td>
              <td><input type='number' value={item.price} step='0.01' onChange={e => handleItemChange(i, 'price', e.target.value)} /></td>
              <td>{(item.quantity * item.price).toFixed(2)}</td>
              <td><button type='button' onClick={() => removeItemRow(i)}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type='button' onClick={addItemRow}>Add Item</button>

      <div>
        <div>Subtotal: {subtotal.toFixed(2)}</div>
        <div>
          <label>Discount:</label>
          <input type='number' value={quotation.discount} onChange={e => setQuotation({ ...quotation, discount: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>Tax: {taxAmount.toFixed(2)}</div>
        <div>Total: {grandTotal.toFixed(2)}</div>
      </div>

      <div>
        <label>Notes</label>
        <textarea value={quotation.notes} onChange={e => setQuotation({ ...quotation, notes: e.target.value })} />
      </div>
      <div>
        <label>Terms</label>
        <textarea value={quotation.terms} onChange={e => setQuotation({ ...quotation, terms: e.target.value })} />
      </div>

      <button type="submit">Save</button>
      <button type="button" onClick={e => handleSubmit(e, true)}>Preview</button>
      <button type="button" onClick={e => handleSubmit(e, false, true)}>Send</button>
    </form>
  );
}
