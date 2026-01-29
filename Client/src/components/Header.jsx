import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
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
  return (
<header className='bg-primary shadow-lg border-b border-accent/20'>
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
            placeholder='Search...'
            className='bg-transparent focus:outline-none w-24 sm:w-64 text-white placeholder-slate-400'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-accent hover:scale-110 transition-transform' />
          </button>
        </form>
        <ul className='flex gap-6 items-center'>
          <Link to='/'>
            <li className='hidden sm:inline text-slate-200 hover:text-accent transition-colors font-medium'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-slate-200 hover:text-accent transition-colors font-medium'>
              About
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser ? (
              <img
                className='rounded-full h-9 w-9 object-cover border-2 border-accent'
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              <li className='text-accent bg-accent/10 px-4 py-2 rounded-lg hover:bg-accent hover:text-primary transition-all font-semibold border border-accent/30'> Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}