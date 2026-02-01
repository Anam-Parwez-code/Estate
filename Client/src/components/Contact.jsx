import { useEffect, useState } from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import { useTranslation } from 'react-i18next'; // 1. Import Hook

export default function Contact({ listing }) {
  const { t } = useTranslation(); // 2. Initialize Hook
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

  // WhatsApp Link Logic with Localized Message
  const getWhatsappUrl = () => {
    if (!landlord || !landlord.phone) return "#";
    
    const cleanPhone = landlord.phone.replace(/\D/g, '');
    
    // Dynamic Translation for WhatsApp Message
    const baseMsg = t('wa_msg_body', { 
      landlord: landlord.username, 
      property: listing.name 
    });
    
    const encodedMessage = encodeURIComponent(`${baseMsg} ${message}`);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const openGmail = () => {
    const subject = encodeURIComponent(`${t('contact_inquiry_for')} ${listing.name}`);
    const body = encodeURIComponent(message);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${landlord.email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  return (
    <>
      {landlord && (
        <div className='flex flex-col gap-4 mt-6 p-6 bg-slate-800/40 border border-slate-700 rounded-3xl backdrop-blur-sm animate-fadeIn'>
          <div className='flex flex-col gap-1'>
            <p className='text-slate-400 text-sm uppercase tracking-widest font-bold'>
              {t('contact_inquiry_for')}: <span className='text-accent'>{listing.name}</span>
            </p>
            <p className='text-white text-lg'>
              {t('contacting_landlord')} <span className='font-bold text-white italic'>{landlord.username}</span>
            </p>
          </div>

          <textarea
            name='message'
            id='message'
            rows='3'
            value={message}
            onChange={onChange}
            placeholder={t('ph_message')}
            className='w-full bg-slate-900/50 border border-slate-700 text-slate-200 p-4 rounded-2xl outline-none focus:border-accent transition-all resize-none shadow-inner'
          ></textarea>

          <div className='flex flex-col sm:flex-row gap-3 mt-2'>
            {landlord.phone ? (
              <a
                href={getWhatsappUrl()}
                target='_blank'
                rel='noopener noreferrer'
                className='flex-1 bg-[#25D366] text-white font-extrabold text-center p-4 uppercase rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20'
              >
                <FaWhatsapp size={22} /> {t('btn_whatsapp')}
              </a>
            ) : (
              <p className='text-red-400 text-xs italic'>{t('landlord_no_phone')}</p>
            )}

            <button
              onClick={openGmail}
              className='flex-1 bg-accent text-primary font-extrabold text-center p-4 uppercase rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2'
            >
              <FaEnvelope size={20} /> {t('btn_gmail')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}