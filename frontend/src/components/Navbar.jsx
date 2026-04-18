import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Map,
  BrainCircuit,
  Activity,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const navItems = [
  { to: '/',           label: 'Mission Control', icon: LayoutDashboard },
  { to: '/inventory',  label: 'Inventory',       icon: Package },
  { to: '/orders',     label: 'Orders',          icon: ShoppingCart },
  { to: '/tracking',   label: 'Live Tracking',   icon: Map },
  { to: '/demand-ai',  label: 'Demand AI',       icon: BrainCircuit },
];

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <nav className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <Zap className="sidebar-logo-icon" size={22} />
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">SupplySense</span>
            <span className="sidebar-logo-sub">AI Platform</span>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Status indicator */}
      {!collapsed && (
        <div className="sidebar-status">
          <Activity size={12} className="status-pulse-icon" />
          <span>System Online</span>
        </div>
      )}

      {/* Nav Links */}
      <ul className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              title={collapsed ? label : ''}
            >
              <Icon size={20} className="sidebar-link-icon" />
              {!collapsed && <span className="sidebar-link-label">{label}</span>}
              {!collapsed && (
                <span className="sidebar-link-indicator" />
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">v2.0 · Smart Supply Chain</div>
        </div>
      )}
    </nav>
  );
}
