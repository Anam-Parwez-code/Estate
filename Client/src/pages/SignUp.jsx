import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../services/api'; // 1. Axios import karein

export default function SignUp() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 2. Fetch ki jagah axiosInstance.post use karein
      // Na headers ki chinta, na JSON.stringify ki
      const res = await axiosInstance.post('/api/auth/signup', formData);
      
      const data = res.data; // 3. Axios mein data res.data mein hota hai

      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      // 4. Axios error handling
      setError(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className='bg-primary min-h-screen flex items-center justify-center p-3'>
      <div className='max-w-lg w-full bg-slate-800/30 p-8 rounded-3xl border border-slate-700 shadow-2xl'>
        <h1 className='text-3xl text-center font-bold my-7 text-white'>
          {t('signup_title').split(' ')[0]} <span className='text-accent'>{t('signup_title').split(' ')[1]}</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          {/* Username */}
          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>{t('label_username')}</label>
            <input
              type='text'
              placeholder={t('ph_username')}
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='username'
              onChange={handleChange}
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Phone/WhatsApp */}
          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>{t('ph_whatsapp').split('(')[0]}</label>
            <input
              type='text'
              placeholder={t('ph_whatsapp')}
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='phone'
              onChange={handleChange}
            />
          </div>

          <button
            disabled={loading}
            className='bg-accent text-primary font-bold p-3 rounded-xl uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'
          >
            {loading ? t('btn_processing') : t('btn_register')}
          </button>
          
          <div className='relative my-2'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-slate-700'></span>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-[#0f172a] px-2 text-slate-500'>{t('quick_signup')}</span>
            </div>
          </div>

          <OAuth/>
        </form>

        <div className='flex justify-center gap-2 mt-6 text-sm'>
          <p className='text-slate-400'>{t('have_account')}</p>
          <Link to={'/sign-in'}>
            <span className='text-accent hover:underline font-semibold'>{t('link_signin')}</span>
          </Link>
        </div>

        {error && (
          <div className='mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center'>
            <p className='text-red-400 text-sm'>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}