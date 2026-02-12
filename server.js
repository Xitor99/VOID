const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  // Создание комнаты
  socket.on('create-room', () => {
    const roomId = generateRoomId();
    rooms.set(roomId, new Set([socket.id]));
    socket.join(roomId);
    socket.emit('room-created', roomId);
    console.log(`Комната создана: ${roomId} пользователем ${socket.id}`);
  });

  // Подключение к комнате
  socket.on('join-room', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      room.add(socket.id);
      socket.join(roomId);
      
      // Уведомляем всех в комнате о новом участнике
      socket.to(roomId).emit('user-connected', socket.id);
      
      // Отправляем список существующих участников новому пользователю
      const existingUsers = Array.from(room).filter(id => id !== socket.id);
      socket.emit('existing-users', existingUsers);
      
      console.log(`Пользователь ${socket.id} подключился к комнате ${roomId}`);
    } else {
      socket.emit('error', 'Комната не найдена');
    }
  });

  // WebRTC сигнализация
  socket.on('offer', (data) => {
    socket.to(data.target).emit('offer', {
      sdp: data.sdp,
      sender: socket.id
    });
  });

  socket.on('answer', (data) => {
    socket.to(data.target).emit('answer', {
      sdp: data.sdp,
      sender: socket.id
    });
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      sender: socket.id
    });
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
    
    // Удаляем пользователя из всех комнат
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        
        if (participants.size === 0) {
          rooms.delete(roomId);
          console.log(`Комната ${roomId} удалена`);
        }
      }
    });
  });
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});