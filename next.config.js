/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env:{
    NEXT_PUBLIC_ZEGO_APP_ID:"366589160",
    NEXT_PUBLIC_ZEGO_SERVER_ID:"b53e2b1c2246bbb3626d71b9bc55fdb8"
  },
  images: {
    domains: ['lh3.googleusercontent.com','localhost','whatsapp-p2yq.onrender.com','web.whatsapp.com','wapi.rahulcodes.tech'],
  },
};

module.exports = nextConfig;