import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Filter, Package, Truck, CheckCircle, Clock, Eye } from 'lucide-react';
import { getOrders, updateOrder } from '../services/api';

const mockOrders = [
  { _id: 'ORD-081', product: 'MacBook Pro 14"',    customer: 'Rohan Mehta',   quantity: 2,  total: 379998, status: 'Shipped',   date: '2026-04-16', eta: '2026-04-18', city: 'Mumbai'    },
  { _id: 'ORD-080', product: 'Winter Jacket XL',   customer: 'Priya Sharma',  quantity: 5,  total: 17495,  status: 'Delivered', date: '2026-04-14', eta: '2026-04-17', city: 'Delhi'     },
  { _id: 'ORD-079', product: 'Industrial Pump 5HP',customer: 'Kiran Reddy',   quantity: 1,  total: 54000,  status: 'Pending',   date: '2026-04-18', eta: '2026-04-23', city: 'Hyderabad' },
  { _id: 'ORD-078', product: 'Vitamin C 1000mg',   customer: 'Anjali Singh',  quantity: 24, total: 7176,   status: 'Shipped',   date: '2026-04-16', eta: '2026-04-17', city: 'Pune'      },
  { _id: 'ORD-077', product: 'USB-C Hub 7-in-1',   customer: 'Dev Patel',     quantity: 3,  total: 7497,   status: 'Shipped',   date: '2026-04-15', eta: '2026-04-18', city: 'Bangalore' },
  { _id: 'ORD-076', product: 'Organic Green Tea',  customer: 'Sunita Roy',    quantity: 10, total: 4490,   status: 'Delivered', date: '2026-04-12', eta: '2026-04-15', city: 'Kolkata'   },
  { _id: 'ORD-075', product: 'Samsung 4K Monitor', customer: 'Arjun Nair',    quantity: 1,  total: 34999,  status: 'Pending',   date: '2026-04-18', eta: '2026-04-25', city: 'Chennai'   },
  { _id: 'ORD-074', product: 'Wireless Mouse',     customer: 'Meena Das',     quantity: 6,  total: 7794,   status: 'Delivered', date: '2026-04-11', eta: '2026-04-14', city: 'Jaipur'    },
  { _id: 'ORD-073', product: 'Steel Bearing Set',  customer: 'Raj Kumar',     quantity: 4,  total: 34000,  status: 'Shipped',   date: '2026-04-17', eta: '2026-04-20', city: 'Surat'     },
  { _id: 'ORD-072', product: 'Cold Brew Coffee',   customer: 'Tanya Verma',   quantity: 8,  total: 6392,   status: 'Delivered', date: '2026-04-10', eta: '2026-04-13', city: 'Lucknow'   },
];

const statusConfig = {
  Pending:   { color: '#f59e0b', bg: '#f59e0b15', icon: Clock,       label: 'Pending'   },
  Shipped:   { color: '#3b82f6', bg: '#3b82f615', icon: Truck,       label: 'Shipped'   },
  Delivered: { color: '#10b981', bg: '#10b98115', icon: CheckCircle, label: 'Delivered' },
};

const statusOrder = ['All', 'Pending', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders]       = useState(mockOrders);
  const [filter, setFilter]       = useState('All');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);

  useEffect(() => {
    getOrders()
      .then(res => setOrders(res.data))
      .catch(() => setOrders(mockOrders));
  }, []);

  const filtered = orders
    .filter(o => filter === 'All' || o.status === filter)
    .filter(o =>
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    );

  const counts = statusOrder.slice(1).reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {});

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    updateOrder(orderId, { status: newStatus }).catch(() => {});
    if (selected?._id === orderId) setSelected(o => ({ ...o, status: newStatus }));
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">Track and manage all customer shipments</p>
        </div>
        {/* Summary pills */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {Object.entries(counts).map(([status, count]) => {
            const cfg = statusConfig[status];
            return (
              <div key={status} className="order-summary-pill" style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
                <cfg.icon size={14} style={{ color: cfg.color }} />
                <span style={{ color: cfg.color, fontWeight: 700 }}>{count}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{status}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search order ID, product, or customer…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {statusOrder.map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'filter-tab-active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s}{s !== 'All' && <span className="filter-tab-count">{counts[s]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Customer</th>
              <th>City</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const cfg = statusConfig[o.status];
              const Icon = cfg.icon;
              return (
                <tr key={o._id} className={selected?._id === o._id ? 'row-selected' : ''}>
                  <td className="table-mono">{o._id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      {o.product}
                    </div>
                  </td>
                  <td>{o.customer}</td>
                  <td className="table-muted">{o.city}</td>
                  <td className="table-muted">{o.quantity}</td>
                  <td className="table-price">₹{o.total.toLocaleString()}</td>
                  <td>
                    <span className="status-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                      <Icon size={12} /> {o.status}
                    </span>
                  </td>
                  <td className="table-muted">{o.eta}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="icon-btn" onClick={() => setSelected(selected?._id === o._id ? null : o)} title="View details">
                        <Eye size={15} />
                      </button>
                      <select
                        className="status-select"
                        value={o.status}
                        onChange={e => handleStatusChange(o._id, e.target.value)}
                      >
                        {['Pending', 'Shipped', 'Delivered'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">No orders match your filters.</div>
        )}
      </div>

      {/* Order Detail Drawer */}
      {selected && (
        <div className="detail-drawer">
          <div className="detail-drawer-header">
            <h4>{selected._id}</h4>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div className="detail-row"><span>Product</span><strong>{selected.product}</strong></div>
          <div className="detail-row"><span>Customer</span><strong>{selected.customer}</strong></div>
          <div className="detail-row"><span>City</span><strong>{selected.city}</strong></div>
          <div className="detail-row"><span>Quantity</span><strong>{selected.quantity}</strong></div>
          <div className="detail-row"><span>Total</span><strong>₹{selected.total.toLocaleString()}</strong></div>
          <div className="detail-row"><span>Order Date</span><strong>{selected.date}</strong></div>
          <div className="detail-row"><span>ETA</span><strong>{selected.eta}</strong></div>
          <div className="detail-row">
            <span>Status</span>
            <span className="status-badge" style={{
              background: statusConfig[selected.status].bg,
              color: statusConfig[selected.status].color,
              border: `1px solid ${statusConfig[selected.status].color}40`,
            }}>
              {selected.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
