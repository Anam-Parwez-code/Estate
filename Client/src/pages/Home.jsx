import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation,Autoplay } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
import AIChatbot from '../components/AIChatbot.jsx';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api'; // 1. Import Axios Instance

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  const { t } = useTranslation();
  SwiperCore.use([Navigation,Autoplay]);

  useEffect(() => {
    // 2. Fetch ki jagah axiosInstance.get use karein
    const fetchOfferListings = async () => {
      try {
        const res = await axiosInstance.get('/api/listing/get?offer=true&limit=4');
        const data = res.data; // Axios mein seedha res.data use karein
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await axiosInstance.get('/api/listing/get?type=rent&limit=4');
        const data = res.data;
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await axiosInstance.get('/api/listing/get?type=sale&limit=4');
        const data = res.data;
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
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

   {/* Swiper Section - Top Featured Listings */}
<div className='max-w-7xl mx-auto'>
 <Swiper 
  modules={[Navigation, Autoplay]} 
  navigation 
  autoplay={{ delay: 3000, disableOnInteraction: false }}
    loop={true}
  
  >
    {offerListings && offerListings.length > 0 &&
      offerListings.map((listing) => (
        <SwiperSlide key={listing._id}>
        <div className='relative w-full h-[550px]'>
             <img 
                src={listing.imageUrls[0]} 
                alt={listing.name}
                fetchpriority="high" // Sabse pehle load hogi
                className='w-full h-full object-cover' 
             />
             {/* Overlay for Price/Name (Optional - Professional Look) */}
             <div className='absolute bottom-10 left-10 bg-black/50 backdrop-blur-md p-4 rounded-lg border border-white/10'>
                <p className='text-white text-2xl font-bold'>{listing.name}</p>
                <p className='text-accent text-xl font-semibold'>
                   {listing.offer ? listing.discountPrice.toLocaleString() : listing.regularPrice.toLocaleString()} 
                   <span className='text-sm uppercase ml-1'>{listing.currency || 'AED'}</span>
                </p>
             </div>
          </div>
        </SwiperSlide>
      ))
    }
  </Swiper>
</div>
      {/* Listings Section */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-white'>{t('home_recent_offers')}</h2>
              <Link className='text-sm text-accent hover:underline' to={'/search?offer=true'}>
                {t('home_show_more_offers')}
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {rentListings && rentListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-white'>{t('home_recent_rent')}</h2>
              <Link className='text-sm text-accent hover:underline' to={'/search?type=rent'}>
                {t('home_show_more_rent')}
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}

        {saleListings && saleListings.length > 0 && (
          <div>
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-white'>{t('home_recent_sale')}</h2>
              <Link className='text-sm text-accent hover:underline' to={'/search?type=sale'}>
                {t('home_show_more_sale')}
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
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
