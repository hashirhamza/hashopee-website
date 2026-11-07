import type { Metadata } from 'next';
import { ArrowLeft,ArrowUpRight,LogOut,ShieldCheck } from 'lucide-react';
import { safeReturnTo } from '../../lib/auth/security';
export const metadata:Metadata={title:'Sign out | HaShopee',description:'Securely sign out of your HaShopee account.',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';
export default async function SignOutPage({searchParams}:{searchParams:Promise<{return_to?:string|string[]}>}){
 const params=await searchParams;
 const target=safeReturnTo(typeof params.return_to==='string'?params.return_to:null);
 const returnTo=target.startsWith('/signout')?'/account':target;
 return <div className="signout-page"><header className="signout-header"><a href="/" className="wordmark">HaShopee</a><a href={returnTo} className="signout-back"><ArrowLeft size={15}/> Back to your account</a></header><main className="signout-main"><section className="signout-card" aria-labelledby="signout-heading"><div className="signout-symbol"><LogOut size={29} strokeWidth={1.6} aria-hidden="true"/></div><p className="eyebrow">UNTIL NEXT TIME</p><h1 id="signout-heading">Sign out of HaShopee?</h1><p className="signout-description">Your favourites and order history will be here when you return.</p><form method="post" action="/auth/signout" className="signout-form"><input type="hidden" name="return_to" value={returnTo}/><button type="submit" className="primary-button">Sign out <ArrowUpRight size={17}/></button><a href={returnTo} className="signout-stay">Stay signed in</a></form><p className="signout-note"><ShieldCheck size={14} aria-hidden="true"/>This signs you out of HaShopee only, not Google.</p></section></main><footer className="signout-footer">Everyday, considered.</footer></div>;
}
