import { products as original } from '../../src/catalog';
import type { Product } from './types';
export const initialProducts:Product[]=original.map(p=>({...p, image:`/image/products/${p.image}`,gallery:[],description:'An easy addition to your everyday rotation. Relaxed styling, a versatile silhouette, and room to make it your own.',sizes:['S','M','L','XL','XXL'],stock:30,published:true,tag:p.tag||''}));
