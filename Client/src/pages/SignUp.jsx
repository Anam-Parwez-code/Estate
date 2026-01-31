import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log(data);
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
      setError(error.message);
    }
  };
  return (
    <div className='bg-primary min-h-screen flex items-center justify-center p-3'>
      <div className='max-w-lg w-full bg-slate-800/30 p-8 rounded-3xl border border-slate-700 shadow-2xl'>
        <h1 className='text-3xl text-center font-bold my-7 text-white'>
          Create <span className='text-accent'>Account</span>
        </h1>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>Username</label>
            <input
              type='text'
              placeholder='your_name'
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='username'
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>Email Address</label>
            <input
              type='email'
              placeholder='name@example.com'
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='email'
              onChange={handleChange}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-slate-400 text-xs ml-1'>Password</label>
            <input
              type='password'
              placeholder='••••••••'
              className='bg-slate-800/50 border border-slate-700 p-3 rounded-xl text-white focus:border-accent outline-none transition-all'
              id='password'
              onChange={handleChange}
            />
          </div>

             <input
  type='text'
  placeholder='WhatsApp Number (e.g. 919876543210)'
  className='border p-3 rounded-lg'
  id='phone'
  onChange={handleChange}
/>
          <button
            disabled={loading}
            className='bg-accent text-primary font-bold p-3 rounded-xl uppercase hover:opacity-90 disabled:opacity-80 transition-all shadow-lg mt-2'
          >
            {loading ? 'Processing...' : 'Register Now'}
          </button>
          
          <div className='relative my-2'>
            <div className='absolute inset-0 flex items-center'><span className='w-full border-t border-slate-700'></span></div>
            <div className='relative flex justify-center text-xs uppercase'><span className='bg-slate-900 px-2 text-slate-500'>Quick Signup</span></div>
          </div>

          <OAuth/>
        </form>

        <div className='flex justify-center gap-2 mt-6 text-sm'>
          <p className='text-slate-400'>Already have an account?</p>
          <Link to={'/sign-in'}>
            <span className='text-accent hover:underline font-semibold'>Sign in</span>
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