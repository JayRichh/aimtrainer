import React from 'react';
import { Github, Codepen, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const socialLinks = [
  {
    href: 'https://github.com/JayRichh',
    icon: Github,
    label: 'GitHub',
  },
  {
    href: 'https://codepen.io/JayRichh',
    icon: Codepen,
    label: 'CodePen',
  },
  {
    href: 'https://jayrich.dev',
    icon: ExternalLink,
    label: 'Portfolio',
  },
];

const SocialLinks: React.FC = () => {
  return (
    <div className="mt-8 flex space-x-4">
      {socialLinks.map((link, index) => (
        <motion.a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 transition-colors duration-200 hover:text-gray-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          aria-label={link.label}
        >
          <link.icon size={24} />
        </motion.a>
      ))}
    </div>
  );
};

export default SocialLinks;
