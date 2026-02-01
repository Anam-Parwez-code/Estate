import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { useTranslation } from 'react-i18next'; // 1. Import Hook

export default function SignIn() {
  const { t } = useTranslation(); // 2. Initialize Hook
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      localStorage.setItem('token', data.token);
      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='bg-primary min-h-screen flex items-center justify-center p-3'>
      <div className='max-w-lg w-full bg-slate-800/30 p-8 rounded-3xl border border-slate-700 shadow-2xl'>
        <h1 className='text-3xl text-center font-bold my-7 text-white'>
          {t('signin_welcome').split(' ')[0]} <span className='text-accent'>{t('signin_welcome').split(' ')[1]}</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>{t('label_email')}</label>
            <input
              type='email'
              placeholder='name@example.com'
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='email'
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>{t('label_password')}</label>
            <input
              type='password'
              placeholder='••••••••'
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='password'
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className='bg-accent text-primary font-bold p-3 rounded-xl uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'
          >
            {loading ? t('btn_authenticating') : t('btn_signin')}
          </button>
          
          <div className='relative my-2'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-slate-700'></span>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-[#0f172a] px-2 text-slate-500'>{t('or_continue')}</span>
            </div>
          </div>

          <OAuth/>
        </form>

        <div className='flex justify-center gap-2 mt-6 text-sm'>
          <p className='text-slate-400'>{t('no_account')}</p>
          <Link to={'/sign-up'}>
            <span className='text-accent hover:underline font-semibold'>{t('link_signup')}</span>
          </Link>
        </div>

        {error && (
          <div className='mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg'>
            <p className='text-red-400 text-center text-sm'>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}