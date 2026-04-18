import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import LiveTracking from './pages/LiveTracking';
import DemandAI from './pages/DemandAI';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders"    element={<Orders />} />
            <Route path="/tracking"  element={<LiveTracking />} />
            <Route path="/demand-ai" element={<DemandAI />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
