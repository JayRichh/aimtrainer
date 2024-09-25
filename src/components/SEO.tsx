'use client';

import { NextSeo } from 'next-seo';

export default function SEO() {
  return (
    <NextSeo
      title="Aim Trainer"
      description="Improve your aiming skills with our interactive Aim Trainer"
      openGraph={{
        type: 'website',
        locale: 'en_US',
        url: 'https://aimtrainer-zeta.vercel.app/',
        siteName: 'Aim Trainer',
        images: [
          {
            url: '/aimtrain-logo.png',
            width: 800,
            height: 600,
            alt: 'Aim Trainer Logo',
          },
        ],
      }}
    />
  );
}
