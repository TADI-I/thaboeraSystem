import React, { useState, useEffect, useCallback, useRef } from "react";

const simulateAPICall = (url, data = {}, method = "GET", isFormData = false) => {
  console.log(`API Call: ${method} ${url}`, data);
  return new Promise((resolve) => {
    setTimeout(() => {
      if (method === "GET" && url === "/api/products/categories") {
        resolve({
          success: true,
          data: [
            { id: 1, name: "Electronics" },
            { id: 2, name: "Office Supplies" },
            { id: 3, name: "Networking" },
            { id: 4, name: "Software" },
            { id: 5, name: "Accessories" },
          ],
        });
      } else if (method === "GET" && url.startsWith("/api/products")) {
        const categories = [
          "Electronics",
          "Office Supplies",
          "Networking",
          "Software",
          "Accessories",
        ];
        const mockProducts = [];
        for (let i = 1; i <= 15; i++) {
          mockProducts.push({
            id: i,
            name: `Product ${i}`,
            description: `Description for product ${i}`,
            category: categories[Math.floor(Math.random() * categories.length)],
            categoryId: Math.floor(Math.random() * 5) + 1,
            sku: `SKU-${1000 + i}`,
            price: Math.random() * 100 + 10,
            stock: Math.floor(Math.random() * 50),
            cost: Math.random() * 80 + 5,
            reorderLevel: 5,
            image: Math.random() > 0.5 ? `https://picsum.photos/100/100?random=${i}` : null,
          });
        }
        let filteredProducts = mockProducts;
        const searchParams = new URLSearchParams(url.split("?")[1] || "");
        const searchTerm = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        if (category) {
          filteredProducts = filteredProducts.filter(
            (product) => product.categoryId.toString() === category
          );
        }
        resolve({
          success: true,
          data: filteredProducts,
        });
      } else if ((method === "POST" || method === "PUT") && url.includes("/products")) {
        resolve({
          success: true,
          data: { id: Math.floor(Math.random() * 1000) + 100 },
        });
      } else if (method === "DELETE" && url.includes("/products/")) {
        resolve({
          success: true,
          data: { id: parseInt(url.split("/").pop()) },
        });
      } else if (method === "GET" && url.startsWith("/api/products/")) {
        // Return single product for edit
        const id = parseInt(url.split("/").pop());
        resolve({
          success: true,
          data: {
            id,
            name: `Product ${id}`,
            description: `Description for product ${id}`,
            categoryId: 1,
            sku: `SKU-${1000 + id}`,
            price: 50 + id,
            stock: 10 + id,
            cost: 40 + id,
            reorderLevel: 5,
            image: `https://picsum.photos/100/100?random=${id}`,
          },
        });
      } else {
        resolve({ success: false, message: "API error" });
      }
    }, 800);
  });
};

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ProductInventory() {
  // Auth check - redirect if no token
  useEffect(() => {
    if (!localStorage.getItem("authToken")) {
      window.location.href = "login.html";
    }
  }, []);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [formTitle, setFormTitle] = useState("Add New Product");

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    description: "",
    categoryId: "",
    sku: "",
    price: "",
    stock: "",
    cost: "",
    reorderLevel: 5,
    imageFile: null,
    imagePreview: null,
    imageFileName: "",
  });

  // Debounced load products function
  const loadProducts = useCallback(
    (search = searchTerm, category = categoryFilter) => {
      const url = `/api/products?search=${encodeURIComponent(search)}&category=${encodeURIComponent(
        category
      )}`;
      simulateAPICall(url).then((res) => {
        if (res.success) {
          setProducts(res.data);
        }
      });
    },
    [searchTerm, categoryFilter]
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    simulateAPICall("/api/products/categories").then((res) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  }, []);

  // Debounce search input
  const debouncedSearch = useRef(
    debounce((value) => {
      setSearchTerm(value);
    }, 300)
  ).current;

  // Handlers
  function handleSearchChange(e) {
    debouncedSearch(e.target.value);
  }

  function handleCategoryFilterChange(e) {
    setCategoryFilter(e.target.value);
  }

  useEffect(() => {
    loadProducts(searchTerm, categoryFilter);
  }, [searchTerm, categoryFilter, loadProducts]);

  // Open modal for new product
  function openAddProductModal() {
    setFormTitle("Add New Product");
    setFormData({
      productId: "",
      name: "",
      description: "",
      categoryId: "",
      sku: "",
      price: "",
      stock: "",
      cost: "",
      reorderLevel: 5,
      imageFile: null,
      imagePreview: null,
      imageFileName: "",
    });
    setModalOpen(true);
  }

  // Open modal to edit product
  function openEditProductModal(id) {
    simulateAPICall(`/api/products/${id}`).then((res) => {
      if (res.success) {
        const p = res.data;
        setFormTitle("Edit Product");
        setFormData({
          productId: p.id,
          name: p.name || "",
          description: p.description || "",
          categoryId: p.categoryId || "",
          sku: p.sku || "",
          price: p.price || "",
          stock: p.stock || "",
          cost: p.cost || "",
          reorderLevel: p.reorderLevel || 5,
          imageFile: null,
          imagePreview: p.image || null,
          imageFileName: p.image ? "Current image" : "",
        });
        setModalOpen(true);
      }
    });
  }

  // Handle form input changes
  function handleInputChange(e) {
    const { id, value, files } = e.target;
    if (id === "productImage" && files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((fd) => ({
          ...fd,
          imageFile: file,
          imagePreview: e.target.result,
          imageFileName: file.name,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((fd) => ({
        ...fd,
        [id]: value,
      }));
    }
  }

  // Submit form handler
  function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("category", formData.categoryId);
    data.append("sku", formData.sku);
    data.append("price", formData.price);
    data.append("stock", formData.stock);
    data.append("cost", formData.cost);
    data.append("reorderLevel", formData.reorderLevel);
    if (formData.imageFile) {
      data.append("image", formData.imageFile);
    }

    const url = formData.productId ? `/api/products/${formData.productId}` : "/api/products";
    const method = formData.productId ? "PUT" : "POST";

    simulateAPICall(url, data, method, true).then((res) => {
      if (res.success) {
        loadProducts();
        setModalOpen(false);
        alert(`Product ${formData.productId ? "updated" : "added"} successfully!`);
      } else {
        alert(res.message || "Operation failed");
      }
    });
  }

  // Delete product handler
  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      simulateAPICall(`/api/products/${id}`, {}, "DELETE").then((res) => {
        if (res.success) {
          loadProducts();
          alert("Product deleted successfully!");
        }
      });
    }
  }

  // Modal close handler
  function closeModal() {
    setModalOpen(false);
  }

  // Determine stock status
  function getStockStatus(product) {
    if (product.stock <= 0) return { text: "Out of Stock", className: "out-of-stock" };
    if (product.stock < (product.reorderLevel || 5)) return { text: "Low Stock", className: "low-stock" };
    return { text: "In Stock", className: "in-stock" };
  }

  // Close modal on click outside modal content
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalOpen && modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  return (
    <div className="inventory-container">
      <h1>
        <i className="fas fa-boxes"></i> Product Inventory
      </h1>

      <div className="inventory-actions">
        <button onClick={openAddProductModal} className="btn-primary">
          <i className="fas fa-plus"></i> Add Product
        </button>

        <div className="search-filter">
          <input
            type="text"
            placeholder="Search products..."
            onChange={handleSearchChange}
            defaultValue={searchTerm}
          />
          <select value={categoryFilter} onChange={handleCategoryFilterChange}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table id="productsTable">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="6" className="empty-state">
                <i className="fas fa-box-open"></i>
                <p>No products found</p>
              </td>
            </tr>
          ) : (
            products.map((product) => {
              const { text: stockText, className: stockClass } = getStockStatus(product);
              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-info">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb">
                          <i className="fas fa-box"></i>
                        </div>
                      )}
                      <div>
                        <strong>{product.name}</strong>
                        {product.sku && <div className="text-muted">SKU: {product.sku}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td className={stockClass}>{stockText}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => openEditProductModal(product.id)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      <i className="fas fa-trash-alt"></i> Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Modal */}
      {modalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-content" ref={modalRef}>
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2 id="productModalTitle">
              <i className="fas fa-box"></i> {formTitle}
            </h2>
            <form id="productForm" onSubmit={handleSubmit}>
              <input type="hidden" id="productId" value={formData.productId} readOnly />

              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter product name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  id="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    id="categoryId"
                    required
                    value={formData.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>SKU (Optional)</label>
                  <input
                    type="text"
                    id="sku"
                    placeholder="Enter SKU"
                    value={formData.sku}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    id="stock"
                    placeholder="0"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Cost Price ($)</label>
                  <input
                    type="number"
                    id="cost"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Reorder Level</label>
                  <input
                    type="number"
                    id="reorderLevel"
                    placeholder="5"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <div className="file-upload-wrapper">
                  <label
                    htmlFor="productImage"
                    className="file-upload-label"
                    style={{ cursor: "pointer" }}
                  >
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>Choose an image</span>
                  </label>
                  <div className="file-name">{formData.imageFileName}</div>
                  <input
                    type="file"
                    id="productImage"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleInputChange}
                  />
                </div>
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="image-preview"
                    style={{ display: "block" }}
                  />
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  <i className="fas fa-save"></i> Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
