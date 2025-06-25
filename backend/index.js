// import express from 'express'
// import http from 'http'
// import { Server } from 'socket.io';

// const app= express()

// const server = http.createServer(app);

// const io = new Server(server,{
//   cors: {
//     origin:"*",
//   },
// });

// const rooms = new Map();

// io.on("connection",(socket)=>{
//   console.log("user connected",socket.id);

//   let currentRoom=null;
//   let currentUser=null;

//   socket.on("join",({roomid,username})=>{
//     if(currentRoom){
//       socket.leave(currentRoom)
//       rooms.get(currentRoom).delete(currentUser);
//       io.to(currentRoom).emit("userJoined",Array.from(rooms.get(currentRoom)));
//     }
//     currentRoom=roomid;
//     currentUser=username;

//     socket.join(roomid);

//     if(!rooms.has(roomid)){
//       rooms.set(roomid,new Set());
//     }
//     rooms.get(roomid).add(username);

//     io.to(roomid).emit("userJoined",Array.from(rooms.get(currentRoom)));
 
//   });

//   socket.on("codeChange", ({ roomId, code }) => {
//     socket.to(roomId).emit("codeUpdate", code);
//   });

//   socket.on("leaveRoom", () => {
//     if (currentRoom && currentUser) {
//       rooms.get(currentRoom).delete(currentUser);
//       io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));

//       socket.leave(currentRoom);

//       currentRoom = null;
//       currentUser = null;
//     }
//   });

//   socket.on("disconnect", () => {
//     if (currentRoom && currentUser) {
//       rooms.get(currentRoom).delete(currentUser);
//       io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
//     }
//     console.log("user Disconnected");
//   });
// });


// const port = process.env.PORT || 3000;

// server.listen(port,()=>{
//   console.log('server is working on port 3000');
// });


import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

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

    // Leave previous room if needed
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

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
