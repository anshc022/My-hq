import './globals.css';

export const metadata = {
  title: 'OpenClaw HQ v2',
  description: 'Multi-agent dev team dashboard — 6 AI agents building Fasal Seva',
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
