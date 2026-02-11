
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';

// ✅ CORRECT IMPORTS
import 'swiper/css';
import 'swiper/css/navigation';

import ListingItem from '../components/ListingItem';
import AIChatbot from '../components/AIChatbot.jsx';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // ✅ FIX 1: PARALLEL API CALLS - 3x FASTER!
    const fetchAllListings = async () => {
      try {
        setLoading(true);
        
        // Sab ek saath fetch - much faster!
        const [offersRes, rentRes, saleRes] = await Promise.all([
          axiosInstance.get('/api/listing/get?offer=true&limit=4'),
          axiosInstance.get('/api/listing/get?type=rent&limit=4'),
          axiosInstance.get('/api/listing/get?type=sale&limit=4')
        ]);

        setOfferListings(offersRes.data);
        setRentListings(rentRes.data);
        setSaleListings(saleRes.data);
        
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  const allListings = [...(offerListings || []), ...(rentListings || []), ...(saleListings || [])];

  return (
    <div className='bg-primary min-h-screen'>
      <Helmet>
        <title>{t('meta_title')}</title>
        <meta name='description' content={t('meta_desc')} />
      </Helmet>

      {/* Hero Section */}
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-white font-bold text-3xl lg:text-6xl'>
          {t('home_hero_title').split(t('home_hero_span'))[0]}
          <span className='text-accent'>{t('home_hero_span')}</span>
          {t('home_hero_title').split(t('home_hero_span'))[1]}
        </h1>
        <div className='text-slate-400 text-xs sm:text-sm'>
          {t('home_hero_sub')}
        </div>
        <Link
          to={'/search'}
          className='text-xs sm:text-sm text-accent font-bold hover:underline'
        >
          {t('home_get_started')}
        </Link>
      </div>

      {/* ✅ FIX 2: SWIPER WITH PROPER HEIGHT */}
      {loading ? (
        <div className='w-full h-[550px] bg-slate-800/50 animate-pulse flex items-center justify-center'>
          <p className='text-white text-xl'>Loading properties...</p>
        </div>
      ) : (
        offerListings && offerListings.length > 0 && (
          <div className='w-full h-[550px] mb-10'> 
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={offerListings.length > 1}
              className='h-full w-full' {/* ⚡ Full height */}
            >
              {offerListings.map((listing) => (
                <SwiperSlide key={listing._id} className='h-full'> 
                  <Link to={`/listing/${listing._id}`} className='block h-full'>
                    <div className='relative w-full h-full'>
                      <img 
                        src={listing.imageUrls[0]} 
                        alt={listing.name}
                        className='w-full h-full object-cover'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent'></div>
                      <div className='absolute bottom-10 left-6 md:left-10 right-6'>
                        <h2 className='text-white text-3xl md:text-5xl font-bold mb-2 drop-shadow-2xl'>
                          {listing.name}
                        </h2>
                        <p className='text-accent text-xl md:text-3xl font-bold drop-shadow-xl'>
                          {listing.currency} {listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()}
                          {listing.type === 'rent' && ' / month'}
                        </p>
                        <p className='text-white/90 text-sm md:text-base mt-2'>
                          📍 {listing.address}
                        </p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )
      )}

      {/* ✅ FIX 3: GRID LAYOUT - FASTER RENDERING */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        
        {/* Offer Listings */}
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {[1,2,3,4].map(i => (
              <div key={i} className='bg-slate-800/50 h-64 animate-pulse rounded-lg'></div>
            ))}
          </div>
        ) : (
          offerListings && offerListings.length > 0 && (
            <div>
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-white'>{t('home_recent_offers')}</h2>
                <Link className='text-sm text-accent hover:underline' to={'/search?offer=true'}>
                  {t('home_show_more_offers')}
                </Link>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {offerListings.map((listing) => (
                  <ListingItem listing={listing} key={listing._id} />
                ))}
              </div>
            </div>
          )
        )}

        {/* Rent Listings */}
        {!loading && rentListings && rentListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-white'>{t('home_recent_rent')}</h2>
              <Link className='text-sm text-accent hover:underline' to={'/search?type=rent'}>
                {t('home_show_more_rent')}
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {/* Sale Listings */}
        {!loading && saleListings && saleListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-white'>{t('home_recent_sale')}</h2>
              <Link className='text-sm text-accent hover:underline' to={'/search?type=sale'}>
                {t('home_show_more_sale')}
              </Link>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AIChatbot listings={allListings} />
    </div>
  );
}
