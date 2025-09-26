require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 8001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/usersdb';
const JWT_SECRET = process.env.JWT_SECRET || 'change_me';

mongoose.connect(MONGO_URI).then(()=>console.log('Users DB connected')).catch(err=>console.error(err));

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

app.get('/health', (_, res) => res.json({ ok: true, service: 'users' }));

// Register
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role || 'USER' });
  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});   

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token });
});

// Me
app.get('/me', authRequired, async (req, res) => {
  const u = await User.findById(req.user.id).select('_id name email role');
  res.json(u);
});

app.listen(PORT, () => console.log(`Users service on ${PORT}`));
