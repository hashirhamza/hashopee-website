import type { Metadata } from 'next';
import '../src/style.css';
export const metadata:Metadata={title:'HaShopee — Everyday, considered.',description:'Considered clothing for everyday living. Discover your next favourite fit at HaShopee.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
