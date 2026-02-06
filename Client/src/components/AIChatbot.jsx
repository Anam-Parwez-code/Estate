
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
    const userQuery = input;
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(AI_SERVER_URL, { message: userQuery }, { timeout: 20000 });
      let aiContent = response.data.response || "";
      // 🛑 YAHAN FIX HAI: Text se URL hatane ke liye
      aiContent = aiContent.replace(/(https?:\/\/[^\s]+)/g, ""); 

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiContent, 
        results: response.data.results || [] 
      }]);
    } catch (error) {
      const clean = userQuery.toLowerCase();
      const found = listings?.filter(item => item.name?.toLowerCase().includes(clean) || item.address?.toLowerCase().includes(clean)).slice(0, 3);
      setMessages(prev => [...prev, { role: 'assistant', content: "I found these options:", results: found || [] }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className='fixed bottom-4 right-4 z-[1000]'>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 ${isOpen ? 'bg-red-500' : 'bg-[#D4AF37]'}`}>
        {isOpen ? <FaTimes className="text-white text-xl" /> : <FaRobot className="text-slate-900 text-2xl" />}
      </button>

      <div className={`${isOpen ? 'scale-100' : 'scale-0'} transition-all absolute bottom-20 right-0 w-[320px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        <div className="bg-slate-800 p-4 border-b border-[#D4AF37]/40 font-bold text-[#D4AF37]">Royal Assistant</div>
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm max-w-[85%] ${m.role === 'user' ? 'bg-[#D4AF37] text-slate-900 font-bold' : 'bg-slate-700 text-slate-200'}`}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              {m.results?.map((listing, idx) => (
                <div key={idx} className='w-full bg-white rounded-xl overflow-hidden shadow-lg mt-3'>
                  <img src={listing.imageUrls?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073'} className='h-32 w-full object-cover' />
                  <div className='p-3 text-slate-900 text-left'>
                    <h4 className='font-bold text-sm truncate uppercase'>{listing.name}</h4>
                    <p className='text-[10px] text-gray-500 truncate'>📍 {listing.address}</p>
                    <div className="flex justify-between items-center mt-2 border-t pt-2">
                      <span className='text-sm font-black text-[#B8860B]'>
                        {/* 💰 PRICE FIX: Har jagah sahi dikhega */}
                        {listing.address?.toLowerCase().includes('india') || listing.address?.toLowerCase().includes('bang') 
                          ? `₹${(listing.regularPrice || listing.price || 0).toLocaleString()}` 
                          : `${(listing.regularPrice || listing.price || 0).toLocaleString()} SAR`}
                      </span>
                      {/* 🔗 LINK FIX: Galat link ko sahi ID mein badlo */}
                      <Link to={`/listing/${listing._id || listing.link?.split('/').pop()}`} className='text-[10px] bg-slate-800 text-white px-3 py-2 rounded-lg font-bold uppercase'>Details</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
        <form onSubmit={handleSearch} className='p-4 bg-slate-800 flex gap-2'>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search..." className='flex-1 bg-slate-900 text-white text-sm px-4 py-2 rounded-xl outline-none border border-slate-700 focus:border-[#D4AF37]' />
          <button type='submit' className='bg-[#D4AF37] text-slate-900 p-3 rounded-xl'><FaPaperPlane /></button>
        </form>
      </div>
    </div>
  );
}
