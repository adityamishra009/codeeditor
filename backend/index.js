// this is backend

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // For dev, allow all. In prod, specify your frontend domain
  },
});

// Map to store roomId => Set of usernames
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, UserName }) => {
    if (!roomId || !UserName) {
      console.warn("Invalid join attempt:", { roomId, UserName });
      return;
    }

    // Leave previous room if need
    if (currentRoom) {
      socket.leave(currentRoom);
      if (rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }
    }

    currentRoom = roomId;
    currentUser = UserName;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(UserName);

    io.to(roomId).emit("userJoined", Array.from(rooms.get(roomId)));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    if (roomId) {
      socket.to(roomId).emit("codeUpdate", code);
    }
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      if (rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }

      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing",({roomId,UserName})=>{
    socket.to(roomId).emit("userTyping",UserName)
  })

  socket.on("languagechange",({roomId,language})=>{
    io.to(roomId).emit("languageupdate",language)
  })

  socket.on("compilecode",async({code,roomId,language,version})=>{
    if(rooms.has(roomId)) {
      const room= rooms.get(roomId)
      const response= await axios.post("https://emkc.org/api/v2/piston/execute",{
        language,
        version,
        files:[
          {
            content:code
          }
        ]
      })
      room.output = response.data.run.output;
      io.to(roomId).emit("codeResponse",response.data);
    }
  })

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      if (rooms.has(currentRoom)) {
        rooms.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

//port changed from 5173 to 3000
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
