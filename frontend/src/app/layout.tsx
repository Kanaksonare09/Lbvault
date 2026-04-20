import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'HealthScan - Intelligent Clinical Intelligence',
  description: 'Advanced pathology management and AI-powered diagnostic insights.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
