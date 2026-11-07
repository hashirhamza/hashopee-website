import type { Product,OrderItem } from './types.ts';
export function priceOrder(requested:{id:string;size:string;quantity:number}[],catalog:Product[]):{items:OrderItem[];total:number}{
 const items:OrderItem[]=[];let total=0;const quantities=new Map<string,number>();
 for(const line of requested){
 const p=catalog.find(p=>p.id===line.id&&p.published);
 if(!p)throw new Error('A product is no longer available. Refresh your bag.');
 const wanted=(quantities.get(p.id)||0)+line.quantity;quantities.set(p.id,wanted);
 if(!Number.isInteger(line.quantity)||line.quantity<1||line.quantity>10||!p.sizes.includes(line.size)||p.stock<wanted)throw new Error(`${p.name} is unavailable in the requested quantity or size.`);
 items.push({id:p.id,name:p.name,image:p.image,size:line.size,quantity:line.quantity,price:p.price});total+=p.price*line.quantity;
 }
 if(!items.length)throw new Error('Your bag is empty.');
 return {items,total};
}
export function isAllowedAdmin(email:string,allowlist:string){return allowlist.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());}
