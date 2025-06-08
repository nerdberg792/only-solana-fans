import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProviders } from '../providers/AppProviders';
import { AppBar } from '../components/layout/AppBar';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';

export const metadata = {
  title: 'SolanaFans',
  description: 'The decentralized platform for creators.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <AppProviders>
          <Toaster position="bottom-center" />
          <div className="flex flex-col min-h-screen bg-gray-50">
            <AppBar />
            <main className="flex-grow">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}