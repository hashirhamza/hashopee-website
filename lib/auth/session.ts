import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';
import { readCookie,hashToken,SESSION_COOKIE } from './security';
export type StoreUser={userId:string;email:string;displayName:string;fullName:string|null};
export async function getStoreUser():Promise<StoreUser|null>{
 const requestHeaders=await headers();
 const token=readCookie(requestHeaders.get('cookie'),SESSION_COOKIE);
 if(!token||!/^[A-Za-z0-9_-]{32,128}$/.test(token)||!env.DB)return null;
 const row=await env.DB.prepare('SELECT user_id,email,name FROM auth_sessions WHERE token_hash=? AND expires_at>?').bind(await hashToken(token),Date.now()).first<{user_id:string;email:string;name:string}>();
 return row?{userId:row.user_id,email:row.email,displayName:row.name,fullName:row.name}:null;
}
