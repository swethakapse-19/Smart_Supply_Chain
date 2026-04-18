import React, { useState, useEffect } from 'react';
import {
  Package, Plus, Search, AlertTriangle, TrendingDown, X, Check, Edit2,
} from 'lucide-react';
import { getProducts, addProduct, updateProduct } from '../services/api';

const mockProducts = [
  { _id: '1',  name: 'MacBook Pro 14"',     category: 'Electronics', stock: 32,  price: 189999, sku: 'ELEC-0021', status: 'In Stock'    },
  { _id: '2',  name: 'Samsung 4K Monitor',   category: 'Electronics', stock: 8,   price: 34999,  sku: 'ELEC-0022', status: 'Low Stock'   },
  { _id: '3',  name: 'Winter Jacket XL',     category: 'Apparel',     stock: 145, price: 3499,   sku: 'APRL-0011', status: 'In Stock'    },
  { _id: '4',  name: 'Vitamin C 1000mg',     category: 'Pharma',      stock: 6,   price: 299,    sku: 'PHRM-0043', status: 'Low Stock'   },
  { _id: '5',  name: 'Industrial Pump 5HP',  category: 'Industrial',  stock: 19,  price: 54000,  sku: 'INDS-0007', status: 'In Stock'    },
  { _id: '6',  name: 'Organic Green Tea',    category: 'Food & Bev',  stock: 3,   price: 449,    sku: 'FOOD-0088', status: 'Critical'    },
  { _id: '7',  name: 'Wireless Mouse',       category: 'Electronics', stock: 57,  price: 1299,   sku: 'ELEC-0031', status: 'In Stock'    },
  { _id: '8',  name: 'Cargo Pants M',        category: 'Apparel',     stock: 78,  price: 1899,   sku: 'APRL-0019', status: 'In Stock'    },
  { _id: '9',  name: 'Paracetamol 500mg',    category: 'Pharma',      stock: 4,   price: 49,     sku: 'PHRM-0011', status: 'Critical'    },
  { _id: '10', name: 'Steel Bearing Set',    category: 'Industrial',  stock: 212, price: 8500,   sku: 'INDS-0015', status: 'In Stock'    },
  { _id: '11', name: 'Cold Brew Coffee',     category: 'Food & Bev',  stock: 44,  price: 799,    sku: 'FOOD-0054', status: 'In Stock'    },
  { _id: '12', name: 'USB-C Hub 7-in-1',    category: 'Electronics', stock: 9,   price: 2499,   sku: 'ELEC-0045', status: 'Low Stock'   },
];

const categories = ['All', 'Electronics', 'Apparel', 'Pharma', 'Industrial', 'Food & Bev'];
const statusStyles = {
  'In Stock':  { bg: '#10b98120', color: '#10b981', border: '#10b98140' },
  'Low Stock': { bg: '#f59e0b20', color: '#f59e0b', border: '#f59e0b40' },
  'Critical':  { bg: '#ef444420', color: '#ef4444', border: '#ef444440' },
};

const getStatus = (stock) => {
  if (stock === 0) return 'Out of Stock';
  if (stock < 5)  return 'Critical';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
};

export default function Inventory() {
  const [products, setProducts]     = useState(mockProducts);
  const [filter, setFilter]         = useState('All');
  const [search, setSearch]         = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState(null);
  const [form, setForm]             = useState({ name: '', category: 'Electronics', stock: '', price: '', sku: '' });
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    getProducts()
      .then(res => setProducts(res.data))
      .catch(() => setProducts(mockProducts));
  }, []);

  const filtered = products
    .filter(p => filter === 'All' || p.category === filter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                 p.sku.toLowerCase().includes(search.toLowerCase()));

  const lowStockCount = products.filter(p => p.stock < 10).length;

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', category: 'Electronics', stock: '', price: '', sku: '' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, category: p.category, stock: p.stock, price: p.price, sku: p.sku });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, stock: Number(form.stock), price: Number(form.price) };
    try {
      if (editingId) {
        const res = await updateProduct(editingId, payload).catch(() => null);
        setProducts(prev => prev.map(p => p._id === editingId
          ? { ...p, ...payload, status: getStatus(payload.stock) } : p));
      } else {
        const newP = { ...payload, _id: String(Date.now()), status: getStatus(payload.stock) };
        await addProduct(payload).catch(() => null);
        setProducts(prev => [newP, ...prev]);
      }
    } finally {
      setSaving(false);
      setShowModal(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">Manage stock levels across all product categories</p>
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div className="alert-banner">
          <AlertTriangle size={18} />
          <span><strong>{lowStockCount} products</strong> are below minimum stock threshold — immediate reorder recommended</span>
          <TrendingDown size={16} style={{ marginLeft: 'auto', opacity: 0.7 }} />
        </div>
      )}

      {/* Filters + Search */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search products or SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {categories.map(c => (
            <button
              key={c}
              className={`filter-tab ${filter === c ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(c)}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const s = statusStyles[getStatus(p.stock)] || statusStyles['In Stock'];
              const isLow = p.stock < 10;
              return (
                <tr key={p._id} className={isLow ? 'row-alert' : ''}>
                  <td className="table-product-name">
                    {isLow && <AlertTriangle size={13} style={{ color: '#ef4444', marginRight: 6 }} />}
                    {p.name}
                  </td>
                  <td className="table-mono">{p.sku}</td>
                  <td>
                    <span className="category-badge">{p.category}</span>
                  </td>
                  <td>
                    <div className="stock-cell">
                      <span style={{ fontWeight: 700, color: isLow ? '#ef4444' : '#f8fafc' }}>{p.stock}</span>
                      <div className="stock-bar">
                        <div className="stock-bar-fill" style={{
                          width: `${Math.min((p.stock / 250) * 100, 100)}%`,
                          background: isLow ? '#ef4444' : '#10b981',
                        }} />
                      </div>
                    </div>
                  </td>
                  <td className="table-price">₹{p.price.toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {getStatus(p.stock)}
                    </span>
                  </td>
                  <td>
                    <button className="icon-btn" onClick={() => openEdit(p)} title="Edit product">
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">No products match your search.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {[
                { label: 'Product Name', key: 'name',     type: 'text' },
                { label: 'SKU',          key: 'sku',      type: 'text' },
                { label: 'Stock',        key: 'stock',    type: 'number' },
                { label: 'Price (₹)',    key: 'price',    type: 'number' },
              ].map(({ label, key, type }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    className="form-input"
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={label}
                  />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : <><Check size={16} /> Save Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
