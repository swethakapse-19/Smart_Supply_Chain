import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, Package, RefreshCw } from 'lucide-react';
import { getDemandAll } from '../services/api';

const products = [
  { id: '1', name: 'MacBook Pro 14"',   currentStock: 32 },
  { id: '2', name: 'Samsung 4K Monitor',currentStock: 8  },
  { id: '3', name: 'Vitamin C 1000mg',  currentStock: 6  },
  { id: '4', name: 'Organic Green Tea', currentStock: 3  },
  { id: '5', name: 'USB-C Hub 7-in-1',  currentStock: 9  },
];

/* Generate mock forecast: historical + next 4 weeks projection */
const generateForecast = (baseVal, stock) => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const historical = months.slice(0, 4).map((m, i) => ({
    period: m,
    actual: Math.round(baseVal * (0.7 + Math.random() * 0.6)),
    forecast: null,
  }));
  const future = ['Apr', 'May', 'Jun', 'Jul'].map((m, i) => ({
    period: m,
    actual: i === 0 ? historical[historical.length - 1]?.actual : null,
    forecast: Math.round(baseVal * (1 + i * 0.08 + Math.random() * 0.1)),
  }));
  return [...historical, ...future.slice(1)];
};

const forecastData = {
  '1': generateForecast(18, 32),
  '2': generateForecast(12, 8),
  '3': generateForecast(40, 6),
  '4': generateForecast(30, 3),
  '5': generateForecast(22, 9),
};

const recommendations = (product, data) => {
  const lastForecast = data.filter(d => d.forecast).slice(-1)[0]?.forecast || 0;
  const avgForecast  = Math.round(data.filter(d => d.forecast).reduce((a, d) => a + d.forecast, 0) / 3);
  const reorderQty   = Math.max(0, avgForecast * 2 - product.currentStock);
  const risk = product.currentStock < 5 ? 'Critical' : product.currentStock < 10 ? 'High' : 'Moderate';
  return { lastForecast, avgForecast, reorderQty, risk };
};

const riskColors = { Critical: '#ef4444', High: '#f59e0b', Moderate: '#3b82f6' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map(p => p.value !== null && (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value} units</p>
      ))}
    </div>
  );
};

export default function DemandAI() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(forecastData);

  const data = chartData[selectedProduct.id];
  const rec  = recommendations(selectedProduct, data);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const newData = {};
      products.forEach(p => { newData[p.id] = generateForecast(10 + Math.random() * 30, p.currentStock); });
      setChartData(newData);
      setRefreshing(false);
    }, 1200);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Demand AI</h2>
          <p className="page-subtitle">ML-powered demand forecasting & reorder intelligence</p>
        </div>
        <button className="btn-secondary" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Updating…' : 'Refresh Forecast'}
        </button>
      </div>

      <div className="demand-layout">
        {/* Product Selector */}
        <div className="demand-sidebar">
          <div className="chart-card-header" style={{ marginBottom: '1rem' }}>
            <Package size={16} className="chart-card-icon" /> Products
          </div>
          {products.map(p => {
            const r = recommendations(p, chartData[p.id]);
            return (
              <button
                key={p.id}
                className={`demand-product-btn ${selectedProduct.id === p.id ? 'demand-product-active' : ''}`}
                onClick={() => setSelectedProduct(p)}
              >
                <div className="demand-product-name">{p.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span className="table-muted" style={{ fontSize: '0.78rem' }}>Stock: {p.currentStock}</span>
                  <span className="status-badge" style={{
                    background: `${riskColors[r.risk]}20`,
                    color: riskColors[r.risk],
                    border: `1px solid ${riskColors[r.risk]}40`,
                    fontSize: '0.7rem',
                    padding: '1px 6px',
                  }}>{r.risk}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* AI Insight Cards */}
          <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { label: 'Avg Weekly Demand',  value: `${rec.avgForecast} units`,  color: '#3b82f6', icon: TrendingUp   },
              { label: 'Reorder Quantity',   value: `${rec.reorderQty} units`,   color: '#10b981', icon: Package      },
              { label: 'Stock Risk Level',   value: rec.risk,                    color: riskColors[rec.risk], icon: AlertTriangle },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} className="kpi-card" style={{ '--kpi-color': color }}>
                <div className="kpi-icon-wrap" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="kpi-body">
                  <div className="kpi-value" style={{ fontSize: '1.3rem' }}>{value}</div>
                  <div className="kpi-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Forecast Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <BrainCircuit size={18} className="chart-card-icon" />
              <h3>Demand Forecast — {selectedProduct.name}</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="period" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                  label={{ value: 'Units', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, offset: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{v}</span>} />
                <ReferenceLine
                  y={selectedProduct.currentStock}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Current Stock', position: 'right', fill: '#ef4444', fontSize: 11 }}
                />
                <Line type="monotone" dataKey="actual"   name="Actual Demand"  stroke="#3b82f6" strokeWidth={2.5}
                  dot={{ r: 4 }} connectNulls={false} />
                <Line type="monotone" dataKey="forecast" name="AI Forecast"    stroke="#10b981" strokeWidth={2.5}
                  strokeDasharray="6 3" dot={{ r: 4 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* AI Recommendation */}
          <div className="chart-card ai-recommendation">
            <div className="chart-card-header">
              <BrainCircuit size={18} className="chart-card-icon" style={{ color: '#8b5cf6' }} />
              <h3>AI Recommendation</h3>
              <span className="ai-badge">AI Powered</span>
            </div>
            <div className="recommendation-text">
              {rec.risk === 'Critical' && (
                <p>
                  🚨 <strong>Critical stock alert:</strong> {selectedProduct.name} has only <strong>{selectedProduct.currentStock} units</strong> remaining.
                  Forecasted demand of <strong>{rec.avgForecast} units/week</strong> will result in stockout within days.
                  Immediately place a reorder of <strong>{rec.reorderQty} units</strong>.
                </p>
              )}
              {rec.risk === 'High' && (
                <p>
                  ⚠️ <strong>High risk detected:</strong> Current stock of <strong>{selectedProduct.currentStock} units</strong> is below
                  the forecasted weekly demand of <strong>{rec.avgForecast} units</strong>.
                  Reorder <strong>{rec.reorderQty} units</strong> to maintain a 2-week safety buffer.
                </p>
              )}
              {rec.risk === 'Moderate' && (
                <p>
                  ✅ <strong>Stock healthy for now:</strong> {selectedProduct.name} has sufficient inventory.
                  Demand forecast of <strong>{rec.avgForecast} units/week</strong> suggests scheduling a reorder
                  of <strong>{rec.reorderQty} units</strong> within 2–3 weeks.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
