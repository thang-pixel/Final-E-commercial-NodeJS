const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const registerProductSocket = require('./sockets/productSocket');
const PORT = process.env.PORT || 8000;

// Toj http server tu express app
const server = http.createServer(app);

// khoi tao Socket.IO
const io = new Server(server, {
  cors: {
    origin: true,           // hoặc set cụ thể: 'http://localhost:3000'
    credentials: true,
  }
})

// Cho phep truy cap io tu req.app.get('io')
app.set('io', io);

// Danh ky cac event websocket cho product
registerProductSocket(io);

// listen server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});