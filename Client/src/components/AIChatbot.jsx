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

  const AI_SERVER_URL = "https://royal-estate-ai.onrender.com/chat";

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    try {
      // --- PLAN A: PYTHON AI SERVER ---
      const response = await axios.post(AI_SERVER_URL, 
        { message: userQuery }, 
        { timeout: 7000 }
      );

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.reply, 
        results: response.data.listings 
      }]);

    } catch (error) {
      console.log("Server unreachable. Activating Local Filter + Currency Conversion...");
      
      // --- PLAN B: BACKUP FILTER & CURRENCY LOGIC ---
      const currencies = { 'inr': 'INR', 'eur': 'EUR', 'gbp': 'GBP', 'usd': 'USD' };
      let targetCurrency = null;
      Object.keys(currencies).forEach(key => {
        if (userQuery.includes(key)) targetCurrency = currencies[key];
      });

      let foundListings = [];
      const isOnlyCurrency = targetCurrency && userQuery.split(' ').length <= 3;

      if (isOnlyCurrency && lastResults.length > 0) {
        foundListings = [...lastResults];
      } else {
        const cleanSearch = userQuery.replace(/inr|eur|euro|gbp|usd|price|home|flat/g, '').trim();
        foundListings = (listings || []).filter(item => 
          item.name.toLowerCase().includes(cleanSearch) || 
          item.address.toLowerCase().includes(cleanSearch)
        ).slice(0, 2);
        setLastResults(foundListings);
      }

      let finalResults = [...foundListings];
      let assistantReply = foundListings.length > 0 
        ? "I found these options for you:" 
        : "I couldn't find any matching properties. Please try another location.";

      // Live Currency Conversion for Backup Plan
      if (foundListings.length > 0 && targetCurrency) {
        try {
          const apiKey = import.meta.env.VITE_EXCHANGE_KEY || '91f3c7bf31224bfd28421294';
          const res = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/SAR`);
          const data = await res.json();
          
          if (data.result === "success") {
            const rate = data.conversion_rates[targetCurrency];
            finalResults = foundListings.map(l => ({
              ...l,
              convertedPrice: (l.regularPrice * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }),
              symbol: targetCurrency,
              isConverted: true
            }));
            assistantReply = `Based on live rates, here are the prices in ${targetCurrency}:`;
          }
        } catch (err) {
          assistantReply = "Currently unable to fetch live rates. Showing prices in SAR:";
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantReply,
        results: finalResults 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className='fixed bottom-6 right-6 z-[1000]'>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-accent hover:scale-110'}`}
      >
        {isOpen ? <FaTimes className="text-white" /> : <FaRobot className="text-primary text-2xl" />}
      </button>

      <div className={`${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-300 origin-bottom-right absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden`}>
        
        <div className="bg-slate-800/90 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-white font-bold text-sm tracking-wide">Royal Assistant</h3>
          </div>
          {isTyping && <span className="text-[10px] text-accent animate-bounce font-medium">Processing...</span>}
        </div>
        
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 scrollbar-hide'>
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-3 rounded-2xl text-sm shadow-lg max-w-[85%] ${m.role === 'user' ? 'bg-accent text-primary rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none'}`}>
                <ReactMarkdown className="prose prose-invert prose-sm leading-relaxed">{m.content}</ReactMarkdown>
              </div>
              
              {m.results && m.results.map((listing) => (
                <div key={listing._id} className='mt-3 w-full bg-white rounded-xl overflow-hidden shadow-2xl text-black border-l-4 border-accent transition-all hover:translate-x-1'>
                  <img src={listing.imageUrls[0]} alt="" className='h-24 w-full object-cover' />
                  <div className='p-3'>
                    <h4 className='font-bold text-xs truncate'>{listing.name}</h4>
                    <p className='text-[10px] text-gray-500 truncate'>{listing.address}</p>
                    <div className="flex justify-between items-center mt-2">
                       {listing.isConverted ? (
                         <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded'>{listing.symbol} {listing.convertedPrice}</span>
                       ) : (
                         <span className='text-xs font-bold text-primary'>SAR {listing.regularPrice?.toLocaleString()}</span>
                       )}
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
            placeholder="Ask about properties or prices..." 
            className='flex-1 bg-slate-900 text-white text-sm outline-none px-4 py-3 rounded-xl border border-slate-700 focus:border-accent'
          />
          <button type='submit' disabled={isTyping} className='bg-accent text-primary p-3 rounded-xl shadow-lg hover:opacity-90'>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
}