/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en', 'th'],
    localeDetection: false,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
} 