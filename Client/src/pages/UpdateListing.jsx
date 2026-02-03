import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api'; // 1. Axios Instance Import

export default function UpdateListing() {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingId = params.listingId;
        // 2. Axios GET Request
        const res = await axiosInstance.get(`/api/listing/get/${listingId}`);
        const data = res.data;

        if (data.success === false) {
          console.log(data.message);
          return;
        }
        
        setFormData({
          ...data,
          regularPrice: data.regularPrice,
          discountPrice: data.discountPrice,
          currency: data.currency || 'INR',
        });
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchListing();
  }, [params.listingId]);

  // Cloudinary Store Image (Fetch use kar sakte hain kyunki ye external API hai)
  const storeImage = async (file) => {
    const dataForm = new FormData();
    dataForm.append('file', file);
    dataForm.append('upload_preset', 'estate_preset'); 
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload`, 
        { method: 'POST', body: dataForm }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const handleImageSubmit = async () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      try {
        const urls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await storeImage(files[i]);
          urls.push(url);
        }
        setFormData({
          ...formData,
          imageUrls: formData.imageUrls.concat(urls),
        });
        setUploading(false);
      } catch (err) {
        setImageUploadError('Image upload failed (2 mb max per image)');
        setUploading(false);
      }
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({ ...formData, type: e.target.id });
    }
    if (['parking', 'furnished', 'offer'].includes(e.target.id)) {
      setFormData({ ...formData, [e.target.id]: e.target.checked });
    }
    if (['number', 'text', 'textarea'].includes(e.target.type)) {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) return setError(t('error_min_image'));
      if (+formData.regularPrice < +formData.discountPrice) return setError(t('error_price'));
      
      setLoading(true);
      setError(false);

      // 3. Axios POST Request for Update
      const res = await axiosInstance.post(`/api/listing/update/${params.listingId}`, {
        ...formData,
        userRef: currentUser._id,
      });

      const data = res.data;
      setLoading(false);
      
      if (data.success === false) {
        setError(data.message);
        return;
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };
  return (
    <main className='bg-primary min-h-screen p-3 pb-10'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-center my-10 text-white'>
          {t('update_title').split(' ')[0]} <span className='text-accent'>{t('update_title').split(' ').slice(1).join(' ')}</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-6'>
          <div className='flex flex-col gap-4 flex-1'>
            <input type='text' placeholder={t('ph_prop_name')} className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' id='name' required onChange={handleChange} value={formData.name} />
            <textarea placeholder={t('ph_description')} className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all min-h-[120px]' id='description' required onChange={handleChange} value={formData.description} />
            <input type='text' placeholder={t('ph_address')} className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' id='address' required onChange={handleChange} value={formData.address} />

            <div className='flex gap-6 flex-wrap bg-slate-800/30 p-4 rounded-xl border border-slate-700/50'>
              <div className='flex gap-2 items-center text-slate-200'>
                <input type='checkbox' id='sale' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.type === 'sale'} />
                <span>{t('check_sell')}</span>
              </div>
              <div className='flex gap-2 items-center text-slate-200'>
                <input type='checkbox' id='rent' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.type === 'rent'} />
                <span>{t('check_rent')}</span>
              </div>
              <div className='flex gap-2 items-center text-slate-200'>
                <input type='checkbox' id='parking' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.parking} />
                <span>{t('check_parking')}</span>
              </div>
              <div className='flex gap-2 items-center text-slate-200'>
                <input type='checkbox' id='furnished' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.furnished} />
                <span>{t('check_furnished')}</span>
              </div>
              <div className='flex gap-2 items-center text-slate-200'>
                <input type='checkbox' id='offer' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.offer} />
                <span>{t('check_offer')}</span>
              </div>
            </div>

            <div className='flex flex-wrap gap-6 border-t border-slate-700 pt-6'>
              <div className='flex items-center gap-2'>
                <input type='number' id='bedrooms' min='1' max='10' required className='p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-accent w-20' onChange={handleChange} value={formData.bedrooms} />
                <p className='text-slate-300 font-medium'>{t('label_beds')}</p>
              </div>
              <div className='flex items-center gap-2'>
                <input type='number' id='bathrooms' min='1' max='10' required className='p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-accent w-20' onChange={handleChange} value={formData.bathrooms} />
                <p className='text-slate-300 font-medium'>{t('label_baths')}</p>
              </div>
              

              <div className='flex items-center gap-2'>
                <input type='number' id='regularPrice' min='50' max='10000000' required className='p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-accent' onChange={handleChange} value={formData.regularPrice} />
                <div className='flex flex-col items-start text-slate-300'>
                  <p className='text-sm font-semibold'>{t('label_regular_price')}</p>
                  {formData.type === 'rent' && <span className='text-[10px] text-slate-500'>{formData.currency} / {t('unit_month')}</span>}
                </div>
              </div>

              {formData.offer && (
                <div className='flex items-center gap-2'>
                  <input type='number' id='discountPrice' min='0' max='10000000' required className='p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:border-accent' onChange={handleChange} value={formData.discountPrice} />
                  <div className='flex flex-col items-start text-accent'>
                    <p className='text-sm font-semibold'>{t('label_discount_price')}</p>
                    {formData.type === 'rent' && <span className='text-[10px] text-accent/70'>({formData.currency || 'INR'} / {t('unit_month')})</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='flex flex-col flex-1 gap-4'>
            <p className='font-semibold text-white'>
              {t('gallery_title').split(' ')[0]} <span className='text-accent'>{t('gallery_title').split(' ')[1]}</span> 
              <span className='font-normal text-slate-400 ml-2 text-xs'>{t('gallery_max')}</span>
            </p>
            
            <div onClick={() => document.getElementById('images').click()} className='border-2 border-dashed border-slate-700 hover:border-accent bg-slate-800/20 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group'>
              <svg className="w-10 h-10 text-slate-500 group-hover:text-accent mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className='text-slate-400 group-hover:text-slate-200 text-sm text-center'>
                {t('gallery_change').split(' ')[0]} <span className='text-accent font-bold'>{t('gallery_change').split(' ').slice(1).join(' ')}</span>
              </p>
              <input onChange={(e) => setFiles(e.target.files)} className='hidden' type='file' id='images' accept='image/*' multiple />
            </div>

            <div className='flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700'>
              <span className='text-xs text-slate-300'>{files.length} files selected</span>
              <button type='button' disabled={uploading} onClick={handleImageSubmit} className='px-6 py-2 bg-accent/10 text-accent border border-accent/50 rounded-lg uppercase text-xs font-bold hover:bg-accent hover:text-primary transition-all disabled:opacity-50'>
                {uploading ? t('gallery_uploading') : t('gallery_upload')}
              </button>
            </div>

            <p className='text-red-400 text-xs text-center'>{imageUploadError && imageUploadError}</p>
            
            <div className='grid grid-cols-2 gap-3 mt-2'>
              {formData.imageUrls.map((url, index) => (
                <div key={url} className='relative group overflow-hidden rounded-xl border border-slate-700 shadow-lg aspect-square'>
                  <img src={url} alt='listing' className='w-full h-full object-cover transition-transform group-hover:scale-110' />
                  <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                    <button type='button' onClick={() => handleRemoveImage(index)} className='bg-red-500 text-white p-2 px-4 rounded-full text-xs font-bold uppercase shadow-lg'>
                      Delete
                    </button>
                  </div>
                  {index === 0 && <span className='absolute top-2 left-2 bg-accent text-primary text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase'>{t('gallery_cover')}</span>}
                </div>
              ))}
            </div>

            <button disabled={loading || uploading} className='p-4 bg-accent text-primary font-bold rounded-xl uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-4 w-full'>
              {loading ? t('btn_updating') : t('btn_save_changes')}
            </button>
            {error && <p className='text-red-400 text-sm text-center mt-2'>{error}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}