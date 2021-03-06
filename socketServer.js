// let users = [];

// const SocketServer = (socket) => {
//   users.push({ id: socket.user.id, socketId: socket.id });

//   socket.on("disconnect", () => {
//     users = users.filter((user) => user.socketId !== socket.id);
//   });

//   // Like Comment
//   socket.on("likeComment", (newComment) => {
//     //console.log(newComment);
//     const clients = users.filter((user) => newComment.likeComment.likes.includes(user.id));
//     if(clients.length > 0) {
//       clients.forEach(client => {
//         socket.to(`${client.socketId}`).emit('likeToClient', newComment);
//       })
//     }
//   });
// };

// module.exports = SocketServer;

module.exports.sendNotification = (req, notification) => {
  const io = req.app.get("socketio");
  const receiverId = String(notification.receiver);
  io.sockets.in(receiverId).emit("newNotification", notification);
};
