import { isAllowedAdmin } from './checkout';
import { env } from 'cloudflare:workers';
import type { Product,OrderRecord } from './types';
export function database(){if(!env.DB)throw new Error('Database unavailable');return env.DB;}
export function productFromRow(p:any):Product{return {id:p.id,name:p.name,description:p.description,category:p.category,price:p.price,image:p.image,gallery:JSON.parse(p.gallery),colour:p.colour,sizes:JSON.parse(p.sizes),stock:p.stock,sizeStock:p.size_stock?JSON.parse(p.size_stock):null,tag:p.tag,published:!!p.published,updatedAt:p.updated_at};}
export function orderFromRow(o:any):OrderRecord{return {id:o.id,reference:o.reference,customerName:o.customer_name,email:o.email,address:o.address,items:JSON.parse(o.items),total:o.total,status:o.status,paymentStatus:o.payment_status,paymentMethod:o.payment_method==='cod'?'cod':'preview',createdAt:o.created_at};}
export function isAdminEmail(email:string){return isAllowedAdmin(email,env.ADMIN_EMAILS||'');}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}});}
