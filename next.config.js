/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://fpfinpuncamlpbbimwtu.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwZmlucHVuY2FtbHBiYmltd3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MDEwMzQsImV4cCI6MjA1OTE3NzAzNH0.PkUdieMcJbIvReXzmCw-glNQdn2Ni4XdIOHSbYx8hJE'
  }
};

module.exports = nextConfig; 