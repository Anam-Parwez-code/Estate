import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa'; // Icons add kiye hain

const AIChat = () => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Toggle state
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, isTyping]);

  const handleAsk = async () => {
    if (!msg.trim()) return;
    const currentMsg = msg;
    setMsg("");
    setChat(prev => [...prev, { user: currentMsg, ai: null }]);
    setIsTyping(true);

    try {
      const res = await fetch('http://127.0.0.1:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentMsg })
      });
      const data = await res.json();
      setChat(prev => {
        const updatedChat = [...prev];
        updatedChat[updatedChat.length - 1].ai = data.reply || "No reply received.";
        return updatedChat;
      });
    } catch (error) {
      setChat(prev => {
        const updatedChat = [...prev];
        updatedChat[updatedChat.length - 1].ai = "System offline. Please ensure Python backend is running.";
        return updatedChat;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans">
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-accent hover:scale-110'}`}
      >
        {isOpen ? <FaTimes className="text-white" /> : <FaRobot className="text-primary text-2xl" />}
      </button>
      
      {/* Chat Window */}
      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[380px] bg-primary border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col`}>
        
        {/* Header */}
        <div className="bg-slate-800/80 p-4 border-b border-slate-700 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-white font-bold tracking-wide">Royal Assistant</h3>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4 bg-slate-900/50">
          {chat.length === 0 && (
            <div className="text-center text-slate-500 mt-20">
              <FaRobot className="mx-auto text-4xl mb-2 opacity-20" />
              <p className="text-sm">Hii.. How can I assist your property search today?</p>
            </div>
          )}
          
          {chat.map((c, i) => (
            <div key={i} className="flex flex-col gap-2">
              {/* User Bubble */}
              <div className="flex justify-end">
                <span className="bg-accent text-primary px-4 py-2 rounded-2xl rounded-tr-none max-w-[85%] text-sm font-medium shadow-md" style={{ unicodeBidi: 'plaintext', textAlign: 'start' }}>
                  {c.user}
                </span>
              </div>
              
              {/* AI Bubble */}
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-none max-w-[90%] text-sm border border-slate-700 shadow-sm" style={{ unicodeBidi: 'plaintext', textAlign: 'start' }}>
                  <p className="text-[10px] text-accent font-bold mb-1 uppercase tracking-tighter">AI Assistant</p>
                  <div className="prose prose-invert max-w-none">
                    {c.ai ? 
                    (
        
        <div 
          className="chat-html-render"
          dangerouslySetInnerHTML={{ __html: c.ai }} 
        />
                    ): (
                      <div className="flex gap-1 py-1">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex gap-2">
          <input 
            value={msg} 
            onChange={(e) => setMsg(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Type your message...(eg:show flat in Saudi Arabia)" 
            className="flex-1 bg-slate-900 border border-slate-700 text-white p-3 rounded-xl outline-none focus:border-accent text-sm transition-all"
            style={{ unicodeBidi: 'plaintext', textAlign: 'start' }}
          />
          <button 
            onClick={handleAsk} 
            className="bg-accent text-primary p-3 rounded-xl hover:opacity-90 transition-all shadow-lg"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;