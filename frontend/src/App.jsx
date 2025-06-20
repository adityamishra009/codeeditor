import { useState } from 'react';
import "./App.css";
import io from 'socket.io-client'


const socket = io("http://localhost:3000/");


const App = () => {

  const [joined,setjoined]=useState(false);
  const[RoomId,setRoomId]=useState("");
  const[UserName,setUserName]=useState("");

  const joinRoom = () => {
    // console.log(RoomId, UserName);
    if(RoomId && UserName){
      socket.emit("join", { RoomId, UserName});
      setjoined(true)
    }
  }

  
  if(!joined){
     return (
     <div className="join-container">
         <div className="join-form">
          <h1>Join Code Room</h1>
          <input 
            type="text" 
            placeholder="Room Id"
            value={RoomId}
            onChange={(e)=>setRoomId(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Your Name"
            value={UserName}
            onChange={(e)=>setUserName(e.target.value)}
          />
          <button onClick={joinRoom} >join Room</button>
        </div>
      </div>
    );
  }
};

export default App;
