import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api'; // 1. Axios Instance Import

export default function Search() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true' ? true : false,
        furnished: furnishedFromUrl === 'true' ? true : false,
        offer: offerFromUrl === 'true' ? true : false,
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      
      try {
        // 2. Axios GET Request
        const res = await axiosInstance.get(`/api/listing/get?${searchQuery}`);
        const data = res.data; // .json() ki zaroorat nahi

        if (data.length > 8) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }
        setListings(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchListings();
  }, [location.search]);

  // --- Debounce effect logic stays the same ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const urlParams = new URLSearchParams();
      urlParams.set('searchTerm', sidebardata.searchTerm);
      urlParams.set('type', sidebardata.type);
      urlParams.set('parking', sidebardata.parking);
      urlParams.set('furnished', sidebardata.furnished);
      urlParams.set('offer', sidebardata.offer);
      urlParams.set('sort', sidebardata.sort);
      urlParams.set('order', sidebardata.order);
      const searchQuery = urlParams.toString();
      navigate(`/search?${searchQuery}`);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [sidebardata, navigate]);

  const handleChange = (e) => {
    if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
      setSidebardata({ ...sidebardata, type: e.target.id });
    }
    if (e.target.id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: e.target.value });
    }
    if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
      setSidebardata({
        ...sidebardata,
        [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false,
      });
    }
    if (e.target.id === 'sort_order') {
      const sort = e.target.value.split('_')[0] || 'created_at';
      const order = e.target.value.split('_')[1] || 'desc';
      setSidebardata({ ...sidebardata, sort, order });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', sidebardata.searchTerm);
    urlParams.set('type', sidebardata.type);
    urlParams.set('parking', sidebardata.parking);
    urlParams.set('furnished', sidebardata.furnished);
    urlParams.set('offer', sidebardata.offer);
    urlParams.set('sort', sidebardata.sort);
    urlParams.set('order', sidebardata.order);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const startIndex = numberOfListings;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    const searchQuery = urlParams.toString();
    
    try {
      // 3. Axios for 'Show More' functionality
      const res = await axiosInstance.get(`/api/listing/get?${searchQuery}`);
      const data = res.data;
      if (data.length < 9) {
        setShowMore(false);
      }
      setListings([...listings, ...data]);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className='flex flex-col md:flex-row bg-primary min-h-screen'>
      {/* --- SIDEBAR --- */}
      <div className='p-8 border-b-2 md:border-b-0 md:border-r border-slate-700/50 md:min-h-screen bg-slate-800/20 backdrop-blur-sm'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
          <div className='flex flex-col gap-3'>
            <label className='whitespace-nowrap font-bold text-accent uppercase text-xs tracking-widest'>
              {t('search_label')}
            </label>
            <input
              type='text'
              id='searchTerm'
              placeholder={t('search_ph')}
              className='bg-slate-900 border border-slate-700 text-white rounded-xl p-3 w-full focus:border-accent outline-none transition-all'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-4'>
            <label className='font-bold text-slate-400 text-xs uppercase tracking-widest'>{t('type_label')}</label>
            <div className='flex gap-4 flex-wrap text-slate-300'>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='all' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.type === 'all'} />
                <span className='text-sm'>{t('type_all')}</span>
              </div>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='rent' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.type === 'rent'} />
                <span className='text-sm'>{t('type_rent')}</span>
              </div>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='sale' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.type === 'sale'} />
                <span className='text-sm'>{t('type_sale')}</span>
              </div>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='offer' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.offer} />
                <span className='text-sm font-bold text-green-400'>{t('type_offer')}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            <label className='font-bold text-slate-400 text-xs uppercase tracking-widest'>{t('amenities_label')}</label>
            <div className='flex gap-4 text-slate-300'>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='parking' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.parking} />
                <span className='text-sm'>{t('parking_yes')}</span>
              </div>
              <div className='flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800'>
                <input type='checkbox' id='furnished' className='w-4 h-4 accent-accent' onChange={handleChange} checked={sidebardata.furnished} />
                <span className='text-sm'>{t('furnished_yes')}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-3'>
            <label className='font-bold text-slate-400 text-xs uppercase tracking-widest'>{t('order_label')}</label>
            <select
              onChange={handleChange}
              defaultValue={'created_at_desc'}
              id='sort_order'
              className='bg-slate-900 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-accent'
            >
              <option value='regularPrice_desc'>{t('sort_high_low')}</option>
              <option value='regularPrice_asc'>{t('sort_low_high')}</option>
              <option value='createdAt_desc'>{t('sort_newest')}</option>
              <option value='createdAt_asc'>{t('sort_oldest')}</option>
            </select>
          </div>

          <button className='bg-accent text-primary font-bold p-4 rounded-xl uppercase hover:opacity-90 shadow-xl transition-all mt-4'>
            {t('btn_search')}
          </button>
        </form>
      </div>

      {/* --- RESULTS --- */}
      <div className='flex-1 p-6'>
        <h1 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'>
          <span className='w-2 h-8 bg-accent rounded-full'></span>
          {t('results_title')}
        </h1>
        
        <div className='flex flex-wrap gap-6 justify-center md:justify-start'>
          {!loading && listings.length === 0 && (
            <div className='w-full text-center py-20'>
              <p className='text-xl text-slate-500 italic'>{t('no_results')}</p>
            </div>
          )}
          
          {loading && (
            <div className='w-full text-center py-20'>
               <p className='text-2xl text-accent animate-pulse font-bold tracking-widest uppercase'>{t('searching')}</p>
            </div>
          )}

          {!loading && listings && listings.map((listing) => (
            <ListingItem key={listing._id} listing={listing} />
          ))}

          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='text-accent hover:text-white hover:underline p-7 text-center w-full font-bold transition-all'
            >
              {t('btn_show_more')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}