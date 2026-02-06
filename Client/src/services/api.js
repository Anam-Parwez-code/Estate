import axios from 'axios';

const axiosInstance = axios.create({
  // Yahan variable ki jagah direct Render ka link daal do
  baseURL: 'https://royal-estate-uzii.onrender.com', 
  withCredentials: true,
});

export default axiosInstance;
