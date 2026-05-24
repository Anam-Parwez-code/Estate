import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api'; // 1. Axios Import
import { getOptimizedImageUrl } from '../utils/image';

export default function Profile() {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingsClicked, setShowListingsClicked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    try {
      const formDataCloud = new FormData();
      formDataCloud.append("file", file);
      formDataCloud.append("upload_preset", "estate_preset");

      // Cloudinary fetch ko aise hi rehne dein kyunki ye external hai
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload`,
        { method: "POST", body: formDataCloud }
      );

      const data = await res.json();
      if (data.secure_url) {
        setFormData({ ...formData, avatar: data.secure_url });
        dispatch(updateUserStart());
        
        // Backend update using Axios
        const updateRes = await axiosInstance.post(`/api/user/update/${currentUser._id}`, {
          avatar: data.secure_url 
        });
        
        dispatch(updateUserSuccess(updateRes.data));
        setUpdateSuccess(true);
      }
    } catch (err) {
      setFileUploadError(true);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      // 2. Axios Update
      const res = await axiosInstance.post(`/api/user/update/${currentUser._id}`, formData);
      dispatch(updateUserSuccess(res.data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      // 3. Axios Delete
      const res = await axiosInstance.delete(`/api/user/delete/${currentUser._id}`);
      dispatch(deleteUserSuccess(res.data));
    } catch (error) {
      dispatch(deleteUserFailure(error.response?.data?.message || error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      // 4. Axios SignOut (GET request usually)
      const res = await axiosInstance.get('/api/auth/signout');
      dispatch(deleteUserSuccess(res.data));
    } catch (error) {
      dispatch(deleteUserFailure(error.response?.data?.message || error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      setShowListingsClicked(true);
      // 5. Axios Get Listings
      const res = await axiosInstance.get(`/api/user/listings/${currentUser._id}`);
      setUserListings(res.data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      // 6. Axios Delete Listing
      await axiosInstance.delete(`/api/listing/delete/${listingId}`);
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className='bg-primary min-h-screen pb-20'>
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-bold text-center my-10 text-white'>
          {t('profile_title').split(' ')[0]} <span className='text-accent'>{t('profile_title').split(' ')[1]}</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <input onChange={(e) => setFile(e.target.files[0])} type='file' ref={fileRef} hidden accept='image/*' />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt='profile'
            className='rounded-full h-28 w-28 object-cover cursor-pointer self-center mt-2 border-4 border-accent/30 hover:border-accent transition-all shadow-xl'
          />
          <p className='text-sm self-center'>
            {fileUploadError ? (
              <span className='text-red-500 font-medium'>{t('upload_err')}</span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-300'>{`${t('uploading')} ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-500 font-medium'>{t('upload_success')}</span>
            ) : null}
          </p>

          <input type='text' placeholder={t('ph_username')} defaultValue={currentUser.username} id='username' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='email' placeholder={t('ph_email')} id='email' defaultValue={currentUser.email} className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='password' placeholder={t('ph_password')} id='password' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='text' placeholder={t('ph_whatsapp')} defaultValue={currentUser.phone} id='phone' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />

          <button disabled={loading} className='bg-accent text-primary font-bold rounded-xl p-3 uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'>
            {loading ? t('btn_processing') : t('btn_update')}
          </button>
          
          <Link className='bg-white/5 text-accent border border-accent/30 p-3 rounded-xl uppercase text-center hover:bg-accent/10 transition-all font-bold' to={'/create-listing'}>
            {t('btn_create_listing')}
          </Link>
        </form>

        <div className='flex justify-between mt-6 px-2'>
          <span onClick={handleDeleteUser} className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'>{t('delete_account')}</span>
          <span onClick={handleSignOut} className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'>{t('sign_out')}</span>
        </div>

        <p className='text-red-500 mt-5 text-center font-medium'>{error ? error : ''}</p>
        <p className='text-green-500 mt-5 text-center font-medium'>{updateSuccess ? t('profile_updated') : ''}</p>

        <button onClick={handleShowListings} className='text-accent hover:text-white transition-colors w-full mt-8 font-bold text-lg border-b border-accent/20 pb-2'>
          {t('view_listings')}
        </button>

        <p className='text-red-500 mt-5 text-center'>{showListingsError ? t('err_listings') : ''}</p>

        {!showListingsError && showListingsClicked && userListings.length === 0 && (
          <div className='mt-10 p-10 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl text-center'>
            <p className='text-slate-400 text-lg mb-4'>{t('no_listings')}</p>
            <Link to='/create-listing' className='text-accent hover:text-white font-bold text-xl transition-colors'>{t('create_prop')}</Link>
          </div>
        )}
      </div>

      <div className='max-w-6xl mx-auto px-3'>
        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-6 mt-10'>
            <h2 className='text-center text-3xl font-bold text-white mb-4'>{t('your_royal_props').split(' ')[0]} {t('your_royal_props').split(' ')[1]} <span className='text-accent'>{t('your_royal_props').split(' ')[2]}</span></h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {userListings.map((listing) => (
                <div key={listing._id} className='bg-slate-800/40 border border-slate-700 rounded-3xl p-5 flex flex-col gap-4 hover:shadow-2xl hover:border-accent/50 transition-all duration-300 group'>
                  <Link to={`/listing/${listing._id}`} className='relative overflow-hidden rounded-2xl'>
                    <img
                      src={getOptimizedImageUrl(listing.imageUrls[0], { width: 520, height: 320 })}
                      alt='listing cover'
                      loading='lazy'
                      decoding='async'
                      className='h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500'
                    />
                    <div className='absolute top-3 right-3 bg-primary/80 text-accent px-3 py-1 rounded-full text-xs font-bold'>
                      {listing.type === 'rent' ? 'RENT' : 'SALE'}
                    </div>
                  </Link>
                  <Link to={`/listing/${listing._id}`}>
                    <p className='text-slate-100 font-bold text-xl truncate group-hover:text-accent transition-colors'>{listing.name}</p>
                  </Link>
                  <div className='flex justify-between items-center border-t border-slate-700/50 pt-4 mt-auto'>
                    <button onClick={() => handleListingDelete(listing._id)} className='text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider'>{t('btn_delete')}</button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className='bg-accent text-primary px-5 py-2 rounded-xl text-xs font-bold uppercase hover:bg-white transition-all'>{t('btn_edit')}</button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
