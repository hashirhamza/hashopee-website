export const SESSION_COOKIE='__Host-hashopee-session';
export const FLOW_COOKIE='__Host-hashopee-oauth';
export function safeReturnTo(value:string|null){if(!value||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return '/account';try{const url=new URL(value,'https://store.invalid');if(url.origin!=='https://store.invalid'||url.pathname.startsWith('/auth/'))return '/account';return url.pathname+url.search+url.hash;}catch{return '/account';}}
export function readCookie(header:string|null,name:string){const item=(header||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));if(!item)return null;try{return decodeURIComponent(item.slice(name.length+1));}catch{return null;}}
export function cookie(name:string,value:string,maxAge:number){return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
export async function hashToken(token:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');}
export function validGoogleClaims(payload:Record<string,unknown>,nonce:string,clientId:string){return typeof payload.sub==='string'&&payload.sub.length>0&&typeof payload.email==='string'&&payload.email_verified===true&&payload.nonce===nonce&&(payload.azp===undefined||payload.azp===clientId);}
