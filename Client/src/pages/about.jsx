import React from 'react'
import { useTranslation } from 'react-i18next';
export default function About() {
  const { t } = useTranslation();
  return (
    // Poore page ka background dark blue aur height screen ke barabar
    <div className='bg-primary min-h-screen py-20 px-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Heading ko Gold (accent) kiya */}
        <h1 className='text-3xl font-bold mb-6 text-accent'>
         {t('about_title')}
        </h1>
        
        {/* Text ko white aur slate-300 ke darmiyan rakha taake parhne mein asani ho */}
        <p className='mb-6 text-white text-lg leading-relaxed'>
            {t('about_p1')}
        </p>
        
        <p className='mb-6 text-slate-300 leading-relaxed'>
          {t('about_p2')}
        </p>
        
        <p className='mb-6 text-slate-300 leading-relaxed'>
          {t('about_p3')}
        </p>
      </div>
    </div>
  )
}