import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'; // 1. Import karein

const AIChat = () => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);

  const handleAsk = async () => {
    if (!msg) return; // Khali message na jaye

    // Optimistic Update: User ka message foran screen par dikhao
    const currentMsg = msg;
    setMsg("");
    
    try {
      const res = await fetch('http://127.0.0.1:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMsg })
      });
      const data = await res.json();
      
      // AI ka reply chat mein add karein
      setChat(prev => [...prev, { user: currentMsg, ai: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <button 
        onClick={() => {
          const win = document.getElementById('chat-window');
          win.style.display = win.style.display === 'none' ? 'block' : 'none';
        }}
        style={{ padding: '15px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>
        💬 AI
      </button>
      
      <div id="chat-window" style={{ display: 'none', background: 'white', border: '1px solid #ccc', padding: '10px', width: '350px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
        <div style={{ height: '300px', overflowY: 'scroll', marginBottom: '10px', padding: '5px' }}>
          {chat.map((c, i) => (
            <div key={i} style={{ marginBottom: '15px', fontSize: '14px' }}>
              <div style={{ color: '#555' }}><b>You:</b> {c.user}</div>
              <div style={{ backgroundColor: '#f1f1f1', padding: '8px', borderRadius: '5px', marginTop: '5px' }}>
                <b>AI Assistant:</b>
                {/* 2. AI ke reply ko ReactMarkdown mein wrap karein */}
                <div className="markdown-content">
                  <ReactMarkdown>{c.ai}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input 
            value={msg} 
            onChange={(e) => setMsg(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()} // Enter se send ho
            placeholder="Search price, location..." 
            style={{ width: '80%', padding: '5px' }} 
          />
          <button onClick={handleAsk} style={{ cursor: 'pointer' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;