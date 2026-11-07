import { env } from 'cloudflare:workers';
import * as oauth from 'oauth4webapi';
import { googleServer } from '../../../lib/auth/google';
import { FLOW_COOKIE,SESSION_COOKIE,readCookie,hashToken,cookie,validGoogleClaims,safeReturnTo } from '../../../lib/auth/security';
export const dynamic='force-dynamic';

function failure(request:Request,reason='signin'){return new Response(null,{status:303,headers:{Location:new URL('/auth/error?reason='+reason,request.url).toString(),'Set-Cookie':cookie(FLOW_COOKIE,'',0),'Cache-Control':'no-store'}});}
export async function GET(request:Request){
 try{
 if(!env.DB||!env.GOOGLE_CLIENT_ID||!env.GOOGLE_CLIENT_SECRET||!env.AUTH_ORIGIN)return failure(request,'setup');
 const url=new URL(request.url);if(url.origin!==new URL(env.AUTH_ORIGIN).origin)return failure(request);
 const flowToken=readCookie(request.headers.get('cookie'),FLOW_COOKIE);if(!flowToken)return failure(request);
 // Consuming the flow prevents replay, including concurrent callback requests.
 const flow=await env.DB.prepare('DELETE FROM auth_flows WHERE id_hash=? RETURNING *').bind(await hashToken(flowToken)).first<{state:string;verifier:string;nonce:string;return_to:string;expires_at:number}>();
 const code=url.searchParams.get('code'),state=url.searchParams.get('state');if(!flow||!code||state!==flow.state||flow.expires_at<Date.now()||url.searchParams.has('error'))return failure(request);
 const client:oauth.Client={client_id:env.GOOGLE_CLIENT_ID,id_token_signed_response_alg:'RS256'};
 const params=oauth.validateAuthResponse(googleServer,client,url,flow.state);
 const tokenResponse=await oauth.authorizationCodeGrantRequest(googleServer,client,oauth.ClientSecretPost(env.GOOGLE_CLIENT_SECRET),params,new URL(env.AUTH_ORIGIN).origin+'/auth/callback',flow.verifier);
 const tokens=await oauth.processAuthorizationCodeResponse(googleServer,client,tokenResponse,{expectedNonce:flow.nonce,requireIdToken:true});
 await oauth.validateApplicationLevelSignature(googleServer,tokenResponse);
 const payload=oauth.getValidatedIdTokenClaims(tokens);if(!payload)return failure(request);
 if(!validGoogleClaims(payload,flow.nonce,env.GOOGLE_CLIENT_ID))return failure(request);
 const email=payload.email as string,name=typeof payload.name==='string'?payload.name:email,userId='google:'+payload.sub,sessionToken=oauth.generateRandomState();const now=Date.now();
 await env.DB.batch([
  env.DB.prepare('DELETE FROM auth_sessions WHERE expires_at<?').bind(now),
  env.DB.prepare('INSERT INTO profiles (user_id,email,name,address,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,email,name,'',new Date(now).toISOString()),
  env.DB.prepare('INSERT INTO auth_sessions (token_hash,user_id,email,name,expires_at) VALUES (?,?,?,?,?)').bind(await hashToken(sessionToken),userId,email,name,now+7*24*60*60*1000)
 ]);
 const response=new Response(null,{status:303,headers:{Location:new URL(safeReturnTo(flow.return_to),env.AUTH_ORIGIN).toString(),'Cache-Control':'no-store'}});response.headers.append('Set-Cookie',cookie(FLOW_COOKIE,'',0));response.headers.append('Set-Cookie',cookie(SESSION_COOKIE,sessionToken,7*24*60*60));return response;
 }catch(error){console.error('Google sign-in failed',error instanceof Error?error.name:'unknown');return failure(request);}
}
