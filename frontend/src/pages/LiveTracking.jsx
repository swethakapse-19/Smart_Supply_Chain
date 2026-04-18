import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import {
  Truck, AlertTriangle, Route, CloudLightning, Navigation,
  Clock, Activity, ShieldAlert, Map as MapIcon, ChevronRight, Zap,
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

/* ═══════════════════════════════════════════════════════ */
/*  PRESET TRUCK CONFIGURATIONS (demo-safe, no API needed) */
/* ═══════════════════════════════════════════════════════ */
const TRUCK_CONFIGS = {
  'TRK-101': {
    truck_id: 'TRK-101', source: 'Mumbai', destination: 'Delhi',
    current_location: 'Ahmedabad', speed: 72, weather: 'Clear',
    traffic_level: 'Low', delay_risk: 18, eta: '6.2 hours', current_route: 'NH-48 (Standard)',
    sourceCoords:  [19.0760, 72.8777],
    destCoords:    [28.6139, 77.2090],
    currentCoords: [23.0225, 72.5714],
    routeA: [[19.0760, 72.8777], [23.0225, 72.5714], [28.6139, 77.2090]],
    routeB: [[19.0760, 72.8777], [21.0, 73.5], [25.0, 74.8], [28.6139, 77.2090]],
    scenario: 'normal',
    riskLabel: 'On Time', riskColor: '#10b981',
  },
  'TRK-102': {
    truck_id: 'TRK-102', source: 'Chennai', destination: 'Bangalore',
    current_location: 'Vellore', speed: 28, weather: 'Heavy Rain',
    traffic_level: 'High', delay_risk: 87, eta: '9.1 hours', current_route: 'NH-44 (Standard)',
    sourceCoords:  [13.0827, 80.2707],
    destCoords:    [12.9716, 77.5946],
    currentCoords: [12.92, 79.15],
    routeA: [[13.0827, 80.2707], [12.92, 79.15], [12.9716, 77.5946]],
    routeB: [[13.0827, 80.2707], [12.5, 79.8], [12.4, 78.5], [12.9716, 77.5946]],
    scenario: 'disrupted',
    riskLabel: 'Critical', riskColor: '#ef4444',
  },
  'TRK-103': {
    truck_id: 'TRK-103', source: 'Kolkata', destination: 'Hyderabad',
    current_location: 'Berhampur', speed: 55, weather: 'Foggy',
    traffic_level: 'Medium', delay_risk: 45, eta: '8.4 hours', current_route: 'NH-16 (Standard)',
    sourceCoords:  [22.5726, 88.3639],
    destCoords:    [17.3850, 78.4867],
    currentCoords: [19.8, 84.8],
    routeA: [[22.5726, 88.3639], [19.8, 84.8], [17.3850, 78.4867]],
    routeB: [[22.5726, 88.3639], [21.0, 85.5], [19.5, 82.0], [17.3850, 78.4867]],
    scenario: 'normal',
    riskLabel: 'Caution', riskColor: '#f59e0b',
  },
  'TRK-104': {
    truck_id: 'TRK-104', source: 'Delhi', destination: 'Jaipur',
    current_location: 'Rewari', speed: 80, weather: 'Clear',
    traffic_level: 'Low', delay_risk: 12, eta: '2.1 hours', current_route: 'NH-48 (Standard)',
    sourceCoords:  [28.6139, 77.2090],
    destCoords:    [26.9124, 75.7873],
    currentCoords: [27.8, 76.6],
    routeA: [[28.6139, 77.2090], [27.8, 76.6], [26.9124, 75.7873]],
    routeB: [[28.6139, 77.2090], [27.5, 77.0], [27.0, 76.0], [26.9124, 75.7873]],
    scenario: 'normal',
    riskLabel: 'On Time', riskColor: '#10b981',
  },
  'TRK-105': {
    truck_id: 'TRK-105', source: 'Pune', destination: 'Mumbai',
    current_location: 'Lonavala', speed: 42, weather: 'Traffic Congestion',
    traffic_level: 'High', delay_risk: 63, eta: '3.8 hours', current_route: 'NH-48 (Standard)',
    sourceCoords:  [18.5204, 73.8567],
    destCoords:    [19.0760, 72.8777],
    currentCoords: [18.75, 73.4],
    routeA: [[18.5204, 73.8567], [18.75, 73.4], [19.0760, 72.8777]],
    routeB: [[18.5204, 73.8567], [18.9, 74.1], [19.2, 73.2], [19.0760, 72.8777]],
    scenario: 'disrupted',
    riskLabel: 'At Risk', riskColor: '#f59e0b',
  },
  'TRK-107': {
    truck_id: 'TRK-107', source: 'Lucknow', destination: 'Kanpur',
    current_location: 'Unnao', speed: 15, weather: 'Flash Floods',
    traffic_level: 'High', delay_risk: 91, eta: '14.0 hours', current_route: 'NH-27 (Standard)',
    sourceCoords:  [26.8467, 80.9462],
    destCoords:    [26.4499, 80.3319],
    currentCoords: [26.65, 80.65],
    routeA: [[26.8467, 80.9462], [26.65, 80.65], [26.4499, 80.3319]],
    routeB: [[26.8467, 80.9462], [26.7, 80.0], [26.5, 80.2], [26.4499, 80.3319]],
    scenario: 'disrupted',
    riskLabel: 'Critical', riskColor: '#ef4444',
  },
};

const TRUCK_IDS = Object.keys(TRUCK_CONFIGS);

const getRiskColor = (risk) => {
  if (risk >= 75) return '#ef4444';
  if (risk >= 50) return '#f59e0b';
  if (risk >= 25) return '#3b82f6';
  return '#10b981';
};

/* ═══════════════════════════════════════════════════════ */
/*  COMPONENT                                              */
/* ═══════════════════════════════════════════════════════ */
export default function LiveTracking() {
  const [selectedId, setSelectedId]     = useState('TRK-101');
  const [scenario, setScenario]         = useState('normal');
  const [sourceInput, setSourceInput]   = useState('Mumbai');
  const [destInput, setDestInput]       = useState('Delhi');
  const [isUpdating, setIsUpdating]     = useState(false);
  const [aiScanning, setAiScanning]     = useState(false);

  const [mapData, setMapData] = useState({
    sourceCoords:  TRUCK_CONFIGS['TRK-101'].sourceCoords,
    destCoords:    TRUCK_CONFIGS['TRK-101'].destCoords,
    currentCoords: TRUCK_CONFIGS['TRK-101'].currentCoords,
    routeA:        TRUCK_CONFIGS['TRK-101'].routeA,
    routeB:        TRUCK_CONFIGS['TRK-101'].routeB,
  });

  const [data, setData] = useState({
    truck_id:       'TRK-101',
    source:         'Mumbai',
    destination:    'Delhi',
    current_location: 'Ahmedabad',
    speed:          72,
    weather:        'Clear',
    traffic_level:  'Low',
    delay_risk:     18,
    eta:            '6.2 hours',
    current_route:  'NH-48 (Standard)',
  });

  /* ── Load a preset truck config ── */
  const loadTruck = (id) => {
    const cfg = TRUCK_CONFIGS[id];
    if (!cfg) return;
    setSelectedId(id);
    setSourceInput(cfg.source);
    setDestInput(cfg.destination);
    setMapData({
      sourceCoords:  cfg.sourceCoords,
      destCoords:    cfg.destCoords,
      currentCoords: cfg.currentCoords,
      routeA:        cfg.routeA,
      routeB:        cfg.routeB,
    });
    setData({
      truck_id:       cfg.truck_id,
      source:         cfg.source,
      destination:    cfg.destination,
      current_location: cfg.current_location,
      speed:          cfg.speed,
      weather:        cfg.weather,
      traffic_level:  cfg.traffic_level,
      delay_risk:     cfg.delay_risk,
      eta:            cfg.eta,
      current_route:  cfg.current_route,
    });
    setScenario(cfg.scenario);
  };

  /* ── Manual route update via FastAPI (optional) ── */
  const handleUpdateRoute = async () => {
    if (!sourceInput || !destInput) return;
    setIsUpdating(true);
    setAiScanning(true);
    try {
      const res = await fetch('http://localhost:8000/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: sourceInput, destination: destInput }),
      });
      const result = await res.json();
      setMapData({
        sourceCoords: result.source_coords, destCoords: result.dest_coords,
        currentCoords: result.midpoint, routeA: result.route_a, routeB: result.route_b,
      });
      setData(prev => ({
        ...prev, source: result.source, destination: result.destination,
        current_location: result.current_location, current_route: 'Standard Path',
        delay_risk: 15, eta: '5.0 hours',
      }));
      setScenario('normal');
    } catch {
      /* API not running — use nearest preset */
      const match = Object.values(TRUCK_CONFIGS).find(
        c => c.source.toLowerCase() === sourceInput.toLowerCase() ||
             c.destination.toLowerCase() === destInput.toLowerCase()
      ) || TRUCK_CONFIGS['TRK-101'];
      loadTruck(match.truck_id);
    } finally {
      setIsUpdating(false);
      setTimeout(() => setAiScanning(false), 1000);
    }
  };

  /* ── AI delay prediction ── */
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            speed:   scenario === 'disrupted' ? 25 : 65,
            weather: scenario === 'disrupted' ? 'Heavy Rain' : 'Clear',
            traffic: scenario === 'disrupted' ? 'High' : 'Low',
          }),
        });
        const result = await res.json();
        setData(prev => ({
          ...prev,
          speed:        scenario === 'disrupted' ? 25 : 65,
          weather:      scenario === 'disrupted' ? 'Heavy Rain' : 'Clear',
          traffic_level: scenario === 'disrupted' ? 'High' : 'Low',
          delay_risk:   result.delay_risk_percentage,
          eta:          scenario === 'disrupted' ? '8.5 hours' : '5.0 hours',
          current_route: scenario === 'disrupted' ? 'NH44 (Standard)' : prev.current_route,
        }));
      } catch { /* FastAPI offline — keep preset values */ }
    };
    fetchPrediction();
  }, [scenario]);

  const handleSimulate = () => setScenario(s => s === 'normal' ? 'disrupted' : 'normal');

  const executeRouteOptimization = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/optimize/${data.truck_id}`);
      const result = await res.json();
      setData(prev => ({ ...prev, current_route: result.suggested_route, eta: result.suggested_eta, delay_risk: 40 }));
    } catch {
      setData(prev => ({ ...prev, current_route: 'Alternative Bypass (Optimized)', eta: '6.0 hours', delay_risk: 38 }));
    }
  };

  const getRiskColorCls = (r) => r < 40 ? 'risk-level-green' : r < 70 ? 'risk-level-yellow' : 'risk-level-red';
  const getRiskLabel    = (r) => r < 40 ? 'Low Risk' : r < 70 ? 'Moderate Risk' : 'High Risk';

  return (
    <div className="tracking-page">

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h2 className="page-title">Live Tracking</h2>
          <p className="page-subtitle">Real-time shipment telemetry · AI delay prediction · Dynamic route optimization</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {aiScanning && <span className="ai-scanning-badge"><Zap size={12} /> AI Scanning…</span>}
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Inject Disruption:</span>
          <button className="demo-btn" onClick={handleSimulate}>
            {scenario === 'normal' ? '⚡ Simulate Disruption' : '↺ Reset System'}
          </button>
        </div>
      </div>

      {/* ── Truck Selector ── */}
      <div className="truck-selector">
        <span className="truck-selector-label"><Truck size={14} /> Select Shipment</span>
        {TRUCK_IDS.map(id => {
          const cfg = TRUCK_CONFIGS[id];
          const rc  = getRiskColor(cfg.delay_risk);
          return (
            <button
              key={id}
              className={`truck-pill ${selectedId === id ? 'truck-pill-active' : ''}`}
              onClick={() => loadTruck(id)}
            >
              <span className="truck-pill-id">{id}</span>
              <span className="truck-pill-route">{cfg.source} → {cfg.destination}</span>
              <span className="truck-pill-risk" style={{ color: rc }}>
                {cfg.delay_risk}%
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Map + Side Panel ── */}
      <div className="tracking-layout">
        <div className="map-section">
          <MapContainer
            center={mapData.currentCoords}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={mapData.currentCoords} />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <Marker position={mapData.sourceCoords}><Popup>📍 Source: {data.source}</Popup></Marker>
            <Marker position={mapData.destCoords}><Popup>🏁 Destination: {data.destination}</Popup></Marker>
            <Marker position={mapData.currentCoords}>
              <Popup>
                <strong>{data.truck_id}</strong><br />
                📍 {data.current_location}<br />
                🚀 {data.speed} km/h
              </Popup>
            </Marker>
            <Polyline
              positions={mapData.routeA}
              color={scenario === 'disrupted' && !data.current_route.includes('Alternative') ? '#ef4444' : '#3b82f6'}
              weight={4}
              dashArray={scenario === 'disrupted' && !data.current_route.includes('Alternative') ? '6 10' : undefined}
            />
            {data.current_route.includes('Alternative') && (
              <Polyline positions={mapData.routeB} color="#10b981" weight={4} dashArray="8 8" />
            )}
          </MapContainer>

          {/* Map overlay */}
          <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, background: 'rgba(5,10,25,0.92)', padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', fontWeight: 600 }}>
            <MapIcon size={14} style={{ color: '#3b82f6' }} />
            {data.current_route}
            {scenario === 'disrupted' && !data.current_route.includes('Alternative') && (
              <span style={{ color: '#ef4444', fontSize: '0.7rem', marginLeft: 4 }}>⚠ DISRUPTED</span>
            )}
            {data.current_route.includes('Alternative') && (
              <span style={{ color: '#10b981', fontSize: '0.7rem', marginLeft: 4 }}>✓ OPTIMIZED</span>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <aside className="side-panel">

          {/* Journey Selector */}
          <div className="card">
            <div className="card-title"><MapIcon size={18} /> Manual Route Input</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input value={sourceInput} onChange={e => setSourceInput(e.target.value)}
                placeholder="Source City" style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'white', fontFamily: 'inherit', fontSize: '0.875rem' }} />
              <input value={destInput} onChange={e => setDestInput(e.target.value)}
                placeholder="Destination City" style={{ width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: 'white', fontFamily: 'inherit', fontSize: '0.875rem' }} />
              <button onClick={handleUpdateRoute} disabled={isUpdating}
                style={{ width: '100%', padding: '0.7rem', borderRadius: 8, background: 'var(--accent-blue)', color: 'white', fontWeight: 700, border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.6 : 1, fontFamily: 'inherit' }}>
                {isUpdating ? '🤖 AI Analyzing…' : 'Analyze Route'}
              </button>
            </div>
          </div>

          {/* Shipment Info */}
          <div className="card">
            <div className="card-title"><Truck size={18} /> Shipment Telemetry</div>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.truck_id}</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                {data.source} <ChevronRight size={13} /> {data.destination}
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-label">Location</div>
                <div className="stat-value" style={{ fontSize: '0.9rem' }}>{data.current_location}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Speed</div>
                <div className="stat-value">{data.speed} km/h</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Weather</div>
                <div className="stat-value" style={{ fontSize: '0.85rem', color: scenario === 'disrupted' ? '#ef4444' : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {scenario === 'disrupted' && <CloudLightning size={14} />}
                  {data.weather}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Traffic</div>
                <div className="stat-value" style={{ color: scenario === 'disrupted' ? '#ef4444' : '#10b981' }}>{data.traffic_level}</div>
              </div>
            </div>
          </div>

          {/* AI Risk Analysis */}
          <div className="card">
            <div className="card-title"><ShieldAlert size={18} /> AI Risk Analysis</div>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, lineHeight: 1, color: getRiskColor(data.delay_risk) }}>{data.delay_risk}%</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>{getRiskLabel(data.delay_risk)}</div>
            </div>
            <div className="risk-gauge">
              <div className={`risk-fill ${getRiskColorCls(data.delay_risk)}`} style={{ width: `${data.delay_risk}%` }} />
            </div>
            {scenario === 'disrupted' && data.delay_risk > 80 && (
              <div className="alert-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>
                  <AlertTriangle size={16} /> Disruption Flagged — Cascade Risk HIGH
                </div>
                <p style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.5 }}>
                  AI preemptively detected {data.weather} + {data.traffic_level} convergence at current transit node. Delivery timeline mathematically compromised — immediate action required.
                </p>
              </div>
            )}
          </div>

          {/* Route Optimization */}
          <div className="card">
            <div className="card-title"><Route size={18} /> Dynamic Optimization</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Estimated ETA</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: scenario === 'disrupted' && !data.current_route.includes('Alternative') ? '#ef4444' : 'inherit' }}>
                <Clock size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                {data.eta}
              </span>
            </div>
            {scenario === 'disrupted' && data.delay_risk > 80 && !data.current_route.includes('Alternative') && (
              <div className="recommendation active">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>
                  <Navigation size={16} /> Optimized Alternative Route Found
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6ee7b7', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  AI calculated bypass route to avoid localized bottleneck before cascade propagation. Prevents ~2.5h delay to downstream shipments.
                </p>
                <button onClick={executeRouteOptimization} className="optimize-btn">
                  <Navigation size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  Execute Dynamic Rerouting
                </button>
              </div>
            )}
            {data.current_route.includes('Alternative') && (
              <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 10, color: '#10b981', textAlign: 'center', fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)', fontSize: '0.9rem' }}>
                ✓ Cascade Prevented · Route Adjusted
              </div>
            )}
            {scenario === 'normal' && (
              <div style={{ padding: '0.85rem 1rem', background: 'rgba(16,185,129,0.06)', borderRadius: 10, color: '#10b981', fontSize: '0.82rem', border: '1px solid rgba(16,185,129,0.2)' }}>
                ✅ All clear — No disruptions on current route
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}
