
export const metadata = {
  title: 'SubFinder Demo',
  description: 'Motore di ricerca demo per attrezzatura subacquea',
};

import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
