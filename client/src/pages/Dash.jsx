import { useSelector } from "react-redux";
import {getStorage,uploadBytesResumable,getDownloadURL,ref} from 'firebase/storage';
import { useDispatch } from "react-redux";
import {app} from '../firebase';
import {updateUserStart,updateUserSuccess,updateUserFailure,deleteUserFailure,deleteUserStart,deleteUserSuccess} from '../redux/user/userSlice.js';
import {useRef, useState,useEffect} from 'react';
import {Link} from 'react-router-dom';
    
export default function Dash() {
  const fileRef=useRef(null)
 
  const {currentUser,loading,error}=useSelector((state)=> state.user)
  const [file,setFile]=useState(undefined);
  const [fileperc,setFileperc]=useState(0);
  const [fileUploadError,setFileUploadError] = useState(false);
  const[formData,setFormData]=useState({});
  const [updateSuccess,setUpdateSuccess]=useState(false);
  const dispatch=useDispatch();
  console.log(formData);
  console.log(fileperc);
  console.log(fileUploadError);
  useEffect(()=>{
    if(file){
      handleFileUpload(file);
    }
  },[file]);
  const handleFileUpload= (file) =>{
    const storage=getStorage(app);
    const fileName = new Date().getTime() +"_"+ file.name;
    const storageRef=ref(storage,fileName);
    const uploadTask=uploadBytesResumable(storageRef,file);
    uploadTask.on('state_changed',
      (snapshot)=>{
        const progress=(snapshot.bytesTransferred /
          snapshot.totalBytes) *100;
          setFileperc(Math.round(progress));
          
        },
        (error)=>{
          setFileUploadError(true);
        },
        ()=>{
          getDownloadURL(uploadTask.snapshot.ref).then
          ((downloadURL) =>
            setFormData({...formData,avatar:downloadURL})
          
        );
      }
    );
  };
  const handleChange=(e) =>{
    setFormData({...formData,[e.target.id]:e.target.value});
  }
  const handleSubmit=async(e) =>{
    e.preventDefault();
  try{
    dispatch(updateUserStart());
    const resp=await fetch(`/api/user/update/${currentUser.user._id}`,{
      method:'PUT',
      headers:{
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(formData),
      credentials:'include',
    });
    const data=await resp.json();
    if(data.success===false){
      dispatch(updateUserFailure(data.message));
      return;
    }
  dispatch(updateUserSuccess(data));
  setUpdateSuccess(true);
  }catch(error){
    dispatch(updateUserFailure(error?.message || "update Failed"));
  }
  };
  const handleDeleteUser=async() => {
    try{
   dispatch(deleteUserStart());
   const resp=await fetch(`/api/user/delete/${currentUser.user._id}`,{
    method:'DELETE',
   });
   const data=await resp.json();
   if(data.success === false){
    dispatch(deleteUserFailure(data.message));
    return;
   }
   dispatch(deleteUserSuccess(data));
   setUpdateSuccess(true);
    }catch(error){
dispatch(deleteUserFailure(error.message))
    }
};
const handleSignOut=async()=>{
  try{
    dispatch(signOutUserStart());
  const resp=await fetch('/api/auth/signout');
  const data=await resp.json();
  if(data.success === false){
    dispatch(deleteUserFailure(data.message))
    return;
  }
  dispatch(deleteUserSuccess(data));
  }catch(error){
    dispatch(deleteUserFailure(data.message));
  }
}
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form  onSubmit={handleSubmit}className="flex flex-col gap-4">
          <input  onChange={(e)=>setFile(e.target.files[0])}
          type="file"  
          ref={fileRef} hidden accept="image/*"/>
         
          <img 
          onClick={()=>fileRef.current.click()} 
          src={ formData?.avatar || currentUser?.avatar || "/default-avatar.png"} alt="profile" className="rounded-full h-24 w-24  object-cover cursor-pointer self-center mt-2"/>
          <p className="text-sm self-center ">
            {fileUploadError ?(
            <span className="text-red-700">Error Image Upload(Image must be less than 2 mb)</span>):
            fileperc >0 && fileperc <100 ?(
              <span className="text-slate-700">
                {`uploading ${fileperc}%`}
              </span>):
              
              fileperc == 100 ? (
              <span className="text-green-700">Image is Successfully uploaded!</span>):(
              
              ""
              )
            }
          </p>
          <input type="text" placeholder="username" 
          defaultValue={currentUser?.username}
          id="username" className="border p-3 rounded-lg"
          onChange={handleChange}/>
           <input type="email" placeholder="email"
           defaultValue={currentUser?.email}
           id="email" className="border p-3 rounded-lg"
           onChange={handleChange}/>
            <input type="password" placeholder="password"  id="password" className="border p-3 rounded-lg"
            onChange={handleChange}/>
            <button disabled={loading} className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"> {loading ? 'Loading...': 'Update'}</button>
            <Link className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95" to ={'/create-Listing'}>Create Listing</Link>
        </form>
        <div className="flex justify-between mt-5">
           <span className="text-red-700 cursor-pointer" onClick={handleDeleteUser}>Delete Account</span>
          <span className="text-red-700 cursor-pointer" onClick={handleSignOut}>Sign Out</span>
        </div>

         <p className="text-green-700 mt-5">{updateSuccess ? 'User  is updated successfully':''}</p>
   </div>
  )
}
