
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

  // Aapka Render Backend URL
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
      const response = await axios.post(AI_SERVER_URL, 
        { message: userQuery }, 
        { timeout: 20000 }
      );

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
      {/* Bot Toggle Button - Golden Theme */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-14 h-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center border-2 border-white/20 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-[#D4AF37] hover:scale-110'
        }`}
      >
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-slate-900 text-2xl" />}
      </button>

      {/* Chat Window */}
      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className="bg-slate-800/90 p-4 border-b border-[#D4AF37]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-[#D4AF37] font-bold text-sm tracking-wide">Royal Assistant</h3>
          </div>
        </div>
        
        {/* Chat Body */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm shadow-lg max-w-[85%] ${
                m.role === 'user' 
                ? 'bg-[#D4AF37] text-slate-900 font-medium rounded-tr-none' 
                : 'bg-slate-700 text-slate-200 rounded-tl-none'
              }`}>
                <div className="prose prose-invert prose-sm leading-relaxed">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
              
              {/* PROPERTY CARDS - HOME PAGE STYLE */}
              {m.results && m.results.length > 0 && (
                <div className="mt-3 w-full space-y-4">
                  {m.results.map((listing, idx) => (
                    <div key={idx} className='bg-white shadow-md hover:shadow-xl transition-shadow overflow-hidden rounded-lg w-full border border-slate-200'>
                      
                      {/* Image like Home Page */}
                      <img 
                        src={listing.imageUrls?.[0] || listing.image || 'https://via.placeholder.com/300'} 
                        alt='property' 
                        className='h-32 w-full object-cover hover:scale-105 transition-scale duration-300'
                      />

                      <div className='p-3 flex flex-col gap-1 text-black'>
                        <p className='truncate text-md font-bold text-slate-800 uppercase'>
                          {listing.name}
                        </p>
                        <p className='text-[11px] text-gray-600 truncate flex items-center gap-1'>
                           📍 {listing.address}
                        </p>

                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className='text-sm font-bold text-[#B8860B]'>
                            {/* Location based Currency Logic */}
                            {listing.price ? listing.price : (
                              listing.address?.toLowerCase().includes('india') || listing.address?.toLowerCase().includes('banglore')
                              ? `₹${listing.regularPrice?.toLocaleString()}`
                              : `${listing.regularPrice?.toLocaleString()} SAR`
                            )}
                          </span>
                          
                          <Link 
                            to={listing.link ? `/listing/${listing.link.split('/').pop()}` : `/listing/${listing._id}`}
                            className='text-[10px] bg-slate-800 text-white px-3 py-2 rounded-lg font-bold hover:bg-[#D4AF37] hover:text-slate-900 transition-colors uppercase'
                          >
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

          {isTyping && (
            <div className="flex items-start">
              <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none shadow-lg">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSearch} className='p-4 bg-slate-800/80 border-t border-slate-700 flex gap-2'>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about properties..." 
            className='flex-1 bg-slate-900 text-white text-sm outline-none px-4 py-3 rounded-xl border border-slate-700 focus:border-[#D4AF37]'
          />
          <button type='submit' disabled={isTyping} className='bg-[#D4AF37] text-slate-900 p-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50'>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}
