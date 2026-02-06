
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { FaRobot, FaPaperPlane, FaTimes } from 'react-icons/fa';

export default function AIChatbot({ listings }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Royal Assistant. How can I assist you with your property search today?' }
  ]);
  const scrollRef = useRef();

  const AI_SERVER_URL = "https://royal-estate-ai.onrender.com/chat";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.toLowerCase().trim();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(AI_SERVER_URL, { message: userQuery }, { timeout: 15000 });
      
      const aiContent = response.data.response;
      const aiResults = response.data.results || [];

      // Agar AI ke paas results hain toh wo dikhao, warna local check karo
      if (aiResults.length > 0) {
        setMessages(prev => [...prev, { role: 'assistant', content: aiContent, results: aiResults }]);
      } else {
        triggerFallback(userQuery);
      }
    } catch (error) {
      triggerFallback(userQuery);
    } finally {
      setIsTyping(false);
    }
  };

  // 🛠️ SMART FALLBACK: Yeh kabhi fail nahi hone dega
  const triggerFallback = (query) => {
    const found = Array.isArray(listings) 
      ? listings.filter(item => 
          item.name?.toLowerCase().includes(query) || 
          item.address?.toLowerCase().includes(query) ||
          (query.includes("bang") && item.address?.toLowerCase().includes("bang")) ||
          (query.includes("riyadh") && item.address?.toLowerCase().includes("riyadh"))
        ).slice(0, 3)
      : [];

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: found.length > 0 
        ? "I found these options in our royal collection:" 
        : "I couldn't find any properties matching that location right now. Try Riyadh or Bangalore.",
      results: found 
    }]);
  };

  return (
    <div className='fixed bottom-4 right-4 z-[1000]'>
      {/* Golden Button */}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center border-2 border-white/20 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-[#D4AF37] hover:scale-110'}`}>
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-slate-900 text-2xl" />}
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[520px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        <div className="bg-slate-800 p-4 border-b border-[#D4AF37]/40 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-[#D4AF37] text-sm uppercase tracking-wider">Royal AI Assistant</span>
        </div>
        
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-md ${m.role === 'user' ? 'bg-[#D4AF37] text-slate-900 font-bold' : 'bg-slate-700 text-slate-200'}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              
              {/* LISTING CARDS - EXACT HOME PAGE LOOK */}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 w-full space-y-4">
                  {m.results.map((listing, idx) => (
                    <div key={idx} className='w-full bg-white rounded-xl overflow-hidden shadow-xl border border-slate-200 group'>
                      <div className="relative overflow-hidden h-32">
                        <img 
                          src={listing.imageUrls?.[0] || listing.image || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=600'} 
                          className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-500'
                          alt='property'
                        />
                      </div>
                      <div className='p-3 text-left'>
                        <h4 className='font-bold text-slate-800 text-sm truncate'>{listing.name}</h4>
                        <p className='text-[10px] text-gray-500 truncate flex items-center gap-1'>📍 {listing.address}</p>
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                           <span className='text-sm font-black text-[#B8860B]'>
                             {listing.address?.toLowerCase().includes('india') || listing.address?.toLowerCase().includes('bang') 
                               ? `₹${listing.regularPrice?.toLocaleString()}` 
                               : `${listing.regularPrice?.toLocaleString()} SAR`}
                           </span>
                           <Link to={`/listing/${listing._id}`} className='text-[10px] bg-slate-800 text-white px-4 py-2 rounded-lg font-bold uppercase hover:bg-[#D4AF37] hover:text-slate-900 transition-all'>
                             View Details
                           </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <div className="text-[#D4AF37] text-xs animate-pulse font-medium">Assistant is searching...</div>}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSearch} className='p-4 bg-slate-800 flex gap-2 border-t border-slate-700'>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search (e.g. Riyadh, Banglore)..." className='flex-1 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-[#D4AF37] transition-all' />
          <button type='submit' className='bg-[#D4AF37] text-slate-900 p-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all'><FaPaperPlane /></button>
        </form>
      </div>
    </div>
  );
}
