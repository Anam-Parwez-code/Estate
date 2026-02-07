
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaUserTie, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function AIChatbot() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to Royal Estate. I am your **Bilingual Investment Advisor**. \n\nHow can I help you analyze market trends or project your ROI today?' }
  ]);
  const scrollRef = useRef();
  const AI_SERVER_URL = "https://royal-estate-ai.onrender.com/chat";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userQuery = input;
    
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(AI_SERVER_URL, { message: userQuery });
      const aiContent = response.data.response || "";

      setMessages(prev => [...prev, { role: 'assistant', content: aiContent }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "My apologies, I am currently analyzing market fluctuations. Please try again shortly." }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className='fixed bottom-4 right-4 z-[1000] font-sans'>
      {/* Golden Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center border-2 border-[#D4AF37]/50 transition-all duration-300 ${isOpen ? 'bg-red-500 border-white/20' : 'bg-[#D4AF37] hover:scale-110 active:scale-95'}`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaUserTie className="text-slate-900 text-2xl" />}
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-[#D4AF37]/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Golden Header */}
        <div className="bg-slate-800 p-4 border-b border-[#D4AF37]/40 font-bold text-[#D4AF37] flex items-center gap-2 shadow-sm">
          <FaUserTie className="animate-pulse" /> Royal AI Advisor
        </div>

        {/* Chat Content */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-md ${m.role === 'user' ? 'bg-[#D4AF37] text-slate-900 font-bold rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Golden WhatsApp Style Typing Dots */}
          {isTyping && (
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-tl-none w-20">
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Golden Input Section */}
        <form onSubmit={handleSearch} className='p-4 bg-slate-800 border-t border-slate-700 flex gap-2'>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask your Advisor..." 
            className='flex-1 bg-slate-900 text-white text-sm px-4 py-2 rounded-xl outline-none border border-slate-700 focus:border-[#D4AF37] placeholder:text-slate-500' 
          />
          <button type='submit' className='bg-[#D4AF37] text-slate-900 p-3 rounded-xl hover:bg-[#B8860B] active:scale-90 transition-all shadow-lg'>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
