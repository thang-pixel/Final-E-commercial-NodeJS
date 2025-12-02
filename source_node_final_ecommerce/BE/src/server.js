const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const registerProductSocket = require('./sockets/productSocket');
const { setIO } = require('./services/notificationService');
const PORT = process.env.PORT || 8000;

// Toj http server tu express app
const server = http.createServer(app);

// khoi tao Socket.IO
const allowOrigins = ['http://localhost:3000'];

const io = new Server(server, {
  cors: {
    // origin: true,           // hoặc set cụ thể: 'http://localhost:3000'
    // credentials: true,
    origin: (origin, callback) => {
      // Cho phép request không có origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowOrigins.includes(origin)) {
        callback(null, true); // cho phép
      } else {
        callback(new Error('Not allowed by CORS'), false); // chặn
      }
    },
    credentials: true, // nếu cần gửi cookie/session
  },
});

// Cho phep truy cap io tu req.app.get('io')
app.set('io', io); 
setIO(io);

// Danh ky cac event websocket cho product
registerProductSocket(io);

// listen server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
