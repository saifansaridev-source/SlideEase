export default function robots() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim() || 'https://slideease.in';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/checkout/',
          '/cart/',
          '/admin/'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
