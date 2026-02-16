import './globals.css';

export const metadata = {
  title: 'OpenClaw HQ — Multi-Agent Dashboard',
  description: '6 AI agents building Fasal Seva — real-time ops dashboard powered by OpenClaw',
  icons: { icon: '/favicon.ico' },
  themeColor: '#030308',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#030308',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
