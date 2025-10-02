require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Order = require('./models/Order');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8003;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ordersdb';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';
const PRODUCTS_URL = process.env.PRODUCTS_URL || 'http://localhost:8002';

mongoose
    .connect(MONGO_URI)
    .then(() => console.log('Orders DB connected'))
    .catch((err) => console.error(err));

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

app.get('/health', (_, res) => res.json({ ok: true, service: 'orders' }));

// Create order: items=[{productId, qty}]
// app.post('/', authRequired, async (req, res) => {
//   const { items } = req.body;
//   if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'No items' });

//   try {
//     const detailed = [];
//     for (const it of items) {
//       if (!it.productId || !Number.isInteger(it.qty) || it.qty <= 0) {
//         return res.status(400).json({ error: 'Invalid item' });
//       }
//       const { data: p } = await axios.get(`${PRODUCTS_URL}/:id`.replace(':id', it.productId));
//       detailed.push({ product: p, qty: it.qty });
//     }

//     const total = detailed.reduce((sum, d) => sum + d.product.price * d.qty, 0);

//     // Reserve stock
//     for (const d of detailed) {
//       await axios.patch(
//         `${PRODUCTS_URL}/:id/reserve`.replace(':id', d.product._id),
//         { qty: d.qty },
//         { headers: { Authorization: req.headers.authorization } }
//       );
//     }

//     const order = await Order.create({
//       userId: req.user.id,
//       items: detailed.map(d => ({
//         productId: d.product._id,
//         title: d.product.title,
//         price: d.product.price,
//         qty: d.qty
//       })),
//       total
//     });

//     res.status(201).json(order);
//   } catch (err) {
//     console.error(err?.response?.data || err.message);
//     res.status(400).json({ error: 'Failed to create order', detail: err?.response?.data || err.message });
//   }
// });

// List my orders
app.get('/me', authRequired, async (req, res) => {
    const orders = await Order.find({ userId: req.user.id }).sort({
        createdAt: -1,
    });
    res.json(orders);
});

app.listen(PORT, () => console.log(`Orders service on ${PORT}`));
