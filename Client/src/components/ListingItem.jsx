import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';
import { useTranslation } from 'react-i18next'; // 1. Import

export default function ListingItem({ listing }) {
  const { t, i18n } = useTranslation(); // 2. Initialize

  const getSymbol = (curr) => {
    const symbols = {
      'INR': '₹', 'SAR': 'SR', 'AED': 'AED',
      'GBP': '£', 'EUR': '€', 'USD': '$'
    };
    return symbols[curr] || '₹';
  };

  // Arabic ke liye price format fix karne ke liye locale check
  const currentLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className='bg-slate-800/40 border border-slate-700/50 shadow-xl hover:shadow-accent/10 transition-all overflow-hidden rounded-2xl w-full sm:w-[330px] group'>
      <Link to={`/listing/${listing._id}`}>
        <div className='relative overflow-hidden bg-slate-700'>
          <img
            src={
              listing.imageUrls && listing.imageUrls.length > 0
             ? listing.imageUrls[0] 
             : 'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg'
            }
            alt='listing cover'
            fetchpriority="high" 
            decoding="async"
            loading="eager"
            className='h-[320px] sm:h-[220px] w-full object-cover group-hover:scale-110 transition-transform duration-500'
          />
          {/* --- TRANSLATED BADGE --- */}
          <div className='absolute top-3 left-3 bg-primary/80 backdrop-blur-sm text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-accent/30'>
            {t('badge_for')} {listing.type === 'rent' ? t('type_rent') : t('type_sale')}
          </div>
        </div>

        <div className='p-4 flex flex-col gap-3 w-full'>
          <p className='truncate text-xl font-bold text-white group-hover:text-accent transition-colors'>
            {listing.name}
          </p>
          
          <div className='flex items-center gap-1'>
            <MdLocationOn className='h-4 w-4 text-accent' />
            <p className='text-sm text-slate-400 truncate w-full'>
              {listing.address}
            </p>
          </div>

          <p className='text-sm text-slate-500 line-clamp-2 italic'>
            {listing.description}
          </p>
          
          <div className='flex items-center justify-between mt-2'>
            <p className='text-accent font-bold text-xl'>
              <span className='text-sm align-top mr-1'>{getSymbol(listing.currency)}</span>
              {listing.offer
                ? listing.discountPrice.toLocaleString(currentLocale)
                : listing.regularPrice.toLocaleString(currentLocale)}
              {listing.type === 'rent' && (
                <span className='text-xs text-slate-400 font-normal'> {t('unit_mo')}</span>
              )}
            </p>
            
            {listing.offer && (
              <span className='bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20 uppercase font-bold'>
                {t('type_offer')}
              </span>
            )}
          </div>
          
          {/* --- TRANSLATED FEATURES (BEDS/BATHS) --- */}
          <div className='border-t border-slate-700/50 mt-1 pt-3 flex gap-4 text-slate-300'>
            <div className='flex items-center gap-1 text-xs font-semibold'>
              <span className='text-accent'>•</span>
              {listing.bedrooms > 1 
                ? t('feature_beds', { count: listing.bedrooms }) 
                : t('feature_beds_one', { count: 1 })}
            </div>
            <div className='flex items-center gap-1 text-xs font-semibold'>
              <span className='text-accent'>•</span>
              {listing.bathrooms > 1 
                ? t('feature_baths', { count: listing.bathrooms }) 
                : t('feature_baths_one', { count: 1 })}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
