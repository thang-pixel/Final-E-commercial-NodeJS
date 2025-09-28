require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
app.use(cors());
app.use(morgan('tiny'));

const PORT = process.env.GATEWAY_PORT || 8000;
const USERS_TARGET = process.env.USERS_TARGET || 'http://users:8001';
const PRODUCTS_TARGET = process.env.PRODUCTS_TARGET || 'http://products:8002';
const ORDERS_TARGET = process.env.ORDERS_TARGET || 'http://orders:8003';

app.get('/health', (_, res) => res.json({ ok: true, service: 'gateway' }));

app.use('/api/users', createProxyMiddleware({ target: USERS_TARGET, changeOrigin: true, pathRewrite: { '^/api/users': '' } }));
app.use('/api/products', createProxyMiddleware({ target: PRODUCTS_TARGET, changeOrigin: true, pathRewrite: { '^/api/products': '' } }));
app.use('/api/orders', createProxyMiddleware({ target: ORDERS_TARGET, changeOrigin: true, pathRewrite: { '^/api/orders': '' } }));

app.listen(PORT, () => console.log(`API Gateway on ${PORT}`));
