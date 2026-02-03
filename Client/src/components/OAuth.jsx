import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
// 1. Axios instance ko import kiya
import axiosInstance from '../services/api'; 

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      // 2. Fetch ki jagah axiosInstance.post use kiya
      // Headers aur JSON.stringify ki zaroorat nahi, axios khud sambhal leta hai
      const res = await axiosInstance.post('api/auth/google', {
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      });

      // 3. Axios ka response data 'res.data' mein hota hai
      const data = res.data;
      
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95 w-full'
    >
      Continue with google
    </button>
  );
}