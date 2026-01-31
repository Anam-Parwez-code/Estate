import { FaSearch, FaGlobe } from 'react-icons/fa'; // FaGlobe icon add kiya
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; // 1. i18next hook

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(); // 2. t function aur i18n instance

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  // Language switch karne ka function
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <header className='bg-primary shadow-lg border-b border-accent/20 sticky top-0 z-50'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-4'>
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-2xl flex flex-wrap tracking-tight'>
            <span className='text-white'>Sahand</span>
            <span className='text-accent ml-1'>Estate</span>
          </h1>
        </Link>
        
        <form
          onSubmit={handleSubmit}
          className='bg-slate-800/50 border border-slate-700 p-2 px-4 rounded-full flex items-center transition-all focus-within:border-accent'
        >
          <input
            type='text'
            // 3. Placeholder ko translate kiya
            placeholder={t('search_placeholder')} 
            className='bg-transparent focus:outline-none w-24 sm:w-64 text-white placeholder-slate-400 text-sm'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-accent hover:scale-110 transition-transform' />
          </button>
        </form>

        <ul className='flex gap-6 items-center'>
          {/* 4. Language Switcher Button */}
          <button 
            onClick={toggleLanguage}
            className='flex items-center gap-2 bg-accent/10 border border-accent/30 text-accent px-3 py-1.5 rounded-full hover:bg-accent hover:text-primary transition-all text-xs font-bold uppercase tracking-wider'
          >
            <FaGlobe />
            {i18n.language === 'en' ? 'العربية' : 'EN'}
          </button>

          <Link to='/'>
            <li className='hidden sm:inline text-slate-200 hover:text-accent transition-colors font-medium'>
              {t('nav_home')} {/* 5. Home translate */}
            </li>
          </Link>
          
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-200 hover:text-accent transition-colors font-medium'>
              {t('nav_about')} {/* 6. About translate */}
            </li>
          </Link>

          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-9 w-9 object-cover border-2 border-accent hover:scale-105 transition-transform'
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              <li className='text-accent bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent hover:text-primary transition-all font-semibold border border-accent/30'>
                {t('nav_signin') || 'Sign In'}
              </li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}