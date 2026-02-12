
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import 'swiper/css/bundle';
import axiosInstance from '../services/api';
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
  const [aiLoading, setAiLoading] = useState(false);
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
        const res = await axiosInstance.get(`/api/listing/get/${params.listingId}`);
        const data = res.data;
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const getSymbol = (curr) => {
    const symbols = { 'INR': '₹', 'SAR': 'SR', 'AED': 'AED', 'GBP': '£', 'EUR': '€', 'USD': '$' };
    return symbols[curr] || '₹';
  };

 const getAIAnalysis = async () => {
    if (!listing) return;
    setAiLoading(true);
    setAnalysis("");
    try {
      const res = await fetch('https://royal-estate-ai.onrender.com/ai-roi-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: listing.name,
          location: listing.address,
          // YAHAN CHANGE HAI: Price ke saath listing ki asli currency bhej rahe hain
          price: `${listing.offer ? listing.discountPrice : listing.regularPrice} ${listing.currency}`,
          features: listing.description
        }),
      });
      if (!res.ok) throw new Error('Server Error');
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (error) {
      setAnalysis("⚠️ AI service is busy. Please try again in a moment.");
    } finally {
      setAiLoading(false);
    }
  };
  return (
    <main className='bg-primary min-h-screen pb-10'>
      {loading && <p className='text-center py-20 text-2xl text-accent animate-pulse'>{t('loading_msg')}</p>}
      {error && <p className='text-center py-20 text-2xl text-red-400'>{t('error_msg')}</p>}
      
      {listing && !loading && !error && (
        <div className='animate-fadeIn'>
          {/* SWIPER IMAGE SECTION */}
          <Swiper navigation className='h-[550px] shadow-2xl'>
            {listing.imageUrls.map((url) => (
              <SwiperSlide key={url}>
                <div className='h-full w-full' style={{ background: `linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.7)), url(${url}) center no-repeat`, backgroundSize: 'cover' }}></div>
              </SwiperSlide>
            ))}
          </Swiper>
          
          <div className='flex flex-col max-w-4xl mx-auto p-5 my-7 gap-6'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-3xl md:text-4xl font-bold text-white'>{listing.name}</h1>
              <p className='text-2xl font-bold text-accent'>
                {getSymbol(listing.currency)} {listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
              </p>
            </div>

            <p className='flex items-center gap-2 text-slate-400 text-sm'><FaMapMarkerAlt className='text-accent' /> {listing.address}</p>
            
            <div className='flex gap-4'>
               <p className='bg-accent text-primary w-full max-w-[150px] font-bold text-center py-2 rounded-xl shadow-lg uppercase text-xs tracking-wider'>
                 {listing.type === 'rent' ? t('for_rent') : t('for_sale')}
               </p>
            </div>

            {/* PROPERTY DETAILS SECTION */}
            <div className='bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 mt-4'>
              <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-accent'></span> {t('property_overview')}
              </h2>
              <p className='text-slate-300 leading-relaxed mb-8'>{listing.description}</p>
              
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

            {/* NEW GOLDEN AI SECTION (Only One Section Now) */}
            <div className='mt-8 border-t border-slate-700/50 pt-8'>
              <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-yellow-500'></span> AI Investment Insights
              </h2>
              <button 
                onClick={getAIAnalysis}
                disabled={aiLoading}
                className={`w-full md:w-max px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg ${
                  aiLoading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-primary hover:scale-[1.02] hover:shadow-yellow-500/20 shadow-xl'
                }`}
              >
                {aiLoading ? 'Calculating ROI...' : '✨ Generate AI Investment Report'}
              </button>

              {analysis && (
                <div className='mt-6 p-6 rounded-3xl bg-slate-900/80 border border-yellow-500/30 text-slate-200 whitespace-pre-wrap animate-fadeIn shadow-2xl backdrop-blur-md'>
                  <h3 className='text-yellow-500 font-bold mb-4 flex items-center gap-2'>
                    📊 Market Analysis Report
                  </h3>
                  {analysis}
                </div>
              )}
            </div>

            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button onClick={() => setContact(true)} className='bg-accent text-primary font-extrabold rounded-2xl uppercase hover:scale-[1.02] transition-all p-4 shadow-2xl mt-4 text-sm'>
                {t('btn_inquire')}
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
