export default function robots() {
  const baseUrl = 'https://www.slidexfootwear.com';
  
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
