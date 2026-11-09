export type Product = { id:string; name:string; description:string; category:string; price:number; image:string; gallery:string[]; colour:string; sizes:string[]; stock:number; sizeStock?:number[] | null; tag:string; published:boolean; updatedAt?:string };
export type Profile = {name:string;email:string;address:string};
export type Identity = {userId:string;email:string;name:string;isAdmin:boolean};
export type OrderItem = {id:string;name:string;image:string;size:string;quantity:number;price:number};
export type PaymentMethod='preview'|'cod';
export const paymentMethodLabel=(method:PaymentMethod)=>method==='cod'?'Cash on delivery':'Payment preview';
export type OrderRecord = {id:string;reference:string;customerName:string;email:string;address:string;items:OrderItem[];total:number;status:string;paymentStatus:string;paymentMethod:PaymentMethod;createdAt:string};
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export const productImage=(p:Product)=>p.image;
