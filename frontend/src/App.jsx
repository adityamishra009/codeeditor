import { useEffect, useState } from 'react';
import "./App.css";
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';

// it is backend api 
// add your backend api here 
const socket = io("http://localhost:3000/");

const App = () => {

  const[joined,setJoined]=useState(false);
  const[roomId,setRoomId]=useState("");
  const[UserName,setUserName]=useState("");
  const[language,setLanguage]=useState("javascript");
  const[code,setCode]=useState("");
  const[copySuccess,setCopysuccess]=useState("");
  const[users, setUsers] = useState([]);
  const[typing,settyping]=useState("");


  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users)
    });

     socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping",(user)=>{
      settyping(`${user.slice(0,8)}..isTyping`)
      setTimeout(() =>settyping(""),2000); 

    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
    }
  },[]);

   useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);



  const joinRoom = () => {
    // console.log(roomId, UserName);
    if(roomId && UserName){
      socket.emit("join", { roomId, UserName});
      setJoined(true)
    }
  }

  const copyroomId = ()=> {
    navigator.clipboard.writeText(roomId)
    setCopysuccess("copied")
    setTimeout((""),2000);


  };

  const handleCodeChange=(newcode)=>{
    setCode(newcode);
    socket.emit("codeChange", { roomId, code: newcode})
    socket.emit("typing",{roomId,UserName})
  }

  console.log('Users:', users);


  
  if(!joined){
     return (
     <div className="join-container">
         <div className="join-form">
          <h1>Join Code Room</h1>
          <input 
            type="text" 
            placeholder="Room Id"
            value={roomId}
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

return (
<div className="editor-container">
  <div className="sidebar">
    <div className="room-info">
      <h2>Code Room:{roomId}</h2>
      <button onClick={copyroomId} className="copy-button">Copy Id</button>
      {copySuccess && <span className='copy-success'>{copySuccess}</span>}
    </div>
    <h3>Users in Room:</h3>
    <ul>
          {users.map((user, index) => (
            <li key={index}>{(user || '').slice(0, 8)}...</li>
          ))}
        </ul>
    <p className='typing-indicator'>{typing}</p>
    <select className='language-selector' value={language} onChange={(e)=>setLanguage(e.target.value)}>
      <option value="javascript">javascript</option>
      <option value="python">python</option>
      <option value="java">java</option>
      <option value="cpp">c++</option>
    </select>
    <button className='leave-button'>Leave Room</button>
  </div>
  <div className='editor-wrapper'>
    <Editor  
     height={"100%"}
     defaultLanguage={language} 
     language={language}
     value={code}
     onChange={handleCodeChange}
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
);
};

export default App;