// ── Smart Supply Chain Backend ──────────────────────────────────────────────
// Node.js + Express  |  Port 5000  |  MongoDB-ready (uses mock data if no URI)

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const neo4j    = require('neo4j-driver');

const app  = express();
const PORT = process.env.PORT || 5000;   // Cloud Run sets PORT automatically

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allow both local dev and Firebase Hosting production domain
const allowedOrigins = [
  'http://localhost:5173',                  // Vite dev server
  'http://localhost:4173',                  // Vite preview
  /https:\/\/.*\.web\.app$/,               // Firebase Hosting (*.web.app)
  /https:\/\/.*\.firebaseapp\.com$/,       // Firebase Hosting (*.firebaseapp.com)
  /https:\/\/.*\.run\.app$/,               // Cloud Run (self-calls)
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow curl/Postman
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('CORS blocked'), allowed);
  },
  credentials: true,
}));

app.use(express.json());

// ── MongoDB connect (optional — falls back to mock data) ─────────────────────
const MONGO_URI = process.env.MONGO_URI || '';

if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅  MongoDB connected'))
    .catch(err => console.warn('⚠️   MongoDB connection failed:', err.message));
}

// ── Neo4j GraphDB connect (optional) ─────────────────────────────────────────
const NEO4J_URI      = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER     = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

let driver;
try {
  if (NEO4J_PASSWORD) {
    driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    console.log('🔗  Neo4j Driver initialized');
  }
} catch (err) {
  console.warn('⚠️   Neo4j Driver failed to initialize:', err.message);
}

// ── Mongoose Schemas (used if MongoDB is connected) ──────────────────────────
const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  category: { type: String, required: true },
  sku:      { type: String, required: true },
  stock:    { type: Number, required: true },
  price:    { type: Number, required: true },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  product:  String,
  customer: String,
  quantity: Number,
  total:    Number,
  status:   { type: String, enum: ['Pending', 'Shipped', 'Delivered'], default: 'Pending' },
  city:     String,
  date:     String,
  eta:      String,
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Order   = mongoose.model('Order',   orderSchema);

// ── Mock Data (used when MongoDB is not connected) ───────────────────────────
const { products: mockProducts, orders: mockOrders } = require('./data/mockData');

let inMemoryProducts = [...mockProducts];
let inMemoryOrders   = [...mockOrders];

const useDB = () => mongoose.connection.readyState === 1;

// ── Helper: compute status ───────────────────────────────────────────────────
const getStatus = (stock) => {
  if (stock < 5)  return 'Critical';
  if (stock < 10) return 'Low Stock';
  return 'In Stock';
};

// ═══════════════════════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '🚀 Smart Supply Chain API running', db: useDB() ? 'MongoDB' : 'Mock' });
});

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const data = useDB()
      ? await Product.find().sort({ createdAt: -1 })
      : inMemoryProducts.map(p => ({ ...p, status: getStatus(p.stock) }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    if (useDB()) {
      const product = await Product.create(req.body);
      return res.status(201).json(product);
    }
    const newP = { ...req.body, _id: String(Date.now()), status: getStatus(req.body.stock) };
    inMemoryProducts.unshift(newP);
    res.status(201).json(newP);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    if (useDB()) {
      const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(p);
    }
    inMemoryProducts = inMemoryProducts.map(p =>
      p._id === req.params.id ? { ...p, ...req.body, status: getStatus(req.body.stock ?? p.stock) } : p
    );
    res.json(inMemoryProducts.find(p => p._id === req.params.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const data = useDB()
      ? await Order.find().sort({ createdAt: -1 })
      : inMemoryOrders;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    if (useDB()) {
      const o = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json(o);
    }
    inMemoryOrders = inMemoryOrders.map(o =>
      o._id === req.params.id ? { ...o, ...req.body } : o
    );
    res.json(inMemoryOrders.find(o => o._id === req.params.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// ── DASHBOARD KPIs ────────────────────────────────────────────────────────────
app.get('/api/dashboard', async (req, res) => {
  try {
    const products = useDB() ? await Product.find() : inMemoryProducts;
    const orders   = useDB() ? await Order.find()   : inMemoryOrders;

    const inventoryValue  = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStockAlerts  = products.filter(p => p.stock < 10).length;
    const revenueThisMonth = orders.reduce((s, o) => s + (o.total || 0), 0);

    res.json({
      kpis: {
        totalProducts:    products.length,
        totalOrders:      orders.length,
        inventoryValue,
        lowStockAlerts,
        ordersThisWeek:   orders.filter(o => o.status !== 'Delivered').length,
        revenueThisMonth,
      },
      salesTrend: [
        { month: 'Nov', sales: 52000, orders: 28 },
        { month: 'Dec', sales: 78000, orders: 42 },
        { month: 'Jan', sales: 61000, orders: 35 },
        { month: 'Feb', sales: 85000, orders: 48 },
        { month: 'Mar', sales: 72000, orders: 39 },
        { month: 'Apr', sales: revenueThisMonth || 94200, orders: orders.length },
      ],
      categoryStock: [
        { category: 'Electronics', stock: products.filter(p => p.category === 'Electronics').reduce((s, p) => s + p.stock, 0) || 420 },
        { category: 'Apparel',     stock: products.filter(p => p.category === 'Apparel').reduce((s, p) => s + p.stock, 0) || 810 },
        { category: 'Food & Bev',  stock: products.filter(p => p.category === 'Food & Bev').reduce((s, p) => s + p.stock, 0) || 260 },
        { category: 'Industrial',  stock: products.filter(p => p.category === 'Industrial').reduce((s, p) => s + p.stock, 0) || 590 },
        { category: 'Pharma',      stock: products.filter(p => p.category === 'Pharma').reduce((s, p) => s + p.stock, 0) || 130 },
      ],
      recentOrders: orders.slice(0, 4).map(o => ({
        id: o._id, product: o.product, status: o.status, eta: o.eta || '—',
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GRAPH DB ENDPOINTS ───────────────────────────────────────────────────────

// 1. Seed the Graph (Manual Sync)
app.post('/api/graph/seed', async (req, res) => {
  if (!driver) return res.status(503).json({ error: 'Neo4j driver not initialized' });
  const session = driver.session();
  try {
    // Clear and Seed
    await session.run(`
      MATCH (n) DETACH DELETE n;
    `);
    
    // Create Cities and Warehouses
    await session.run(`
      CREATE (mumbai:City {name: 'Mumbai', id: 'MUM'})
      CREATE (pune:City {name: 'Pune', id: 'PUN'})
      CREATE (hyd:City {name: 'Hyderabad', id: 'HYD'})
      CREATE (blr:City {name: 'Bangalore', id: 'BLR'})
      
      CREATE (wh1:Warehouse {id: 'WH-WEST', name: 'Western Hub'})
      CREATE (wh2:Warehouse {id: 'WH-SOUTH', name: 'Southern Hub'})
      
      CREATE (wh1)-[:LOCATED_IN]->(mumbai)
      CREATE (wh2)-[:LOCATED_IN]->(hyd)
      
      CREATE (mumbai)-[:CONNECTED_TO {distance: 150}]->(pune)
      CREATE (pune)-[:CONNECTED_TO {distance: 700}]->(hyd)
      CREATE (hyd)-[:CONNECTED_TO {distance: 570}]->(blr)
    `);

    // Link Products to Warehouses
    for (const p of inMemoryProducts) {
      const wh = p.category === 'Electronics' ? 'WH-WEST' : 'WH-SOUTH';
      await session.run(`
        MATCH (wh:Warehouse {id: $wh_id})
        CREATE (prod:Product {id: $pid, name: $name, sku: $sku})
        CREATE (prod)-[:STOCKED_IN]->(wh)
      `, { wh_id: wh, pid: p._id, name: p.name, sku: p.sku });
    }

    res.json({ message: '✅ Graph Seeded Successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// 2. Cascade Analysis (Disruption Forecasting)
app.get('/api/graph/cascade/:cityId', async (req, res) => {
  if (!driver) return res.status(503).json({ error: 'Neo4j driver not initialized' });
  const session = driver.session();
  try {
    const cityId = req.params.cityId.toUpperCase();
    const result = await session.run(`
      MATCH (disrupted:City {id: $cityId})
      OPTIONAL MATCH (disrupted)<-[:LOCATED_IN]-(wh:Warehouse)
      OPTIONAL MATCH (wh)<-[:STOCKED_IN]-(p:Product)
      RETURN disrupted.name as city, collect(distinct wh.name) as hubs, collect(distinct p.name) as impactedProducts
    `, { cityId });

    const record = result.records[0];
    res.json({
      disruptedCity: record.get('city'),
      impactedHubs: record.get('hubs'),
      atRiskProducts: record.get('impactedProducts'),
      severity: record.get('hubs').length > 0 ? 'CRITICAL' : 'LOW'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// 3. Get Network (for visualization)
app.get('/api/graph/network', async (req, res) => {
  if (!driver) return res.status(503).json({ error: 'Neo4j driver not initialized' });
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (n)-[r]->(m)
      RETURN n, type(r) as rel, m
    `);
    const network = result.records.map(rec => ({
      from: rec.get('n').properties.name || rec.get('n').properties.id,
      to: rec.get('m').properties.name || rec.get('m').properties.id,
      type: rec.get('rel')
    }));
    res.json(network);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Smart Supply Chain API`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`    DB: ${MONGO_URI ? 'MongoDB' : 'In-memory mock data'}\n`);
});
