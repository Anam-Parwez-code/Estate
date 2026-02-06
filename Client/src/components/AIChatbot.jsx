import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function AIChatbot({ listings }) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Royal Assistant. How can I assist you with your property search today?' }
  ]);
  const scrollRef = useRef();

  // URL should match your Render Deployment
  const AI_SERVER_URL = "https://royal-estate-uzii.onrender.com/chat";

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
      const response = await axios.post(AI_SERVER_URL, 
        { message: userQuery }, 
        { timeout: 20000 }
      );

      // AI response aur Results (Cards) dono ko save kar rahe hain
      const aiContent = response.data.response || "I am processing your request...";
      const aiResults = response.data.results || [];

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiContent,
        results: aiResults 
      }]);

    } catch (error) {
      console.log("Using Local Fallback...");
      const cleanSearch = userQuery.toLowerCase().trim();
      const foundListings = Array.isArray(listings) 
        ? listings.filter(item => 
            (item.name?.toLowerCase().includes(cleanSearch)) || 
            (item.address?.toLowerCase().includes(cleanSearch))
          ).slice(0, 3)
        : [];

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: foundListings.length > 0 
          ? "I found these options from our database:" 
          : "I couldn't find any matching properties at the moment.",
        results: foundListings 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='fixed bottom-4 right-4 z-[1000]'>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-white/20 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-slate-800 hover:scale-110'
        }`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-white text-2xl" />}
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        
        <div className="bg-slate-800/90 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm">Royal Assistant</h3>
          </div>
        </div>
        
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm shadow-lg max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                <div className="prose prose-invert prose-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
              
              {/* PROPERTY CARDS RENDERING */}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 w-full space-y-3">
                  {m.results.map((listing, idx) => (
                    <div key={idx} className='w-full bg-white rounded-xl overflow-hidden shadow-lg text-black transition-transform hover:scale-[1.02]'>
                      <div className='p-3 text-left'>
                        <h4 className='font-bold text-xs truncate'>{listing.name}</h4>
                        <p className='text-[10px] text-gray-500 truncate'>{listing.address}</p>
                        <div className="flex justify-between items-center mt-2">
                           <span className='text-xs font-bold text-blue-600'>
                             {listing.price || `${listing.regularPrice?.toLocaleString()} SAR`}
                           </span>
                           <Link 
                            to={listing.link ? `/listing/${listing.link.split('/').pop()}` : `/listing/${listing._id}`}
                            className='text-[9px] bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold uppercase'
                           >
                            Details
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start">
              <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-none shadow-lg text-white text-xs">
                AI is thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSearch} className='p-4 bg-slate-800/80 border-t border-slate-700 flex gap-2'>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Search Riyadh, Bangalore..." 
            className='flex-1 bg-slate-900 text-white text-sm outline-none px-4 py-3 rounded-xl border border-slate-700 focus:border-blue-500'
          />
          <button type='submit' disabled={isTyping} className='bg-blue-600 text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-50'>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
