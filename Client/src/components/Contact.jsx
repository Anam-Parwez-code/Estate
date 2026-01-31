import { useEffect, useState } from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

export default function Contact({ listing }) {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        setLandlord(data);
      } catch (error) {
        console.log("Error fetching landlord:", error);
      }
    };
    fetchLandlord();
  }, [listing.userRef]);

  // WhatsApp Link Logic with safety checks
  const getWhatsappUrl = () => {
    if (!landlord || !landlord.phone) return "#";
    
    // Phone number se extra spaces ya symbols hatane ke liye
    const cleanPhone = landlord.phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(
      `Hello ${landlord.username}, I am interested in your property "${listing.name}" on Royal Estate. ${message}`
    );
    
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };
  const openGmail = () => {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${landlord.email}&su=${encodeURIComponent(`Inquiry for ${listing.name}`)}&body=${encodeURIComponent(message)}`;
  window.open(gmailUrl, '_blank');
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

          <textarea
            name='message'
            id='message'
            rows='3'
            value={message}
            onChange={onChange}
            placeholder='I am interested in this property...'
            className='w-full bg-slate-900/50 border border-slate-700 text-slate-200 p-4 rounded-2xl outline-none focus:border-accent transition-all resize-none shadow-inner'
          ></textarea>

          <div className='flex flex-col sm:flex-row gap-3 mt-2'>
            {/* WhatsApp Button (Only shows if phone exists) */}
            {landlord.phone ? (
              <a
                href={getWhatsappUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 bg-[#25D366] text-white font-extrabold text-center p-4 uppercase rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20'
              >
                <FaWhatsapp size={22} /> WhatsApp
              </a>
            ) : (
              <p className='text-red-400 text-xs italic'>Landlord phone not available</p>
            )}

            {/* Email / Inquiry Button as Backup */}
<button
  onClick={openGmail}
  className='flex-1 bg-accent text-primary font-extrabold text-center p-4 uppercase rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2'
>
  <FaEnvelope size={20} /> Send via Gmail
</button>
          </div>
        </div>
      )}
    </>
  );
}