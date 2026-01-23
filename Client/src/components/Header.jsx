import React from 'react';
import { FaSearch } from 'react-icons/fa';
import {Link} from 'react-router-dom';
import { useSelector } from 'react-redux';
export default function Header() {
  const {currentUser} =useSelector(state => state.user)
       console.log("current User", currentUser);

  return (
    <header className='bg-slate-200 shadow-md'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
        <Link to='/'>

        
      <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
        <span className='text-stone-900'>
          Anam</span>
        <span className='text-slate-900'>Estate</span>
      </h1>
    </Link>
    <form className='bg-slate-100 p-3 rounded-lg flex items-center'>
        <input type="text" placeholder="search.." className='bg-transparent focus:outline-none w-24 sm:w-64 ' />
        <FaSearch className="text-slate-600" />
      </form><ul className='flex gap-4'>
        <Link to="/">
        <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
        </Link>
        <Link to ="/about">
        <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
        </Link>
         <Link to ="/dash">
        {currentUser ?.user?.avatar ? (
             <img  className='rounded-full h-7 w-7 object-cover'src={currentUser.user.avatar} alt="profile"/>
         
        ):(
          <div className='rounded-full h-7 w-7 bg-gray-300 flex items-center justify-center'>
            <span className='text-xs text-gray-600'>?</span>
          </div>
        )}
        <li className='hidden sm:inline text-slate-700 hover:underline'>Sign in</li>
        
           <Link to="/chatbot">
        <li className='hidden sm:inline text-slate-700 hover:underline'>Chatbot AI</li>
        </Link>
      
       </Link>
      </ul>
      </div>
      </header>
  )
}
