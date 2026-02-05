import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import 'swiper/css/bundle';
import axiosInstance from '../services/api'; // 1. Axios Import karein
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
  const { t } = useTranslation();
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [analysis, setAnalysis] = useState("");
  

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // 2. Axios GET request use karein
        const res = await axiosInstance.get(`/api/listing/get/${params.listingId}`);
        const data = res.data; // Axios mein seedha data milta hai

        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const getSymbol = (curr) => {
    const symbols = {
      'INR': '₹',
      'SAR': 'SR',
      'AED': 'AED',
      'GBP': '£',
      'EUR': '€',
      'USD': '$'
    };
    return symbols[curr] || '₹';
  };
  const getAIAnalysis = async () => {
  setLoading(true);
  try {
    const res = await fetch('https://my-royal-estate.onrender.com/ai-roi-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: listing.name,
        location: listing.address,
        price: listing.regularPrice,
        features: listing.description
      }),
    });
    const data = await res.json();
    setAnalysis(data.analysis);
  } catch (error) {
    console.error("AI Error:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className='bg-primary min-h-screen pb-10'>
      {loading && <p className='text-center py-20 text-2xl text-accent animate-pulse'>{t('loading_msg')}</p>}
      {error && (
        <p className='text-center py-20 text-2xl text-red-400'>{t('error_msg')}</p>
      )}
      
      {listing && !loading && !error && (
        <div className='animate-fadeIn'>
          <Swiper navigation className='h-[550px] shadow-2xl'>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div
                  className='h-full w-full'
                  style={{
                    background: `linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.7)), url(${url}) center no-repeat`,
                    backgroundSize: 'cover',
                  }}
                ></div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div 
            className='fixed top-[13%] right-[3%] z-10 border border-slate-700 rounded-full w-12 h-12 flex justify-center items-center bg-primary/80 backdrop-blur-md cursor-pointer hover:bg-accent group transition-all shadow-xl'
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <FaShare className='text-accent group-hover:text-primary transition-colors' />
          </div>
          {copied && (
            <p className='fixed top-[20%] right-[5%] z-10 rounded-lg bg-slate-800 border border-accent/30 text-accent p-2 text-xs shadow-2xl'>
              {t('link_copied')}
            </p>
          )}

          <div className='flex flex-col max-w-4xl mx-auto p-5 my-7 gap-6'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-3xl md:text-4xl font-bold text-white'>
                {listing.name}
              </h1>
              <p className='text-2xl font-bold text-accent'>
                {getSymbol(listing.currency)}{' '}
                {listing.offer
                  ? listing.discountPrice.toLocaleString('en-US')
                  : listing.regularPrice.toLocaleString('en-US')}
                {listing.type === 'rent' && <span className='text-sm text-slate-400 font-normal'> {t('per_month')}</span>}
              </p>
            </div>

            <p className='flex items-center gap-2 text-slate-400 text-sm'>
              <FaMapMarkerAlt className='text-accent' />
              {listing.address}
            </p>
            
            <div className='flex gap-4'>
              <p className='bg-accent text-primary w-full max-w-[150px] font-bold text-center py-2 rounded-xl shadow-lg uppercase text-xs tracking-wider'>
                {listing.type === 'rent' ? t('for_rent') : t('for_sale')}
              </p>
              {listing.offer && (
                <p className='bg-green-500/10 border border-green-500/50 text-green-400 w-full max-w-[150px] font-bold text-center py-2 rounded-xl text-xs uppercase tracking-wider'>
                  {getSymbol(listing.currency)} {(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} {t('discount_tag')}
                </p>
              )}
            </div>

            <div className='bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 shadow-inner mt-4'>
              <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-accent'></span> {t('property_overview')}
              </h2>
              <p className='text-slate-300 leading-relaxed mb-8'>
                {listing.description}
              </p>

              <ul className='grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-200'>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaBed className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.bedrooms} {t('beds')}</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaBath className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.bathrooms} {t('baths')}</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaParking className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.parking ? t('parking_yes') : t('parking_no')}</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaChair className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.furnished ? t('furnished_yes') : t('furnished_no')}</span>
                </li>
              </ul>
            </div>

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='bg-accent text-primary font-extrabold rounded-2xl uppercase hover:scale-[1.02] transition-all p-4 shadow-2xl mt-4 text-sm'
              >
                {t('btn_inquire')}
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
          <div className="mt-6 border-t pt-4">
  <button 
    onClick={getAIAnalysis}
    disabled={loading}
    className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3 flex items-center justify-center gap-2 w-full md:w-auto"
  >
    {loading ? 'AI is analyzing market...' : '✨ Get Free AI Investment Report'}
  </button>

  {analysis && (
    <div className="mt-4 p-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl shadow-xl animate-in fade-in duration-500">
      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
        📊 Property Insights by Llama AI
      </h3>
      <div className="text-sm leading-relaxed whitespace-pre-wrap opacity-90">
        {analysis}
      </div>
      <p className="text-[10px] mt-4 italic text-slate-400">
        *Disclaimer: AI predictions are based on current market trends and not financial advice.
      </p>
    </div>
  )}
</div>
          
        </div>
      )}
    </main>
  );
}
