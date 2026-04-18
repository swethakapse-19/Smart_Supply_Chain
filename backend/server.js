// ── Smart Supply Chain Backend ──────────────────────────────────────────────
// Node.js + Express  |  Port 5000  |  MongoDB-ready (uses mock data if no URI)

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');

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

// ── DEMAND FORECAST ───────────────────────────────────────────────────────────
app.get('/api/demand', (req, res) => {
  const generateForecast = (base) =>
    ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'].map((m, i) => ({
      period:   m,
      actual:   i < 4 ? Math.round(base * (0.7 + Math.random() * 0.5)) : null,
      forecast: i >= 3 ? Math.round(base * (1 + (i - 3) * 0.08)) : null,
    }));

  res.json({
    products: [
      { id: '1', name: 'MacBook Pro 14"',   forecast: generateForecast(18) },
      { id: '2', name: 'Samsung 4K Monitor', forecast: generateForecast(12) },
      { id: '3', name: 'Vitamin C 1000mg',   forecast: generateForecast(40) },
      { id: '4', name: 'Organic Green Tea',  forecast: generateForecast(30) },
    ],
  });
});

app.get('/api/demand/:productId', (req, res) => {
  const bases = { '1': 18, '2': 12, '3': 40, '4': 30, '5': 22 };
  const base  = bases[req.params.productId] || 20;
  res.json({
    productId: req.params.productId,
    forecast: ['Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'].map((m, i) => ({
      period:   m,
      actual:   i < 4 ? Math.round(base * (0.7 + Math.random() * 0.5)) : null,
      forecast: i >= 3 ? Math.round(base * (1 + (i - 3) * 0.08)) : null,
    })),
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  Smart Supply Chain API`);
  console.log(`    http://localhost:${PORT}`);
  console.log(`    DB: ${MONGO_URI ? 'MongoDB' : 'In-memory mock data'}\n`);
});
