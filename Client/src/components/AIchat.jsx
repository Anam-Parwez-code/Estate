import React, { useState } from 'react';

const AIChat = () => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const handleAsk = async () => {
    // Hamare FastAPI Backend ko call karein
    const res = await fetch('http://127.0.0.1:8080/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    setChat([...chat, { user: msg, ai: data.reply }]);
    setMsg("");
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button 
        onClick={() => document.getElementById('chat-window').style.display = 'block'}
        style={{ padding: '15px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
        💬 AI
      </button>
      
      <div id="chat-window" style={{ display: 'none', background: 'white', border: '1px solid #ccc', padding: '10px', width: '300px', borderRadius: '10px' }}>
        <div style={{ height: '200px', overflowY: 'scroll' }}>
          {chat.map((c, i) => (
            <div key={i}><b>You:</b> {c.user}<br/><b>AI:</b> {c.ai}<hr/></div>
          ))}
        </div>
        <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type here..." style={{ width: '80%' }} />
        <button onClick={handleAsk}>Send</button>
      </div>
    </div>
  );
};

export default AIChat;