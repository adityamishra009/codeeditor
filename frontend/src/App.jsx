import { useState } from 'react';
import "./App.css";
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';


const socket = io("http://localhost:5173/");
const App = () => {

  const [joined,setjoined]=useState(false);
  const[RoomId,setRoomId]=useState("");
  const[UserName,setUserName]=useState("");
  const[language,setlanguage]=useState("javascript");
  const[code,setcode]=useState("");
  const[copySuccess,setcopySuccess]=useState("");


  const joinRoom = () => {
    // console.log(RoomId, UserName);
    if(RoomId && UserName){
      socket.emit("join", { RoomId, UserName});
      setjoined(true)
    }
  }

  const copyRoomId = ()=> {
    navigator.clipboard.writeText(RoomId)
    setcopySuccess("copied")
    setTimeout((""),2000);


  };

  const handlecodechange=(newcode)=>{
    setcode(newcode);

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

return<div className="editor-container">
  <div className="sidebar">
    <div className="room-info">
      <h2>code Room:{RoomId}</h2>
      <button onClick={copyRoomId} className="copy-button">copy Roomid</button>
      {copySuccess && <span className='copy-success'>{copySuccess}</span>}
    </div>
    <h3>Users in room</h3>
    <ul>
      <li>Ankit</li>
      <li>adityaaa</li>
    </ul>
    <p className='typing-indicator'>user typing...</p>
    <select className='language-selector' value={language} onChange={(e)=>setlanguage(e.target.value)}>
      <option value="javascript">javascript</option>
      <option value="python">python</option>
      <option value="java">java</option>
      <option value="cpp">c++</option>
    </select>
    <button className='leave-button'>Leave Room</button>
  </div>
  <div className='editor-wrapper'>
    <Editor  height={"100%"}
     defaultLanguage={language} 
     language={language}
     value={code}
     onChange={handlecodechange}
     theme='vs-dark'
     options={
      {
      minimap:{enabled:false},
      fontSize:14,
      }
     }
    />
  </div>


</div>

};

export default App;