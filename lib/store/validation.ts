import { z } from 'zod';
import { isCloudinaryImageUrl } from './images.ts';
const imageUrl=z.string().max(600).refine(v=>(/^\/image\/[a-zA-Z0-9_./-]+$/.test(v)&&!v.includes('..'))||isCloudinaryImageUrl(v),'Upload a product image or use an existing store image');
export const productInput=z.object({id:z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{1,79}$/,'Product identifier must be 2–80 characters and use only letters, numbers, and hyphens. Start with a letter or number.'),name:z.string().trim().min(2).max(120),description:z.string().trim().min(10).max(3000),category:z.string().trim().min(2).max(60).transform(v=>v.replace(/\s+/g,' ')).refine(v=>v.toLowerCase()!=='all','Choose a specific category name'),price:z.number().int().min(1).max(1000000),image:imageUrl,gallery:z.array(imageUrl).max(6,'You can add up to 6 gallery photos.'),colour:z.string().trim().min(1).max(80),sizes:z.array(z.string().trim().min(1).max(30)).min(1).max(20),stock:z.number().int().min(0).max(100000),sizeStock:z.array(z.number().int().min(0).max(100000)).max(20).nullish(),tag:z.string().trim().max(30),published:z.boolean()}).superRefine((product, context)=>{
 const counts=product.sizeStock;
 if(!counts)return;
 if(counts.length!==product.sizes.length||new Set(product.sizes).size!==product.sizes.length){
  context.addIssue({code:'custom',path:['sizeStock'],message:'Enter one quantity for each unique size or option.'});
 }
 if(counts.reduce((total,count)=>total+count,0)>100000){
  context.addIssue({code:'custom',path:['sizeStock'],message:'Total stock cannot exceed 100,000 units.'});
 }
});
export const profileInput=z.object({name:z.string().trim().min(2).max(100),email:z.string().email().max(200),address:z.string().trim().max(1000)});
export const orderInput=z.object({name:z.string().trim().min(2).max(100),email:z.string().email().max(200),address:z.string().trim().min(10).max(1000),requestKey:z.string().uuid(),paymentMethod:z.enum(['preview','cod'],{errorMap:()=>({message:'Online payment is currently unavailable. Choose cash on delivery.'})}).default('preview'),items:z.array(z.object({id:z.string().max(80),size:z.string().trim().min(1).max(30),quantity:z.number().int().min(1).max(10)})).min(1).max(40)});
