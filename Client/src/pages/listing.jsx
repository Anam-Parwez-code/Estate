import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { useSelector } from 'react-redux';
import { Navigation } from 'swiper/modules';
import 'swiper/css/bundle';
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
  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
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

  // --- PERMANENT FIX: Dynamic Symbol Helper ---
  const getSymbol = (curr) => {
    const symbols = {
      'INR': '₹',
      'SAR': 'SR',
      'AED': 'AED',
      'GBP': '£',
      'EUR': '€',
      'USD': '$'
    };
    return symbols[curr] || '₹'; // Default to INR if not found
  };
return (
    <main className='bg-primary min-h-screen pb-10'>
      {loading && <p className='text-center py-20 text-2xl text-accent animate-pulse'>Loading Majesty...</p>}
      {error && (
        <p className='text-center py-20 text-2xl text-red-400'>Something went wrong!</p>
      )}
      
      {listing && !loading && !error && (
        <div className='animate-fadeIn'>
          {/* Swiper Slider */}
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
          
          {/* Share Button Customization */}
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
              Link copied to clipboard!
            </p>
          )}

          <div className='flex flex-col max-w-4xl mx-auto p-5 my-7 gap-6'>
            {/* Title & Price Section */}
            <div className='flex flex-col gap-2'>
              <h1 className='text-3xl md:text-4xl font-bold text-white'>
                {listing.name}
              </h1>
              <p className='text-2xl font-bold text-accent'>
                {getSymbol(listing.currency)}{' '}
                {listing.offer
                  ? listing.discountPrice.toLocaleString('en-US')
                  : listing.regularPrice.toLocaleString('en-US')}
                {listing.type === 'rent' && <span className='text-sm text-slate-400 font-normal'> / month</span>}
              </p>
            </div>

            {/* Address */}
            <p className='flex items-center gap-2 text-slate-400 text-sm'>
              <FaMapMarkerAlt className='text-accent' />
              {listing.address}
            </p>
            
            {/* Badges */}
            <div className='flex gap-4'>
              <p className='bg-accent text-primary w-full max-w-[150px] font-bold text-center py-2 rounded-xl shadow-lg uppercase text-xs tracking-wider'>
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
              {listing.offer && (
                <p className='bg-green-500/10 border border-green-500/50 text-green-400 w-full max-w-[150px] font-bold text-center py-2 rounded-xl text-xs uppercase tracking-wider'>
                  {getSymbol(listing.currency)} {(+listing.regularPrice - +listing.discountPrice).toLocaleString('en-US')} DISCOUNT
                </p>
              )}
            </div>

            {/* Content Card */}
            <div className='bg-slate-800/30 p-8 rounded-3xl border border-slate-700/50 shadow-inner mt-4'>
              <h2 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
                <span className='w-8 h-[2px] bg-accent'></span> Property Overview
              </h2>
              <p className='text-slate-300 leading-relaxed mb-8'>
                {listing.description}
              </p>

              {/* Amenity Grid */}
              <ul className='grid grid-cols-2 md:grid-cols-4 gap-6 text-slate-200'>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaBed className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.bedrooms} Beds</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaBath className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.bathrooms} Baths</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaParking className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.parking ? 'Parking' : 'None'}</span>
                </li>
                <li className='flex items-center gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-700'>
                  <FaChair className='text-accent text-xl' />
                  <span className='text-sm font-semibold'>{listing.furnished ? 'Furnished' : 'Basic'}</span>
                </li>
              </ul>
            </div>

            {/* Contact Action */}
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='bg-accent text-primary font-extrabold rounded-2xl uppercase hover:scale-[1.02] transition-all p-4 shadow-2xl mt-4 text-sm'
              >
                Inquire Now
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
  