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

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [showListingsClicked, setShowListingsClicked] = useState(false); // New state to track click
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

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload`,
        { method: "POST", body: formDataCloud }
      );

      const data = await res.json();
      if (data.secure_url) {
        setFormData({ ...formData, avatar: data.secure_url });
        dispatch(updateUserStart());
        const updateRes = await fetch(`/api/user/update/${currentUser._id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: data.secure_url }),
        });
        const updateData = await updateRes.json();
        if (updateData.success === false) {
          dispatch(updateUserFailure(updateData.message));
          return;
        }
        dispatch(updateUserSuccess(updateData));
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
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      setShowListingsClicked(true); // Mark that we clicked the button
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success === false) return;
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className='bg-primary min-h-screen pb-20'>
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-bold text-center my-10 text-white'>
          Your <span className='text-accent'>Profile</span>
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
              <span className='text-red-500 font-medium'>Error Image upload (less than 2 mb)</span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-300'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-500 font-medium'>Image successfully uploaded!</span>
            ) : null}
          </p>

          <input type='text' placeholder='username' defaultValue={currentUser.username} id='username' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='email' placeholder='email' id='email' defaultValue={currentUser.email} className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='password' placeholder='password' id='password' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />
          <input type='text' placeholder='WhatsApp Number' defaultValue={currentUser.phone} id='phone' className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all' onChange={handleChange} />

          <button disabled={loading} className='bg-accent text-primary font-bold rounded-xl p-3 uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'>
            {loading ? 'Processing...' : 'Update Account'}
          </button>
          
          <Link className='bg-white/5 text-accent border border-accent/30 p-3 rounded-xl uppercase text-center hover:bg-accent/10 transition-all font-bold' to={'/create-listing'}>
            Create New Listing
          </Link>
        </form>

        <div className='flex justify-between mt-6 px-2'>
          <span onClick={handleDeleteUser} className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'>Delete account</span>
          <span onClick={handleSignOut} className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'>Sign out</span>
        </div>

        <p className='text-red-500 mt-5 text-center font-medium'>{error ? error : ''}</p>
        <p className='text-green-500 mt-5 text-center font-medium'>{updateSuccess ? 'Profile updated successfully!' : ''}</p>

        <button onClick={handleShowListings} className='text-accent hover:text-white transition-colors w-full mt-8 font-bold text-lg border-b border-accent/20 pb-2'>
          View Your Property Listings ↓
        </button>

        <p className='text-red-500 mt-5 text-center'>{showListingsError ? 'Error showing listings' : ''}</p>

        {/* Empty State Logic */}
        {!showListingsError && showListingsClicked && userListings.length === 0 && (
          <div className='mt-10 p-10 bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl text-center'>
            <p className='text-slate-400 text-lg mb-4'>You haven't created any royal listings yet.</p>
            <Link to='/create-listing' className='text-accent hover:text-white font-bold text-xl transition-colors'>+ Create Property</Link>
          </div>
        )}
      </div>

      {/* Listings Grid Logic */}
      <div className='max-w-6xl mx-auto px-3'>
        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-6 mt-10'>
            <h2 className='text-center text-3xl font-bold text-white mb-4'>Your Royal <span className='text-accent'>Properties</span></h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {userListings.map((listing) => (
                <div key={listing._id} className='bg-slate-800/40 border border-slate-700 rounded-3xl p-5 flex flex-col gap-4 hover:shadow-2xl hover:border-accent/50 transition-all duration-300 group'>
                  <Link to={`/listing/${listing._id}`} className='relative overflow-hidden rounded-2xl'>
                    <img src={listing.imageUrls[0]} alt='listing cover' className='h-48 w-full object-cover group-hover:scale-110 transition-transform duration-500' />
                    <div className='absolute top-3 right-3 bg-primary/80 text-accent px-3 py-1 rounded-full text-xs font-bold'>
                      {listing.type === 'rent' ? 'RENT' : 'SALE'}
                    </div>
                  </Link>
                  <Link to={`/listing/${listing._id}`}>
                    <p className='text-slate-100 font-bold text-xl truncate group-hover:text-accent transition-colors'>{listing.name}</p>
                  </Link>
                  <div className='flex justify-between items-center border-t border-slate-700/50 pt-4 mt-auto'>
                    <button onClick={() => handleListingDelete(listing._id)} className='text-red-400 hover:text-red-600 text-xs font-bold uppercase tracking-wider'>Delete</button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className='bg-accent text-primary px-5 py-2 rounded-xl text-xs font-bold uppercase hover:bg-white transition-all'>Edit</button>
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