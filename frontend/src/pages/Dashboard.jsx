import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Activity, AlertTriangle, Navigation, Shield, Truck, Zap,
  TrendingUp, CheckCircle, Radio, Cpu, GitBranch,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════ */
/*  FLEET DATA — 8 active shipments                        */
/* ═══════════════════════════════════════════════════════ */
const FLEET_INIT = [
  { id: 'TRK-101', from: 'Mumbai',    to: 'Delhi',     risk: 18, speed: 72, weather: 'Clear',         eta: '6.2h' },
  { id: 'TRK-102', from: 'Chennai',   to: 'Bangalore', risk: 87, speed: 28, weather: 'Heavy Rain',    eta: '9.1h' },
  { id: 'TRK-103', from: 'Kolkata',   to: 'Hyderabad', risk: 45, speed: 55, weather: 'Foggy',         eta: '8.4h' },
  { id: 'TRK-104', from: 'Delhi',     to: 'Jaipur',    risk: 12, speed: 80, weather: 'Clear',         eta: '2.1h' },
  { id: 'TRK-105', from: 'Pune',      to: 'Mumbai',    risk: 63, speed: 42, weather: 'Traffic Jam',   eta: '3.8h' },
  { id: 'TRK-106', from: 'Ahmedabad', to: 'Surat',     risk: 8,  speed: 85, weather: 'Clear',         eta: '1.5h' },
  { id: 'TRK-107', from: 'Lucknow',   to: 'Kanpur',    risk: 91, speed: 15, weather: 'Flash Floods',  eta: '14.0h'},
  { id: 'TRK-108', from: 'Bangalore', to: 'Chennai',   risk: 34, speed: 66, weather: 'Overcast',      eta: '4.7h' },
];

const TREND_DATA = [
  { time: '06:00', detected: 1, prevented: 1 },
  { time: '08:00', detected: 4, prevented: 3 },
  { time: '10:00', detected: 3, prevented: 3 },
  { time: '12:00', detected: 6, prevented: 5 },
  { time: '14:00', detected: 8, prevented: 7 },
  { time: '16:00', detected: 5, prevented: 5 },
  { time: '18:00', detected: 3, prevented: 3 },
  { time: 'Now',   detected: 3, prevented: 2 },
];

const EVENTS = [
  { type: 'critical', icon: '🚨', msg: 'TRK-107: Flash flood detected on NH-28 — Cascade risk HIGH. Immediate rerouting initiated.' },
  { type: 'warning',  icon: '⚠️',  msg: 'TRK-102: Heavy rain on SH-48 — Delay risk elevated to 87%. 3 downstream shipments at risk.' },
  { type: 'success',  icon: '✅', msg: 'TRK-105: AI bypassed NH-4 bottleneck via NH-65 — Saving 1.8h. Cascade event prevented.' },
  { type: 'info',     icon: '🤖', msg: 'Multifaceted analysis: Cross-route cascade detected. TRK-103 proactively adjusted.' },
  { type: 'warning',  icon: '⚠️',  msg: 'TRK-103: Dense fog on NH-16 — Speed reduced to 40km/h, ETA recalculated to +35min.' },
  { type: 'success',  icon: '✅', msg: '4 shipments maintained on-time delivery — Preemptive rerouting successful.' },
  { type: 'info',     icon: '🤖', msg: 'AI model updated risk scores for 8 active shipments simultaneously (94.2% confidence).' },
  { type: 'critical', icon: '🚨', msg: 'Port congestion at JNPT — 3 dependent shipments flagged for preemptive rerouting.' },
  { type: 'warning',  icon: '⚠️',  msg: 'TRK-105: Multi-vehicle incident NH-4, Km 142 — Dynamic ETA recalculated +45min.' },
  { type: 'success',  icon: '✅', msg: 'TRK-101: NH-48 bypass executed before bottleneck — Delhi delivery secured on-time.' },
  { type: 'info',     icon: '🔄', msg: 'Cross-route analysis complete — 2 proactive route adjustments recommended & executed.' },
  { type: 'critical', icon: '🚨', msg: 'Bottleneck forming at Nashik junction — Preemptive alert issued to 2 downstream routes.' },
  { type: 'success',  icon: '✅', msg: 'TRK-108: Route optimized — Avoiding 67-min delay. Localized bottleneck cascade prevented.' },
  { type: 'info',     icon: '🤖', msg: 'AI system detected weather front over Vellore → escalating TRK-102 risk assessment.' },
];

/* ═══════════════════════════════════════════════════════ */
/*  HELPERS                                                 */
/* ═══════════════════════════════════════════════════════ */
const getRisk = (r) => {
  if (r >= 75) return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Critical' };
  if (r >= 50) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'At Risk'  };
  if (r >= 25) return { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Caution'  };
  return             { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'On Time'  };
};
const getTime = () => {
  const n = new Date();
  return `${n.getHours().toString().padStart(2,'0')}:${n.getMinutes().toString().padStart(2,'0')}`;
};
const alertColor = (t) => ({ critical:'#ef4444', warning:'#f59e0b', success:'#10b981', info:'#3b82f6' }[t]);

/* ═══════════════════════════════════════════════════════ */
/*  COMPONENT                                              */
/* ═══════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [fleet, setFleet]   = useState(FLEET_INIT);
  const [alerts, setAlerts] = useState([
    { ...EVENTS[1], id: 1, ts: '18:17' },
    { ...EVENTS[0], id: 2, ts: '18:14' },
    { ...EVENTS[5], id: 3, ts: '18:10' },
    { ...EVENTS[3], id: 4, ts: '18:03' },
    { ...EVENTS[7], id: 5, ts: '17:55' },
  ]);
  const [kpis, setKpis] = useState({ detected: 3, prevented: 17, optimized: 2 });
  const idRef = useRef(6);

  /* ── Auto-generate live disruption events ── */
  useEffect(() => {
    const t = setInterval(() => {
      const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      setAlerts(a => [{ ...ev, id: idRef.current++, ts: getTime() }, ...a].slice(0, 20));
      if (ev.type === 'critical') setKpis(k => ({ ...k, detected:  k.detected  + 1 }));
      if (ev.type === 'success')  setKpis(k => ({ ...k, prevented: k.prevented + 1, optimized: k.optimized + 1 }));
    }, 3500);
    return () => clearInterval(t);
  }, []);

  /* ── Continuously fluctuate risk scores (simulates real telemetry) ── */
  useEffect(() => {
    const t = setInterval(() => {
      setFleet(prev => prev.map(tr => ({
        ...tr,
        risk: Math.max(5, Math.min(95,
          tr.risk + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3)
        )),
      })));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const riskDist = useMemo(() => [
    { range: '0–25%',  count: fleet.filter(t => t.risk < 25).length,                fill: '#10b981' },
    { range: '25–50%', count: fleet.filter(t => t.risk >= 25 && t.risk < 50).length, fill: '#3b82f6' },
    { range: '50–75%', count: fleet.filter(t => t.risk >= 50 && t.risk < 75).length, fill: '#f59e0b' },
    { range: '75%+',   count: fleet.filter(t => t.risk >= 75).length,                fill: '#ef4444' },
  ], [fleet]);

  const criticalCount = fleet.filter(t => t.risk >= 75).length;
  const onTimeRate    = Math.round((fleet.filter(t => t.risk < 50).length / fleet.length) * 100);

  return (
    <div className="page-content">

      {/* ── Challenge Problem Strip ── */}
      <div className="ps-strip">
        <Zap size={13} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <span>Google Solution Challenge 2026 · Smart Supply Chains · Resilient Logistics &amp; Dynamic Supply Chain Optimization</span>
        <span className="ps-divider">|</span>
        <span style={{ color: '#10b981', fontWeight: 700 }}>● System Active</span>
      </div>

      {/* ── Mission Control Header ── */}
      <div className="mc-header">
        <div className="mc-header-left">
          <div className="mc-live-dot" />
          <div>
            <h2 className="page-title" style={{ marginBottom: 0 }}>Mission Control</h2>
            <p className="page-subtitle">Continuously analyzing {fleet.length} active shipments · AI disruption detection online · Cascade prevention active</p>
          </div>
        </div>
        <div className="mc-header-stats">
          <div className="mc-stat"><Truck size={13}/><span>{fleet.length} Active</span></div>
          <div className="mc-stat mc-stat-warn"><AlertTriangle size={13}/><span>{kpis.detected} Detected</span></div>
          <div className="mc-stat mc-stat-ok"><Shield size={13}/><span>{kpis.prevented} Prevented</span></div>
          <div className="mc-stat mc-stat-blue"><Navigation size={13}/><span>{kpis.optimized} Optimized</span></div>
        </div>
      </div>

      {/* ── 6 KPI Cards ── */}
      <div className="mc-kpi-grid">
        {[
          { label: 'Active Shipments',     value: fleet.length,   suffix: '',  icon: Truck,         color: '#3b82f6' },
          { label: 'Disruptions Detected', value: kpis.detected,  suffix: '',  icon: AlertTriangle, color: '#ef4444' },
          { label: 'Cascades Prevented',   value: kpis.prevented, suffix: '',  icon: Shield,        color: '#10b981' },
          { label: 'Routes Optimized',     value: kpis.optimized, suffix: '',  icon: Navigation,    color: '#8b5cf6' },
          { label: 'Critical Risk Trucks', value: criticalCount,  suffix: '',  icon: Activity,      color: '#f59e0b' },
          { label: 'AI Model Accuracy',    value: 94,             suffix: '%', icon: Cpu,           color: '#10b981' },
        ].map(({ label, value, suffix, icon: Icon, color }) => (
          <div key={label} className="kpi-card" style={{ '--kpi-color': color }}>
            <div className="kpi-icon-wrap" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <Icon size={19} style={{ color }} />
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{value}{suffix}</div>
              <div className="kpi-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Fleet Monitor + Alert Feed ── */}
      <div className="mc-main-grid">

        {/* Active Fleet Table */}
        <div className="chart-card fleet-card">
          <div className="chart-card-header">
            <Truck size={16} className="chart-card-icon" />
            <h3>Active Fleet Monitor</h3>
            <span className="live-badge live-badge-blue">● LIVE</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Truck</th>
                  <th>Route</th>
                  <th style={{ minWidth: 220 }}>Risk Score &amp; Status</th>
                  <th>Speed</th>
                  <th>Condition</th>
                  <th>ETA</th>
                </tr>
              </thead>
              <tbody>
                {fleet.map(tr => {
                  const rc = getRisk(tr.risk);
                  return (
                    <tr key={tr.id} className={tr.risk >= 75 ? 'row-alert' : tr.risk >= 50 ? 'row-caution' : ''}>
                      <td className="table-mono">{tr.id}</td>
                      <td style={{ fontSize: '0.8rem' }}>
                        <span style={{ color: '#64748b' }}>{tr.from}</span>
                        <span style={{ color: '#334155', margin: '0 5px' }}>→</span>
                        <span style={{ fontWeight: 600 }}>{tr.to}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, color: rc.color, minWidth: 38, fontSize: '0.9rem' }}>{tr.risk}%</span>
                          <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${tr.risk}%`, height: '100%', background: rc.color, borderRadius: 4, transition: 'width 1.2s ease' }} />
                          </div>
                          <span className="status-badge" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}30`, fontSize: '0.65rem', padding: '2px 8px' }}>
                            {rc.label}
                          </span>
                        </div>
                      </td>
                      <td className="table-muted" style={{ fontSize: '0.82rem' }}>{tr.speed} km/h</td>
                      <td style={{ fontSize: '0.78rem', color: tr.risk > 60 ? '#ef4444' : '#94a3b8' }}>{tr.weather}</td>
                      <td style={{ fontWeight: 700, fontSize: '0.82rem', color: tr.risk >= 75 ? '#ef4444' : 'inherit' }}>{tr.eta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Disruption Feed */}
        <div className="chart-card alert-feed-card">
          <div className="chart-card-header">
            <Radio size={16} style={{ color: '#ef4444' }} />
            <h3>Live Disruption Intelligence</h3>
            <span className="live-badge live-badge-red">● LIVE</span>
          </div>
          <div className="alert-feed-scroll">
            {alerts.map((al, i) => {
              const c = alertColor(al.type);
              return (
                <div
                  key={al.id}
                  className={`alert-event ${i === 0 ? 'alert-event-new' : ''}`}
                  style={{ borderLeftColor: c, background: i === 0 ? `${c}10` : 'transparent' }}
                >
                  <span className="alert-icon">{al.icon}</span>
                  <span className="alert-msg" style={{ color: i <= 1 ? '#e2e8f0' : '#64748b' }}>{al.msg}</span>
                  <span className="alert-ts">{al.ts}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Analytics Row ── */}
      <div className="charts-row" style={{ marginTop: '1.5rem' }}>
        <div className="chart-card chart-card-wide">
          <div className="chart-card-header">
            <TrendingUp size={16} className="chart-card-icon" />
            <h3>Disruptions Detected vs Cascades Prevented — Today</h3>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <AreaChart data={TREND_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: '0.8rem' }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <Legend formatter={v => <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{v}</span>} />
              <Area type="monotone" dataKey="detected"  name="Disruptions Detected"  stroke="#ef4444" strokeWidth={2.5} fill="url(#dG)" dot={false} />
              <Area type="monotone" dataKey="prevented" name="Cascades Prevented"     stroke="#10b981" strokeWidth={2.5} fill="url(#pG)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <GitBranch size={16} className="chart-card-icon" />
            <h3>Fleet Risk Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={riskDist} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: '0.8rem' }}
                labelStyle={{ color: '#fff', fontWeight: 700 }}
              />
              <Bar dataKey="count" name="Trucks" radius={[6, 6, 0, 0]}>
                {riskDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
