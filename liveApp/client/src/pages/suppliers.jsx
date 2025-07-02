import React, { useEffect, useState, useRef } from "react";

// Helper components for icons (using FontAwesome CDN assumed loaded in HTML or you can install react-icons/fa)
const IconTruck = () => <i className="fas fa-truck" />;
const IconPlus = () => <i className="fas fa-plus" />;
const IconEdit = () => <i className="fas fa-edit" />;
const IconTrash = () => <i className="fas fa-trash-alt" />;
const IconSave = () => <i className="fas fa-save" />;

// Simple multi-select component (no external lib, basic)
function MultiSelect({ options, selected, onChange }) {
  // Handle toggling selection
  const toggleOption = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: 4,
        minHeight: 45,
        padding: 5,
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        cursor: "pointer",
      }}
      onClick={(e) => e.stopPropagation()} // Prevent modal close if used inside modal
    >
      {options.map((opt) => (
        <div
          key={opt.id}
          onClick={() => toggleOption(opt.id)}
          style={{
            padding: "3px 8px",
            borderRadius: 4,
            backgroundColor: selected.includes(opt.id) ? "#d32f2f" : "#f5f5f5",
            color: selected.includes(opt.id) ? "white" : "#333",
            userSelect: "none",
          }}
        >
          {opt.name}
        </div>
      ))}
    </div>
  );
}

export default function SupplierManagement() {
  const [authToken] = useState(localStorage.getItem("authToken"));
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Add New Supplier");
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    suppliedProducts: [],
  });
  const [alert, setAlert] = useState(null); // {type, message}

  // Ref for clicking outside modal to close it
  const modalRef = useRef(null);

  // Redirect if no auth token
  useEffect(() => {
    if (!authToken) {
      window.location.href = "login.html";
    }
  }, [authToken]);

  // Load suppliers (simulate API)
  async function loadSuppliers(search = "") {
    const res = await simulateAPICall(`/api/suppliers?search=${search}`);
    if (res.success) {
      setSuppliers(res.data);
    }
  }

  // Load products for supplier form
  async function loadProducts() {
    const res = await simulateAPICall("/api/products");
    if (res.success) {
      setProducts(res.data);
    }
  }

  // Initial load
  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadSuppliers(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Modal open handlers
  function openAddModal() {
    setModalTitle("Add New Supplier");
    setFormData({
      id: "",
      name: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      suppliedProducts: [],
    });
    setModalOpen(true);
  }

  async function openEditModal(id) {
    const res = await simulateAPICall(`/api/suppliers/${id}`);
    if (res.success) {
      const s = res.data;
      setModalTitle("Edit Supplier");
      setFormData({
        id: s.id,
        name: s.name,
        contactPerson: s.contactPerson,
        email: s.email,
        phone: s.phone || "",
        address: s.address || "",
        notes: s.notes || "",
        suppliedProducts: s.suppliedProducts ? s.suppliedProducts.map((p) => p.id) : [],
      });
      setModalOpen(true);
    }
  }

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setModalOpen(false);
      }
    }
    if (modalOpen) {
      window.addEventListener("click", handleClickOutside);
    } else {
      window.removeEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [modalOpen]);

  // Validate email helper
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Show alert helper
  function showAlert(message, type) {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }

  // Handle form input changes
  function onInputChange(e) {
    const { id, value } = e.target;
    setFormData((f) => ({ ...f, [id]: value }));
  }

  // Handle multi-select change
  function onMultiSelectChange(selectedIds) {
    setFormData((f) => ({ ...f, suppliedProducts: selectedIds }));
  }

  // Submit form
  async function onSubmit(e) {
    e.preventDefault();
    const data = {
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      suppliedProducts: formData.suppliedProducts,
    };
    if (!data.name || !data.contactPerson || !data.email) {
      showAlert("Name, contact person and email are required", "error");
      return;
    }
    if (!validateEmail(data.email)) {
      showAlert("Please enter a valid email address", "error");
      return;
    }
    const url = formData.id ? `/api/suppliers/${formData.id}` : "/api/suppliers";
    const method = formData.id ? "PUT" : "POST";

    const res = await simulateAPICall(url, data, method);
    if (res.success) {
      await loadSuppliers();
      setModalOpen(false);
      showAlert(`Supplier ${formData.id ? "updated" : "added"} successfully!`, "success");
    } else {
      showAlert(res.message || "Operation failed", "error");
    }
  }

  // Delete supplier
  async function deleteSupplier(id) {
    if (window.confirm("Are you sure you want to delete this supplier? This action cannot be undone.")) {
      const res = await simulateAPICall(`/api/suppliers/${id}`, {}, "DELETE");
      if (res.success) {
        await loadSuppliers();
        showAlert("Supplier deleted successfully!", "success");
      }
    }
  }

  // Render suppliers table rows
  function renderSupplierRow(supplier) {
    return (
      <tr key={supplier.id}>
        <td>
          <strong>{supplier.name}</strong>
          {supplier.notes && <div style={{ color: "#666", fontSize: 13 }}>{supplier.notes}</div>}
        </td>
        <td>{supplier.contactPerson}</td>
        <td>
          <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
        </td>
        <td>{supplier.phone || "-"}</td>
        <td>
          {supplier.suppliedProducts && supplier.suppliedProducts.length > 0
            ? supplier.suppliedProducts.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#f5f5f5",
                    padding: "3px 8px",
                    borderRadius: 4,
                    margin: 2,
                    fontSize: 12,
                  }}
                >
                  {p.name}
                </span>
              ))
            : "-"}
        </td>
        <td style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-edit"
            onClick={() => openEditModal(supplier.id)}
            style={{
              backgroundColor: "#2196f3",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconEdit /> Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => deleteSupplier(supplier.id)}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: 4,
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconTrash /> Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: 30,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ marginBottom: 25, color: "#d32f2f", display: "flex", alignItems: "center", gap: 10 }}>
        <IconTruck />
        Suppliers & Resellers
      </h1>

      {alert && (
        <div
          style={{
            marginBottom: 20,
            padding: 10,
            borderRadius: 4,
            color: alert.type === "success" ? "#4caf50" : "#f44336",
            border: `1px solid ${alert.type === "success" ? "#4caf50" : "#f44336"}`,
          }}
        >
          {alert.message}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 20,
          marginBottom: 25,
        }}
      >
        <button
          onClick={openAddModal}
          className="btn-primary"
          style={{
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: 4,
            fontSize: 15,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <IconPlus />
          Add New Supplier
        </button>

        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 4,
            border: "1px solid #e0e0e0",
            fontSize: 15,
            flexGrow: 1,
            minWidth: 200,
            maxWidth: 400,
          }}
        />
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#d32f2f", color: "white" }}>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Supplier Name</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Contact Person</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Email</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Phone</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Products Supplied</th>
            <th style={{ padding: 15, textAlign: "left", fontWeight: 500 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#666" }}>
                <IconTruck style={{ fontSize: 50, marginBottom: 15, color: "#e0e0e0" }} />
                <p>No suppliers found</p>
              </td>
            </tr>
          ) : (
            suppliers.map(renderSupplierRow)
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            zIndex: 1000,
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            overflowY: "auto",
            paddingTop: "5%",
          }}
        >
          <div
            ref={modalRef}
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              width: "90%",
              maxWidth: 700,
              padding: 30,
              boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <span
              className="close"
              onClick={() => setModalOpen(false)}
              style={{
                position: "absolute",
                right: 25,
                top: 25,
                fontSize: 24,
                fontWeight: "bold",
                cursor: "pointer",
                color: "#666",
              }}
              title="Close"
            >
              &times;
            </span>
            <h2 style={{ marginBottom: 20, color: "#d32f2f", display: "flex", alignItems: "center", gap: 10 }}>
              {modalTitle.includes("Add") ? <IconTruck /> : <IconEdit />}
              {modalTitle}
            </h2>

            <form onSubmit={onSubmit}>
              <input type="hidden" id="supplierId" value={formData.id} readOnly />
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter supplier name"
                    required
                    value={formData.name}
                    onChange={onInputChange}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    placeholder="Enter contact person"
                    required
                    value={formData.contactPerson}
                    onChange={onInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    required
                    value={formData.email}
                    onChange={onInputChange}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={onInputChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Address</label>
                <textarea
                  id="address"
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={onInputChange}
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Products Supplied</label>
                <MultiSelect options={products} selected={formData.suppliedProducts} onChange={onMultiSelectChange} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>Notes</label>
                <textarea
                  id="notes"
                  placeholder="Enter any additional notes"
                  value={formData.notes}
                  onChange={onInputChange}
                  style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "white",
                    border: "none",
                    padding: "12px 25px",
                    borderRadius: 4,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <IconSave />
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


