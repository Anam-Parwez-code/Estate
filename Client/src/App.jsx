import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUserSuccess } from './redux/user/userSlice';

//import AppInit from "./components/AppInit";
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/about';
import Profile from './pages/Dash';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/listing';
import Search from './pages/Search';
import Chatbot from './components/chatbot';

export default function App() {
  const dispatch = useDispatch();

  // 🔥 USER HYDRATION (MOST IMPORTANT)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch('/api/user/me', {
          credentials: 'include',
        });

        const data = await res.json();

        if (data && data._id) {
          dispatch(updateUserSuccess(data));
        }
      } catch (error) {
        console.log('User not logged in');
      }
    };

    fetchCurrentUser();
  }, [dispatch]);

  return (
    <BrowserRouter>
   
      <Header />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/search" element={<Search />} />
        <Route path="/listing/:listingId" element={<Listing />} />
        <Route path="/chatbot" element={<Chatbot />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dash" element={<Profile />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/update-listing/:listingId" element={<UpdateListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
