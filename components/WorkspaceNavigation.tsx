'use client';
import { LogOut, type LucideIcon } from 'lucide-react';
type NavigationItem={label:string;icon:LucideIcon;href?:string;active?:boolean;count?:number;onSelect?:()=>void};
type Props={items:NavigationItem[];signedIn:boolean;loading?:boolean;email?:string;returnTo:'/admin'|'/account';label:string};
export default function WorkspaceNavigation({items,signedIn,loading,email,returnTo,label}:Props){
 if(loading||!signedIn)return null;
 return <nav className="workspace-navigation" aria-label={label}><div className="workspace-tabs">{items.map(({label,icon:Icon,href,active,count,onSelect})=>href?<a key={label} href={href}><Icon size={17}/><span className="workspace-nav-label">{label}</span></a>:<button key={label} className={active?'active':''} onClick={onSelect} aria-current={active?'page':undefined}><Icon size={17}/><span className="workspace-nav-label">{label}</span>{count!==undefined&&<span className="workspace-nav-count">{count}</span>}</button>)}</div><div className="workspace-session">{email&&<span className="workspace-session-email" title={email}>{email}</span>}<a className="workspace-signout" href={`/auth/signout?return_to=${encodeURIComponent(returnTo)}`} target="_top"><LogOut size={17}/><span>Sign out</span></a></div></nav>;
}
