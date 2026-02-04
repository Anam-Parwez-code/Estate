import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function AIChatbot({ listings }) {
  const { i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [lastResults, setLastResults] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Royal Assistant. How can I assist you with your property search today?' }
  ]);
  const scrollRef = useRef();

  const AI_SERVER_URL = import.meta.env.VITE_AI_URL || "https://royal-estate-ai.onrender.com/chat";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(AI_SERVER_URL, 
        { message: userQuery }, 
        { timeout: 12000 }
      );

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply, 
      }]);

    } catch (error) {
      console.log("Using Plan B: Local Filter");
      // Plan B: Simple Filtering if Backend is down
      const cleanSearch = userQuery.toLowerCase().replace(/inr|eur|price|home|flat/g, '').trim();
      const foundListings = (listings || []).filter(item => 
        item.name.toLowerCase().includes(cleanSearch) || 
        item.address.toLowerCase().includes(cleanSearch)
      ).slice(0, 2);

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: foundListings.length > 0 ? "I found these options locally:" : "I couldn't find any matching properties.",
        results: foundListings 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='fixed bottom-4 right-4 z-[1000]'>
      {/* Round Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-white/20 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-accent hover:scale-110'
        }`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-primary text-2xl" />}
      </button>

      {/* Chat Window */}
      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        
        <div className="bg-slate-800/90 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm">Royal Assistant</h3>
          </div>
          {isTyping && <span className="text-[10px] text-accent animate-bounce">Processing...</span>}
        </div>
        
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm shadow-lg max-w-[85%] ${m.role === 'user' ? 'bg-accent text-primary rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                {m.role === 'assistant' && m.content.includes('<div') ? (
                  <div 
                    className="ai-rendered-html" 
                    dangerouslySetInnerHTML={{ __html: m.content }} 
                  />
                ) : (
                  <div className="prose prose-invert prose-sm leading-relaxed">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Local Results Rendering (Plan B) */}
              {m.results && m.results.map((listing) => (
                <div key={listing._id} className='mt-3 w-full bg-white rounded-xl overflow-hidden shadow-lg text-black'>
                  <img src={listing.imageUrls[0]} alt="" className='h-24 w-full object-cover' />
                  <div className='p-3'>
                    <h4 className='font-bold text-xs truncate'>{listing.name}</h4>
                    <p className='text-[10px] text-gray-500 truncate'>{listing.address}</p>
                    <div className="flex justify-between items-center mt-2">
                       <span className='text-xs font-bold text-primary'>SAR {listing.regularPrice?.toLocaleString()}</span>
                       <Link to={`/listing/${listing._id}`} className='text-[9px] bg-primary text-white px-3 py-1.5 rounded-lg font-bold uppercase'>Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSearch} className='p-4 bg-slate-800/80 border-t border-slate-700 flex gap-2'>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about properties..." 
            className='flex-1 bg-slate-900 text-white text-sm outline-none px-4 py-3 rounded-xl border border-slate-700 focus:border-accent'
          />
          <button type='submit' disabled={isTyping} className='bg-accent text-primary p-3 rounded-xl hover:opacity-90'>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
