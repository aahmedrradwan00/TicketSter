import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Footer from '@/components/Footer';
import { getUser } from './lib/dal';

const geistSans = localFont({
    src: './fonts/GeistVF.woff',
    variable: '--font-geist-sans',
    weight: '100 900',
});
const geistMono = localFont({
    src: './fonts/GeistMonoVF.woff',
    variable: '--font-geist-mono',
    weight: '100 900',
});

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {

    const user = await getUser();

    return (
        <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar user={user ? user : null} />
        {children}
        <Footer />
        </body>
        </html>
    );
}
