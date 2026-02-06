import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api';
import axios from 'axios'; // Import axios for direct backend call
import { FaPlus } from 'react-icons/fa';

export default function CreateListing() {
  const { t } = useTranslation();
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
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
    currency: 'INR',
  });
  
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false); // AI Loading State

  // --- NEW: JAIS AI GENERATOR LOGIC ---
  const handleAiGenerate = async () => {
    if (!formData.name || !formData.address) {
      alert("Please enter Property Name and Address first!");
      return;
    }

    setGenerating(true);
    try {
      const res = await axios.post("https://royal-estate-ai.onrender.com/generate-listing-ai", {
        title: formData.name,
        location: formData.address,
        features: `Bedrooms: ${formData.bedrooms}, Bathrooms: ${formData.bathrooms}, Furnished: ${formData.furnished ? 'Yes' : 'No'}`
      });

      if (res.data.content) {
        setFormData({
          ...formData,
          description: res.data.content
        });
      }
    } catch (err) {
      console.error("AI Gen Error:", err);
      alert("AI Service is currently busy. Try again in a moment.");
    } finally {
      setGenerating(false);
    }
  };

  // ... (storeImage, handleImageSubmit, handleRemoveImage, handleChange remain same) ...
  const storeImage = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'estate_preset'); 
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload`, {
        method: 'POST',
        body: data,
      });
      const res = await response.json();
      return res.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
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
    if (['number', 'text', 'textarea'].includes(e.target.type) || e.target.id === 'currency') {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1) return setError('You must upload at least one image');
      if (formData.offer && +formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      
      setLoading(true);
      setError(false);

      const res = await axiosInstance.post('/api/listing/create', {
        ...formData,
        userRef: currentUser._id,
      });

      const data = res.data;
      setLoading(false);
      if (data.success === false) return setError(data.message);
      if(data._id) navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  return (
    <main className='bg-primary min-h-screen p-3 pb-10 text-white'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-center my-10'>
          {t('create_title')}
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-6'>
          <div className='flex flex-col gap-4 flex-1'>
            <input 
              type='text' 
              placeholder={t('prop_name')} 
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl outline-none focus:border-accent' 
              id='name' 
              required 
              onChange={handleChange} 
              value={formData.name} 
            />
            
            {/* --- AI DESCRIPTION BOX --- */}
            <div className='flex flex-col gap-2'>
              <div className='flex justify-between items-center'>
                <label className='text-sm font-semibold text-slate-300'>{t('prop_desc')}</label>
                <button
                  type='button'
                  onClick={handleAiGenerate}
                  disabled={generating}
                  className='bg-accent/20 text-accent border border-accent/30 text-[10px] px-3 py-1 rounded-lg font-bold hover:bg-accent hover:text-primary transition-all disabled:opacity-50'
                >
                  {generating ? '✨ Writing...' : '✨ Generate with JAIS AI'}
                </button>
              </div>
              <textarea 
                placeholder="Describe your property or use AI..."
                className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl outline-none focus:border-accent min-h-[120px]' 
                id='description' 
                required 
                onChange={handleChange} 
                value={formData.description} 
              />
            </div>

            <input 
              type='text' 
              placeholder={t('prop_addr')}
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl outline-none focus:border-accent' 
              id='address' 
              required 
              onChange={handleChange} 
              value={formData.address} 
            />

            {/* Checkboxes */}
            <div className='flex gap-6 flex-wrap bg-slate-800/30 p-4 rounded-xl border border-slate-700/50'>
              <div className='flex gap-2 items-center'>
                <input type='checkbox' id='sale' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.type === 'sale'} />
                <span>{t('type_sell')}</span>
              </div>
              <div className='flex gap-2 items-center'>
                <input type='checkbox' id='rent' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.type === 'rent'} />
                <span>{t('type_rent')}</span>
              </div>
              <div className='flex gap-2 items-center'>
                <input type='checkbox' id='parking' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.parking} />
                <span>{t('feat_parking')}</span>
              </div>
              <div className='flex gap-2 items-center'>
                <input type='checkbox' id='furnished' className='w-5 h-5 accent-accent' onChange={handleChange} checked={formData.furnished} />
                <span>{t('feat_furnished')}</span>
              </div>
            </div>

            {/* Beds/Baths */}
            <div className='flex flex-wrap gap-6 bg-slate-800/20 p-4 rounded-xl border border-slate-700/50 mt-2'>
              <div className='flex items-center gap-3'>
                <input type='number' id='bedrooms' min='1' max='10' required className='p-3 bg-slate-800 border border-slate-700 rounded-xl w-20' onChange={handleChange} value={formData.bedrooms} />
                <p>{t('label_beds')}</p>
              </div>
              <div className='flex items-center gap-3'>
                <input type='number' id='bathrooms' min='1' max='10' required className='p-3 bg-slate-800 border border-slate-700 rounded-xl w-20' onChange={handleChange} value={formData.bathrooms} />
                <p>{t('label_baths')}</p>
              </div>
            </div>

            {/* Pricing */}
            <div className='flex flex-wrap gap-6 border-t border-slate-700 pt-6'>
              <select id='currency' onChange={handleChange} value={formData.currency} className='p-3 bg-slate-800 border border-slate-700 rounded-xl'>
                <option value="INR">INR (₹)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <div className='flex items-center gap-2'>
                <input type='number' id='regularPrice' required className='p-3 bg-slate-800 border border-slate-700 rounded-xl' onChange={handleChange} value={formData.regularPrice} />
                <p className='text-xs'>{t('label_reg_price')}</p>
              </div>
            </div>
          </div>

          {/* Right Side */}
        <div className='flex flex-col flex-1 gap-4'>
  <p className='font-semibold'>
    {t('gallery_title')} <span className='text-xs font-normal text-slate-400'>(Max 6)</span>
  </p>

  {/* Grid Layout for Plus Button and Previews */}
  <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
    
    {/* 1. PLUS BUTTON (Custom File Input) */}
    {formData.imageUrls.length < 6 && (
      <label className='flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-accent hover:bg-slate-800/50 transition-all group'>
        <span className='text-3xl text-slate-500 group-hover:text-accent transition-colors'>+</span>
        <span className='text-[10px] text-slate-500 group-hover:text-accent uppercase font-bold'>Add Photo</span>
        <input 
          type='file' 
          id='images' 
          accept='image/*' 
          multiple 
          className='hidden' 
          onChange={(e) => setFiles(e.target.files)} 
        />
      </label>
    )}

    {/* 2. IMAGE PREVIEWS (Map existing URLs) */}
    {formData.imageUrls.map((url, index) => (
      <div key={url} className='relative group rounded-xl overflow-hidden border border-slate-700 h-24 shadow-md'>
        <img src={url} alt='listing' className='w-full h-full object-cover' />
        <button 
          type='button' 
          onClick={() => handleRemoveImage(index)} 
          className='absolute inset-0 bg-red-600/60 text-white opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase'
        >
          Remove
        </button>
      </div>
    ))}
  </div>

  {/* 3. UPLOAD/CONFIRM BUTTON (Dikhayega jab files select hongi) */}
  {files.length > 0 && (
    <button 
      type='button' 
      disabled={uploading} 
      onClick={handleImageSubmit} 
      className='p-2 text-accent border border-accent rounded-xl hover:bg-accent hover:text-primary transition-all uppercase text-xs font-bold disabled:opacity-50'
    >
      {uploading ? t('btn_uploading') : `Confirm Upload (${files.length} files)`}
    </button>
  )}

  <p className='text-red-400 text-xs'>{imageUploadError && imageUploadError}</p>

  <button 
    disabled={loading || uploading} 
    className='p-4 bg-accent text-primary font-bold rounded-xl uppercase hover:opacity-90 shadow-lg mt-4 disabled:opacity-50'
  >
    {loading ? t('btn_creating') : t('btn_publish')}
  </button>
  
  {error && <p className='text-red-400 text-sm mt-2'>{error}</p>}
</div>
        </form>
      </div>
    </main>
  );
}
