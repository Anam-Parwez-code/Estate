import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

export default function ListingItem({ listing }) {
  // Helper function to get currency symbol (logic same)
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

  return (
    <div className='bg-slate-800/40 border border-slate-700/50 shadow-xl hover:shadow-accent/10 transition-all overflow-hidden rounded-2xl w-full sm:w-[330px] group'>
      <Link to={`/listing/${listing._id}`}>
        <div className='relative overflow-hidden'>
          <img
            src={
              listing.imageUrls[0] ||
              'https://53.fs1.hubspotusercontent-na1.net/hub/53/hubfs/Sales_Blog/real-estate-business-compressor.jpg?width=595&height=400&name=real-estate-business-compressor.jpg'
            }
            alt='listing cover'
            className='h-[320px] sm:h-[220px] w-full object-cover group-hover:scale-110 transition-transform duration-500'
          />
          {/* Badge for Type */}
          <div className='absolute top-3 left-3 bg-primary/80 backdrop-blur-sm text-accent text-[10px] font-bold px-3 py-1 rounded-full uppercase border border-accent/30'>
            For {listing.type}
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
          
          {/* --- ROYAL PRICE SECTION --- */}
          <div className='flex items-center justify-between mt-2'>
            <p className='text-accent font-bold text-xl'>
              <span className='text-sm align-top mr-1'>{getSymbol(listing.currency)}</span>
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && <span className='text-xs text-slate-400 font-normal'> / mo</span>}
            </p>
            
            {listing.offer && (
              <span className='bg-green-500/10 text-green-400 text-[10px] px-2 py-1 rounded border border-green-500/20 uppercase font-bold'>
                Offer
              </span>
            )}
          </div>
          
          {/* Features Divider */}
          <div className='border-t border-slate-700/50 mt-1 pt-3 flex gap-4 text-slate-300'>
            <div className='flex items-center gap-1 text-xs font-semibold'>
              <span className='text-accent'>•</span>
              {listing.bedrooms > 1 ? `${listing.bedrooms} Beds` : `${listing.bedrooms} Bed`}
            </div>
            <div className='flex items-center gap-1 text-xs font-semibold'>
              <span className='text-accent'>•</span>
              {listing.bathrooms > 1 ? `${listing.bathrooms} Baths` : `${listing.bathrooms} Bath`}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}