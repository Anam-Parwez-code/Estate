import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
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
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
  try {
    const formDataCloud = new FormData();
    formDataCloud.append("file", file);
    formDataCloud.append("upload_preset", "estate_preset"); // from Cloudinary

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload`,
      {
        method: "POST",
        body: formDataCloud,
      }
    );

    const data = await res.json();
    if (data.secure_url) {
      // Update both profile formData and redux user state
      setFormData({ ...formData, avatar: data.secure_url });

      // Dispatch update to backend so DB stores new avatar
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
    console.error(err);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
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
      dispatch(deleteUserFailure(data.message));
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
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
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
 return (
    <div className='bg-primary min-h-screen pb-10'> {/* Page background dark blue */}
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-bold text-center my-10 text-white'>
          Your <span className='text-accent'>Profile</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt='profile'
            className='rounded-full h-28 w-28 object-cover cursor-pointer self-center mt-2 border-4 border-accent/30 hover:border-accent transition-all shadow-xl'
          />
          <p className='text-sm self-center'>
            {fileUploadError ? (
              <span className='text-red-500 font-medium'>
                Error Image upload (image must be less than 2 mb)
              </span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-300'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-green-500 font-medium'>Image successfully uploaded!</span>
            ) : (
              ''
            )}
          </p>

          <input
            type='text'
            placeholder='username'
            defaultValue={currentUser.username}
            id='username'
            className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='email'
            id='email'
            defaultValue={currentUser.email}
            className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
            onChange={handleChange}
          />
          <input
            type='password'
            placeholder='password'
            onChange={handleChange}
            id='password'
            className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
          />

          <button
            disabled={loading}
            className='bg-accent text-primary font-bold rounded-xl p-3 uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'
          >
            {loading ? 'Processing...' : 'Update Account'}
          </button>
          
          <Link
            className='bg-white/5 text-accent border border-accent/30 p-3 rounded-xl uppercase text-center hover:bg-accent/10 transition-all font-bold'
            to={'/create-listing'}
          >
            Create New Listing
          </Link>
        </form>

        <div className='flex justify-between mt-6 px-2'>
          <span
            onClick={handleDeleteUser}
            className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'
          >
            Delete account
          </span>
          <span 
            onClick={handleSignOut} 
            className='text-red-400 hover:text-red-600 cursor-pointer text-sm font-medium transition-colors'
          >
            Sign out
          </span>
        </div>

        <p className='text-red-500 mt-5 text-center font-medium'>{error ? error : ''}</p>
        <p className='text-green-500 mt-5 text-center font-medium'>
          {updateSuccess ? 'Profile updated successfully!' : ''}
        </p>

        <button 
          onClick={handleShowListings} 
          className='text-accent hover:text-white transition-colors w-full mt-4 font-semibold decoration-accent'
        >
          View Your Property Listings
        </button>
        
        <p className='text-red-500 mt-5 text-center'>
          {showListingsError ? 'Error showing listings' : ''}
        </p>

        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-4 mb-10'>
            <h1 className='text-center mt-10 text-2xl font-bold text-white border-b border-accent/20 pb-2'>
              Your Active <span className='text-accent'>Listings</span>
            </h1>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='bg-slate-800/40 border border-slate-700 rounded-2xl p-4 flex justify-between items-center gap-4 hover:border-accent/40 transition-all'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt='listing cover'
                    className='h-16 w-16 object-cover rounded-lg shadow-md'
                  />
                </Link>
                <Link
                  className='text-slate-200 font-semibold hover:text-accent truncate flex-1 transition-colors'
                  to={`/listing/${listing._id}`}
                >
                  <p>{listing.name}</p>
                </Link>

                <div className='flex flex-col items-center gap-1'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='text-red-400 hover:text-red-600 uppercase text-xs font-bold'
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-accent hover:text-white uppercase text-xs font-bold'>
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}