{/*import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function AIChatbot({ listings }) {
  const { i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [lastResults, setLastResults] = useState([]); // Memory for context
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Salam Anam! Main aapki kaisay madad kar sakti hoon? (e.g., Search "London" then "Price in INR")' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const query = input.toLowerCase();
    const isArabic = /[\u0600-\u06FF]/.test(query);
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    // 1. Currency Detection
    const currencies = { 'inr': 'INR', 'eur': 'EUR', 'euro': 'EUR', 'gbp': 'GBP', 'usd': 'USD' };
    let targetCurrency = null;
    Object.keys(currencies).forEach(key => {
      if (query.includes(key)) targetCurrency = currencies[key];
    });

    // 2. Search & Filter Logic
    let foundListings = [];
    // Agar sirf currency mangi hai, toh purane results use karo
    const isOnlyCurrency = targetCurrency && query.split(' ').length <= 3;

    if (isOnlyCurrency && lastResults.length > 0) {
      foundListings = [...lastResults];
    } else {
      const cleanSearch = query.replace(/inr|eur|euro|gbp|usd|price|in|me|ghar/g, '').trim();
      foundListings = listings.filter(item => 
        item.name.toLowerCase().includes(cleanSearch) || 
        item.address.toLowerCase().includes(cleanSearch) ||
        item.description.toLowerCase().includes(cleanSearch)
      ).slice(0, 2);
      setLastResults(foundListings); // Save to memory
    }

    // 3. Conversion Logic (Base: SAR)
    let finalResults = [...foundListings];
    let customResponse = "";

    if (foundListings.length > 0 && targetCurrency) {
      try {
        // NOTE: Fixed base to SAR
        const res = await fetch(`https://v6.exchangerate-api.com/v6/91f3c7bf31224bfd28421294/latest/SAR`);
        const data = await res.json();
        
        if (data.result === "success") {
          const rate = data.conversion_rates[targetCurrency];
          finalResults = foundListings.map(l => ({
            ...l,
            convertedPrice: (l.regularPrice * rate).toLocaleString(undefined, { maximumFractionDigits: 2 }),
            symbol: targetCurrency,
            isConverted: true
          }));
          customResponse = `Ji, live rates ke mutabiq ${targetCurrency} mein qeemat ye hai:`;
        }
      } catch (err) {
        const fallbacks = { INR: 22.45, EUR: 0.25, GBP: 0.21, USD: 0.27 };
        const rate = fallbacks[targetCurrency] || 1;
        finalResults = foundListings.map(l => ({
          ...l,
          convertedPrice: (l.regularPrice * rate).toLocaleString(),
          symbol: targetCurrency,
          isConverted: true
        }));
      }
    }

    setTimeout(() => {
      if (foundListings.length > 0) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: customResponse || (isArabic ? "لقد وجدت هذه العقارات لك:" : "Mujhe aapke liye ye behtareen options mile hain:"),
          results: finalResults 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Maazrat! Mujhe milti julti koi listing nahi mili." 
        }]);
      }
    }, 600);
    
    setInput('');
  };

  return (
    <div className='fixed bottom-5 right-5 z-50'>
      <button onClick={() => setIsOpen(!isOpen)} className='bg-accent text-primary p-4 rounded-full shadow-2xl font-bold text-2xl'>
        {isOpen ? '✕' : '🤖'}
      </button>

      {isOpen && (
        <div className='absolute bottom-16 right-0 w-85 h-[500px] bg-slate-900 border border-accent/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden'>
          <div className='bg-accent p-4 text-primary font-bold shadow-md'>Royal AI Assistant</div>
          
          <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800'>
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div dir={/[\u0600-\u06FF]/.test(m.content) ? 'rtl' : 'ltr'} className={`p-3 rounded-2xl text-sm shadow-md ${m.role === 'user' ? 'bg-accent text-primary rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none'}`}>
                  {m.content}
                </div>
                
                {m.results && m.results.map((listing) => (
                  <div key={listing._id} className='mt-3 w-full bg-white rounded-xl overflow-hidden shadow-2xl text-black border-l-4 border-accent'>
                    <img src={listing.imageUrls[0]} alt="" className='h-28 w-full object-cover' />
                    <div className='p-3'>
                      <h3 className='font-bold text-sm truncate'>{listing.name}</h3>
                      <p className='text-[10px] text-gray-500 mb-1'>{listing.address}</p>
                      
                      {listing.isConverted ? (
                        <p className='text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block'>
                          {listing.symbol} {listing.convertedPrice}
                        </p>
                      ) : (
                        <p className='text-xs font-semibold'>SAR {listing.regularPrice.toLocaleString()}</p>
                      )}

                      <Link to={`/listing/${listing._id}`} className='mt-3 block text-center bg-primary text-white text-xs py-2 rounded-lg font-bold'>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>

          <form onSubmit={handleSearch} className='p-3 bg-slate-800 border-t border-slate-700 flex gap-2'>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder={i18n.language === 'ar' ? 'اسأل عن أي شيء...' : 'Ask me anything...'} 
              className='flex-1 bg-slate-700 text-white text-sm outline-none px-4 py-2 rounded-full'
            />
            <button type='submit' className='bg-accent text-primary px-4 py-2 rounded-full font-bold text-sm'>Find</button>
          </form>
        </div>
      )}
    </div>
  );
}
  */}