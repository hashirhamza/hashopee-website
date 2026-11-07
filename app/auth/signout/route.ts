import { env } from 'cloudflare:workers';
import { SESSION_COOKIE,readCookie,hashToken,cookie,safeReturnTo } from '../../../lib/auth/security';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const target=safeReturnTo(new URL(request.url).searchParams.get('return_to'));
 const confirmation=new URL('/signout',request.url);confirmation.searchParams.set('return_to',target);
 return new Response(null,{status:303,headers:{Location:confirmation.toString(),'Cache-Control':'no-store'}});
}
export async function POST(request:Request){const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return new Response('Invalid request origin',{status:403});const token=readCookie(request.headers.get('cookie'),SESSION_COOKIE);if(token&&env.DB)await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await hashToken(token)).run();const form=await request.formData();return new Response(null,{status:303,headers:{Location:new URL(safeReturnTo(String(form.get('return_to')||'/account')),request.url).toString(),'Set-Cookie':cookie(SESSION_COOKIE,'',0),'Cache-Control':'no-store'}});}
