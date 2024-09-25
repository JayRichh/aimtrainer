'use client';

import { NextSeo } from 'next-seo';

export default function HomeSEO() {
  return (
    <NextSeo
      title="Aim Trainer - Improve Your Aiming Skills"
      description="Enhance your aiming precision with our interactive Aim Trainer. Practice in various scenarios and track your progress."
      canonical="https://aimtrainer-zeta.vercel.app/"
      openGraph={{
        url: 'https://aimtrainer-zeta.vercel.app/',
        title: 'Aim Trainer - Sharpen Your Shooting Skills',
        description:
          'Interactive aim training for gamers. Improve your accuracy and reaction time.',
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
