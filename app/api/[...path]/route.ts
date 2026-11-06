import { env } from 'cloudflare:workers';
import { getStoreUser } from '../../../lib/auth/session';
import { database,isAdminEmail,json,orderFromRow,productFromRow } from '../../../lib/store/server';
import { initialProducts } from '../../../lib/store/seed';
import { productInput,profileInput,orderInput } from '../../../lib/store/validation';
import { z } from 'zod';
import { priceOrder } from '../../../lib/store/checkout';
export const dynamic='force-dynamic';
async function handler(req:Request){
 try{
 const path=new URL(req.url).pathname.replace(/^\/api\//,'').split('/');const method=req.method; const write=method!=='GET';
 if(write){const origin=req.headers.get('origin');const site=new URL(req.url);if(origin&&new URL(origin).host!==site.host)return json({error:'Request origin is not allowed'},403);if(Number(req.headers.get('content-length')||0)>9*1024*1024)return json({error:'File is too large'},413);}
 if(path[0]==='images'&&method==='GET'){if(!/^[a-zA-Z0-9.-]+$/.test(path[1]||''))return json({error:'Image not found'},404);const file=await env.BUCKET?.get(path[1]);if(!file)return json({error:'Image not found'},404);return new Response(file.body,{headers:{'Content-Type':file.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});}
 const user=await getStoreUser();const admin=!!user&&isAdminEmail(user.email);
 if(path[0]==='session'&&method==='GET')return json({user:user?{userId:user.userId,email:user.email,name:user.displayName,isAdmin:admin}:null});
 if(path[0]==='products'&&method==='GET'){const rows=await database().prepare('SELECT * FROM products WHERE published=1 ORDER BY updated_at DESC,id').all();return json({products:rows.results.map(productFromRow)});}
 if(path[0]==='admin'){
 if(!admin)return json({error:user?'Administrator access required':'Please sign in'},user?403:401);
 if(path[1]==='seed'&&method==='POST'){
  await database().batch(initialProducts.map(p=>database().prepare('INSERT OR IGNORE INTO products (id,name,description,category,price,image,gallery,colour,sizes,stock,tag,published,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(p.id,p.name,p.description,p.category,p.price,p.image,JSON.stringify(p.gallery),p.colour,JSON.stringify(p.sizes),p.stock,p.tag,1,new Date().toISOString())));
  return json({ok:true});
 }
 if(path[1]==='products'&&method==='GET'){const rows=await database().prepare('SELECT * FROM products ORDER BY updated_at DESC').all();return json({products:rows.results.map(productFromRow)});}
 if(path[1]==='products'&&(method==='PUT'||method==='POST')){const p=productInput.parse(await req.json());if(path[2]&&path[2]!==p.id)return json({error:'Product identifier mismatch'},400);const existing=await database().prepare('SELECT id FROM products WHERE id=?').bind(p.id).first();if(method==='POST'&&existing)return json({error:'This product identifier is already in use'},409);if(method==='PUT'&&!existing)return json({error:'Product not found'},404);
 const values=[p.name,p.description,p.category,p.price,p.image,JSON.stringify(p.gallery),p.colour,JSON.stringify([...new Set(p.sizes)]),p.stock,p.tag,p.published?1:0,new Date().toISOString(),p.id];
 if(method==='PUT')await database().prepare('UPDATE products SET name=?,description=?,category=?,price=?,image=?,gallery=?,colour=?,sizes=?,stock=?,tag=?,published=?,updated_at=? WHERE id=?').bind(...values).run();else await database().prepare('INSERT INTO products (name,description,category,price,image,gallery,colour,sizes,stock,tag,published,updated_at,id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...values).run();return json({ok:true});}
 if(path[1]==='uploads'&&method==='POST'){
 if(!env.BUCKET)return json({error:'Image storage unavailable'},503);const form=await req.formData();const file=form.get('file');if(!(file instanceof File)||file.size>8*1024*1024||file.size<12)return json({error:'Choose an image smaller than 8 MB'},400);const bytes=new Uint8Array(await file.arrayBuffer());let mime='',ext='';if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff){mime='image/jpeg';ext='jpg';}else if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)){mime='image/png';ext='png';}else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){mime='image/webp';ext='webp';}else return json({error:'Upload a JPEG, PNG, or WebP photo'},400);const key=`${crypto.randomUUID()}.${ext}`;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime}});return json({url:`/api/images/${key}`});}
 if(path[1]==='orders'&&method==='GET'){const rows=await database().prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 200').all();return json({orders:rows.results.map(orderFromRow)});}
 if(path[1]==='orders'&&path[2]&&method==='PATCH'){const data=z.object({status:z.enum(['payment_preview','cancelled'])}).parse(await req.json());const r=await database().prepare('UPDATE orders SET status=? WHERE id=?').bind(data.status,path[2]).run();return r.meta.changes?json({ok:true}):json({error:'Order not found'},404);}
 return json({error:'Not found'},404);
 }
 if(!user)return json({error:'Please sign in'},401);
 if(path[0]==='profile'){
 if(method==='GET'){const profile=await database().prepare('SELECT name,email,address FROM profiles WHERE user_id=?').bind(user.userId).first();return json({profile:profile||{name:user.displayName,email:user.email,address:''}});}
 if(method==='PUT'){const p=profileInput.parse(await req.json());await database().prepare('INSERT INTO profiles (user_id,name,email,address,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET name=excluded.name,email=excluded.email,address=excluded.address,updated_at=excluded.updated_at').bind(user.userId,p.name,p.email,p.address,new Date().toISOString()).run();return json({ok:true});}
 }
 if(path[0]==='wishlist'){
 if(method==='GET'){const row=await database().prepare('SELECT product_ids FROM wishlists WHERE user_id=?').bind(user.userId).first<{product_ids:string}>();return json({ids:row?JSON.parse(row.product_ids):[]});}
 if(method==='PUT'){const {ids}=z.object({ids:z.array(z.string().max(80)).max(200)}).parse(await req.json());await database().prepare('INSERT INTO wishlists (user_id,product_ids) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET product_ids=excluded.product_ids').bind(user.userId,JSON.stringify([...new Set(ids)])).run();return json({ok:true});}
 }
 if(path[0]==='orders'){
 if(method==='GET'){const rows=await database().prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.userId).all();return json({orders:rows.results.map(orderFromRow)});}
 if(method==='POST'){const input=orderInput.parse(await req.json());const requestKey=`${user.userId}:${input.requestKey}`;const existing=await database().prepare('SELECT * FROM orders WHERE request_key=?').bind(requestKey).first();if(existing)return json({order:orderFromRow(existing)});const catalog=[];for(const id of [...new Set(input.items.map(i=>i.id))]){const row=await database().prepare('SELECT * FROM products WHERE id=? AND published=1').bind(id).first();if(row)catalog.push(productFromRow(row));}let priced;try{priced=priceOrder(input.items,catalog);}catch(e){return json({error:e instanceof Error?e.message:'Review your bag'},409);}const {items,total}=priced;
 const id=crypto.randomUUID(),reference=`HS-${crypto.randomUUID().slice(0,8).toUpperCase()}`;await database().prepare('INSERT OR IGNORE INTO orders (id,user_id,reference,customer_name,email,address,items,total,status,payment_status,request_key,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,user.userId,reference,input.name,input.email,input.address,JSON.stringify(items),total,'payment_preview','not_charged',requestKey,new Date().toISOString()).run();const saved=await database().prepare('SELECT * FROM orders WHERE request_key=?').bind(requestKey).first();return json({order:orderFromRow(saved)},201);}
 }
 return json({error:'Not found'},404);
 }catch(error){if(error instanceof z.ZodError)return json({error:error.issues[0]?.message||'Check the entered details'},400);if(error instanceof SyntaxError)return json({error:'Invalid request data'},400);console.error('Store request failed',error);return json({error:'We could not complete this request. Please try again.'},500);}
}
export const GET=handler;export const POST=handler;export const PUT=handler;export const PATCH=handler;
