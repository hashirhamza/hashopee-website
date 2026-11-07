import { env } from 'cloudflare:workers';
import * as oauth from 'oauth4webapi';
import { googleServer } from '../../../lib/auth/google';
import { safeReturnTo,hashToken,cookie,FLOW_COOKIE } from '../../../lib/auth/security';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.AUTH_ORIGIN||!env.DB)return Response.redirect(new URL('/auth/error?reason=setup',request.url),303);
 const origin=new URL(env.AUTH_ORIGIN).origin;if(origin!==new URL(request.url).origin||!origin.startsWith('https://'))return new Response('Sign-in origin is not configured correctly.',{status:503});
 const state=oauth.generateRandomState(),verifier=oauth.generateRandomCodeVerifier(),nonce=oauth.generateRandomState(),flowToken=oauth.generateRandomState();
 const url=new URL(googleServer.authorization_endpoint!);
 url.search=new URLSearchParams({client_id:env.GOOGLE_CLIENT_ID,redirect_uri:origin+'/auth/callback',response_type:'code',scope:'openid email profile',state,nonce,prompt:'select_account',code_challenge:await oauth.calculatePKCECodeChallenge(verifier),code_challenge_method:'S256'}).toString();
 const database=env.DB;
 await database.batch([
  database.prepare('DELETE FROM auth_flows WHERE expires_at<?').bind(Date.now()),
  database.prepare('INSERT INTO auth_flows (id_hash,state,verifier,nonce,return_to,expires_at) VALUES (?,?,?,?,?,?)').bind(await hashToken(flowToken),state,verifier,nonce,safeReturnTo(new URL(request.url).searchParams.get('return_to')),Date.now()+10*60*1000)
 ]);
 return new Response(null,{status:303,headers:{Location:url.toString(),'Set-Cookie':cookie(FLOW_COOKIE,flowToken,600),'Cache-Control':'no-store'}});
}
