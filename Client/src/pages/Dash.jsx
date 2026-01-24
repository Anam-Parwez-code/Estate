import { useSelector, useDispatch } from 'react-redux';
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

  // Upload file to Cloudinary
  const handleFileUpload = async (file) => {
    try {
      setFileUploadError(false);
      setFilePerc(0);

      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', 'estate_preset'); // Replace with your Cloudinary preset
      form.append('folder', 'profile_photos'); // Optional

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload', // Replace with your Cloud name
        {
          method: 'POST',
          body: form,
        }
      );

      if (!res.ok) throw new Error('Image upload failed');

      const data = await res.json();
      setFormData({ ...formData, avatar: data.secure_url });
      dispatch(updateUserSuccess({ ...currentUser, avatar: data.secure_url }));
      setFilePerc(100);
    } catch (err) {
      console.error(err);
      setFileUploadError(true);
    }
  };

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

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
    } catch (err) {
      dispatch(updateUserFailure(err.message));
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
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
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
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
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
    } catch (err) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <img
          src={formData.avatar || currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          onClick={() => fileRef.current.click()}
        />
        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error uploading image (max 2MB)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image uploaded successfully!</span>
          ) : (
            ''
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Update'}
        </button>

        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span className="text-red-700 cursor-pointer" onClick={handleDeleteUser}>
          Delete account
        </span>
        <span className="text-red-700 cursor-pointer" onClick={handleSignOut}>
          Sign out
        </span>
      </div>

      <p className="text-red-700 mt-5">{error || ''}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? 'User updated successfully!' : ''}
      </p>

      <button onClick={handleShowListings} className="text-green-700 w-full mt-3">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? 'Error showing listings' : ''}
      </p>

      {userListings.length > 0 && (
        <div className="flex flex-col gap-4 mt-5">
          <h1 className="text-center text-2xl font-semibold">Your Listings</h1>
          {userListings.map((listing) => (
            <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
              <Link to={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]} alt="listing cover" className="h-16 w-16 object-contain" />
              </Link>
              <Link
                to={`/listing/${listing._id}`}
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
              >
                {listing.name}
              </Link>
              <div className="flex flex-col items-center">
                <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
