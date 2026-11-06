export type Product = { id: string; name: string; category: 'Shirts' | 'T-shirts'; price: number; image: string; colour: string; tag?: string };
export const products: Product[] = [
 {id:'everyday-olive',name:'The Everyday Shirt',category:'Shirts',price:1299,image:'shirt20.jpg',colour:'Forest green',tag:'Bestseller'},
 {id:'studio-tee',name:'Studio Graphic Tee',category:'T-shirts',price:799,image:'tshirt5.jpg',colour:'Washed black',tag:'New'},
 {id:'weekend-oxford',name:'Weekend Oxford',category:'Shirts',price:1499,image:'shirt40.jpg',colour:'Sky stripe'},
 {id:'botanical-tee',name:'Botanical Cotton Tee',category:'T-shirts',price:899,image:'tshirt8.jpg',colour:'Natural',tag:'New'},
 {id:'terracotta',name:'Relaxed Resort Shirt',category:'Shirts',price:1399,image:'shirt19.jpg',colour:'Terracotta'},
 {id:'sunflower',name:'Sunflower Graphic Tee',category:'T-shirts',price:799,image:'tshirt3.jpg',colour:'Dusty blue'},
 {id:'classic-black',name:'Classic Short Sleeve',category:'Shirts',price:1199,image:'shirt3.jpg',colour:'Black'},
 {id:'colourblock',name:'Colourblock Overshirt',category:'Shirts',price:1799,image:'shirt37.jpg',colour:'Blue / white'}
];
export const money = (value: number) => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);
export const productImage = (product: Product) => `/image/products/${product.image}`;
