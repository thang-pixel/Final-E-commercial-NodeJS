require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Product = require('./models/Product');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/productsdb';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

mongoose.connect(MONGO_URI).then(()=>console.log('Products DB connected')).catch(err=>console.error(err));

function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (_, res) => res.json({ ok: true, service: 'products' }));

// Create product (require ADMIN)
app.post('/', authRequired, async (req, res) => {
  // if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  // const { title, price, stock, isActive } = req.body;
  // if (typeof title !== 'string' || typeof price !== 'number' || !Number.isInteger(stock)) {
  //   return res.status(400).json({ error: 'Invalid fields' });
  // }
  // const p = await Product.create({ title, price, stock, isActive });
  // res.status(201).json(p);
});

// List & Get
app.get('/', async (req, res) => {
  const items = await Product.find({ isActive: true });
  res.json(items);
});
app.get('/:id', async (req, res) => {
  // const p = await Product.findById(req.params.id);
  const p = { id: 1, name: 'Sample', price: 100000}
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Reserve stock (atomic decrement, optimistic)
// app.patch('/:id/reserve', authRequired, async (req, res) => {
//   const { qty } = req.body;
//   if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ error: 'Invalid qty' });

//   const updated = await Product.findOneAndUpdate(
//     { _id: req.params.id, stock: { $gte: qty }, isActive: true },
//     { $inc: { stock: -qty } },
//     { new: true }
//   );
//   if (!updated) return res.status(409).json({ error: 'Insufficient stock' });
//   res.json({ ok: true, productId: updated._id, remaining: updated.stock });
// });

app.listen(PORT, () => console.log(`Products service on ${PORT}`));
  