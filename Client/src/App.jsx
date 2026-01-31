import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/about';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/listing';
import Search from './pages/Search';
import Inbox from './components/Inbox';

export default function App() {
  const { i18n } = useTranslation();

  // 3. Ye Effect poori website ka "Rukh" badal dega
  useEffect(() => {
    // Agar language 'ar' (Arabic) hai toh 'rtl', warna 'ltr'
    const direction = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.body.dir = direction;
    
    // Arabic ke liye font thoda behtar kar dete hain (Optional)
    if (i18n.language === 'ar') {
      document.body.style.fontFamily = "'Noto Sans Arabic', sans-serif";
    } else {
      document.body.style.fontFamily = "'Nunito', sans-serif"; // Aapka purana font
    }
  }, [i18n.language]);
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/sign-in' element={<SignIn />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/about' element={<About />} />
        <Route path='/search' element={<Search />} />
        <Route path='/listing/:listingId' element={<Listing />} />

        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/create-listing' element={<CreateListing />} />
          <Route
            path='/update-listing/:listingId'
            element={<UpdateListing />}
          />
          <Route path='/inbox' element={<Inbox />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}