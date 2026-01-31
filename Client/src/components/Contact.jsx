import { useEffect, useState } from 'react';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${listing.userRef}`, {
          credentials: "include",
        });
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  const handleSend = async () => {
    if (!message.trim()) return alert("Please type a message first.");
    try {
      const res = await fetch("http://localhost:3000/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          receiverId: listing.userRef,
          listingId: listing._id,
          text: message
        })
      });

      const data = await res.json();
      alert("Your royal inquiry has been sent!");
      setMessage('');
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-4 mt-6 p-6 bg-slate-800/40 border border-slate-700 rounded-3xl backdrop-blur-sm animate-fadeIn'>
          <div className='flex flex-col gap-1'>
             <p className='text-slate-400 text-sm uppercase tracking-widest font-bold'>
               Inquiry for: <span className='text-accent'>{listing.name}</span>
             </p>
             <p className='text-white text-lg'>
               Contacting <span className='font-bold text-white italic'>{landlord.username}</span>
             </p>
          </div>

          <div className='relative'>
            <textarea
              name='message'
              id='message'
              rows='3'
              value={message}
              onChange={onChange}
              placeholder='I am interested in this property. Please provide more details...'
              className='w-full bg-slate-900/50 border border-slate-700 text-slate-200 p-4 rounded-2xl outline-none focus:border-accent transition-all resize-none shadow-inner'
            ></textarea>
            {/* Subtle Label inside textarea look */}
            <div className='absolute bottom-3 right-4 text-[10px] text-slate-600 uppercase font-bold tracking-tighter'>
              Secure Messaging
            </div>
          </div>

          <button
            onClick={handleSend}
            className='bg-accent text-primary font-extrabold text-center p-4 uppercase rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-accent/10'
          >
            Send Inquiry
          </button>
        </div>
      )}
    </>
  );
}