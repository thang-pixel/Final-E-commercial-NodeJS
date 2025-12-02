const registerProductSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected to product socket, socket id: ', socket.id);

    socket.on('product:join', (product_id) => {
      const room = `product_${product_id}`;

      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('product:leave', (product_id) => {
      const room = `product_${product_id}`;

      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('comment:typing', ({ product_id }) => {
      socket.to(`product_${product_id}`).emit('comment:typing', { product_id });
    });

    // comment new đã broadcast trong controller rồi

    // admin join để nhận thông báo 
    socket.on('admin:join', () => {
      const room = `admins_room`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    })

    socket.on('disconnect', () => {
      console.log(
        'A user disconnected from product socket, socket id: ',
        socket.id
      );
    });
  });
};

module.exports = registerProductSocket;
