/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    AQICN_API_TOKEN: process.env.AQICN_API_TOKEN,
  },
}

module.exports = nextConfig