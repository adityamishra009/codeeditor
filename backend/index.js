import express from 'express'
import http from 'http'
import { Server } from 'socket.io';

const app= express()

const server = http.createServer(app);

const io = new Server(server,{
  cors: {
    origin:"*",
  },
});

const rooms = new Map();

io.on("connection",(socket)=>{
  console.log("user connected",socket.id);

  let currentRoom=null;
  let currentUser=null;

  socket.on("join",({roomid,username})=>{
    if(currentRoom){
      socket.leave(currentRoom)
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userjoined",Array.from(rooms.get(currentRoom)));
    }
    currentRoom=roomid;
    currentUser=username;

    socket.join(roomid)
    if(!rooms.has(roomid)){
      rooms.set(roomid,new Set());
    }
    rooms.get(roomid).add(username)
    io.to(roomid).emit("userjoined",Array.from(rooms.get(currentRoom)));
    console.log("user joined",);


  });
});
const port = process.env.PORT || 5173;

server.listen(port,()=>{
  console.log('server is working');
});
