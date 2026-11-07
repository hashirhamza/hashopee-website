import type { Product } from './types';
export function collectionCategories(products:Product[]):string[]{return [...new Set(products.filter(p=>p.published).map(p=>p.category))].sort((a,b)=>a.localeCompare(b));}
