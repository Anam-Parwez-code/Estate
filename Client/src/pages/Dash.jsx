import { useSelector, useDispatch } from "react-redux";
import {
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
  ref,
} from "firebase/storage";
import {app} from "../firebase.js";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
} from "../redux/user/userSlice.js";
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dash() {
  const fileRef = useRef(null);

  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [fileperc, setFileperc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const dispatch = useDispatch();

 // useEffect(() => {
   // if (file) {
     // handleFileUpload(file);
    //}
  //}, [file]);

 // const handleFileUpload = async(file) => {
   // const data=new FormData();
    //if(file){
      //data.append("avatar",file);
    //}
    //data.append("username",username);
    //data.append("email",email);
    //if(password){
      ///data.append("password",password);
   // }
    //t/ry {
      //const resp=await fetch(`/api/user/update/${currentUser.user._id}`,{
        //method:"PUT",
        //headers:{
          //Authorization:`Bearer ${currentUser?.token|| localStorage.getItem("token")}`, 
          
        //},
    
  //    });
//const data=new FormData();
//data.append("file",file);
//data.append("upload_preset","estate_preset");
//data.append("folder","estate");
//const resp= await fetch("https://api.cloudinary.com/v1_1/dyuxqlwhv/image/upload",{
  //method:"POST",
  //body:data,
//});
//const result= await resp.json();
//if (result.success === false) { dispatch(updateUserFailure(result.message)); return; } dispatch(updateUserSuccess({ user: result.user, token: currentUser.token })); setUpdateSuccess(true); }
 //catch (error) { dispatch(updateUserFailure(error.message)); } };


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
          dispatch(updateUserStart());
    try {
      

      //const token = localStorage.getItem("token");
      const token=currentUser?.token||localStorage.getItem("token");
      const data=new FormData();
       if (file) data.append("avatar", file);
    if (formData.username) data.append("username", formData.username);
    if (formData.email) data.append("email", formData.email);
    if (formData.password) data.append("password", formData.password);
     // if(!token){
       // dispatch(updateUserFailure("User is not authenticated"));
        //return;
      //}
      //const data=new FormData();
      //if(file) data.append("avatar",formData.avatar);
      //console.log("Form Data:", formData.avatar);
      //Object.keys(formData).forEach((key)=> data.append(key,formData[key]));

      const resp = await fetch(`/api/user/update/${currentUser.user._id}`, {
        method: "PUT",
        headers: {
        // "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: data,
        //credentials: "include",
        //body:data,
      });
      const result= await resp.json();
      if (result.success === false) {
        dispatch(updateUserFailure(result.message));
        return;
      }
dispatch(updateUserSuccess({ user: result.user, token }));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message || "update Failed"));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const token = localStorage.getItem("token");
      const resp = await fetch(`/api/user/delete/${currentUser.user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const token = localStorage.getItem("token");
      const resp = await fetch("/api/auth/signout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
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
    console.log("Current User ID:", currentUser.user._id);
    const token = currentUser?.token|| localStorage.getItem("token");
    if(!token){
      setShowListingsError(true);
      return;
    }
      const resp = await fetch(`/api/user/listings/${currentUser.user._id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await resp.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };
  const handleListingDelete=async (listingId)=>{
    try{
const resp=await fetch(`/api/listing/delete/${(listingId)}`,{
  method:'DELETE',
  credentials:'include',  
});
const data=await resp.json();
if(data.success===false){
  console.log(data.message);
  return;
}
setUserListings((prev)=>
  prev.filter((listing) => listing._id !== listingId)
);
    }catch(error){
      console.log(error.message);
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
  type="file"
  hidden
  ref={fileRef}
  accept="image/*"
  onChange={(e) => setFile(e.target.files[0])}
/>


        <img
          onClick={() => fileRef.current.click()}
          src={
            formData?.avatar || currentUser?.user?.avatar || "/default-avatar.png"
          }
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <p className="text-sm self-center ">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image Upload (Image must be less than 2 mb)
            </span>
          ) : fileperc > 0 && fileperc < 100 ? (
            <span className="text-slate-700">{`uploading ${fileperc}%`}</span>
          ) : fileperc === 100 ? (
            <span className="text-green-700">
              Image is Successfully uploaded!
            </span>
          ) : (
            ""
          )}
        </p>

        <input
          type="text"
          placeholder="username"
          defaultValue={currentUser?.user?.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="email"
          placeholder="email"
          defaultValue={currentUser?.user?.email}
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
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-Listing"}
        >
          Create Listing
        </Link>
      </form>

      <div className="flex justify-between mt-5">
        <span
          className="text-red-700 cursor-pointer"
          onClick={handleDeleteUser}
        >
          Delete Account
        </span>
        <span className="text-red-700 cursor-pointer" onClick={handleSignOut}>
          Sign Out
        </span>
      </div>

      <p className="text-green-700 mt-5">
        {updateSuccess ? "User is updated successfully" : ""}
      </p>
      <button
        onClick={handleShowListings}
        className="text-green-700 w-full"
      >
        Show Listing
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-centre mt-7 text-2xl font-semibold">Your Listing</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between item-centre gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="Listing Covers"
                  className="h-16 w-16 object-contain rounded-lg"
                />
              </Link>
              <Link
                className="text-slate-700 font-semi  bold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col item-centre">
                <button onClick={()=>handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
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
