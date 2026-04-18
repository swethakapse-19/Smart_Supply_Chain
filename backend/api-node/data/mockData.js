// Mock data for Smart Supply Chain backend
// Mirrors the frontend mock data for consistency

const products = [
  { _id: '1',  name: 'MacBook Pro 14"',    category: 'Electronics', stock: 32,  price: 189999, sku: 'ELEC-0021' },
  { _id: '2',  name: 'Samsung 4K Monitor',  category: 'Electronics', stock: 8,   price: 34999,  sku: 'ELEC-0022' },
  { _id: '3',  name: 'Winter Jacket XL',    category: 'Apparel',     stock: 145, price: 3499,   sku: 'APRL-0011' },
  { _id: '4',  name: 'Vitamin C 1000mg',    category: 'Pharma',      stock: 6,   price: 299,    sku: 'PHRM-0043' },
  { _id: '5',  name: 'Industrial Pump 5HP', category: 'Industrial',  stock: 19,  price: 54000,  sku: 'INDS-0007' },
  { _id: '6',  name: 'Organic Green Tea',   category: 'Food & Bev',  stock: 3,   price: 449,    sku: 'FOOD-0088' },
  { _id: '7',  name: 'Wireless Mouse',      category: 'Electronics', stock: 57,  price: 1299,   sku: 'ELEC-0031' },
  { _id: '8',  name: 'Cargo Pants M',       category: 'Apparel',     stock: 78,  price: 1899,   sku: 'APRL-0019' },
  { _id: '9',  name: 'Paracetamol 500mg',   category: 'Pharma',      stock: 4,   price: 49,     sku: 'PHRM-0011' },
  { _id: '10', name: 'Steel Bearing Set',   category: 'Industrial',  stock: 212, price: 8500,   sku: 'INDS-0015' },
  { _id: '11', name: 'Cold Brew Coffee',    category: 'Food & Bev',  stock: 44,  price: 799,    sku: 'FOOD-0054' },
  { _id: '12', name: 'USB-C Hub 7-in-1',   category: 'Electronics', stock: 9,   price: 2499,   sku: 'ELEC-0045' },
];

const orders = [
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

module.exports = { products, orders };
