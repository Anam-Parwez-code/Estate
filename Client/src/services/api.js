import axios from 'axios';

const axiosInstance = axios.create({
  // Vite auto-detect karega:
  // Local pe: khali rahega (vite proxy use hoga)
  // Vercel pe: VITE_API_URL wala link lega
  baseURL: import.meta.env.VITE_API_URL || '', 
  withCredentials: true,
});

export default axiosInstance;