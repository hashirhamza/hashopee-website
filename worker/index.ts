import handler from 'vinext/server/fetch-handler';
export default {
 async fetch(request:Request,env:Cloudflare.Env,ctx:ExecutionContext){
  // External visitors must never supply a trusted identity via request headers.
  const headers=new Headers(request.headers);
  for(const key of [...headers.keys()])if(key.startsWith('oai-authenticated-user-'))headers.delete(key);
  const response=await handler.fetch(new Request(request,{headers}),env,ctx);
  const result=new Response(response.body,response);
  result.headers.set('X-Content-Type-Options','nosniff');
  result.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  result.headers.set('X-Frame-Options','SAMEORIGIN');
  return result;
 }
};
