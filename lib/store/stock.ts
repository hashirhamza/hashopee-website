import type { Product } from './types.ts';

type StockLine = { id: string; size: string; quantity: number };

export function stockForSize(product: Product, size: string): number {
 const index = product.sizes.indexOf(size);
 if (index === -1) return 0;
 return product.sizeStock ? product.sizeStock[index] ?? 0 : product.stock;
}

export function remainingStock(product: Product, size: string, lines: StockLine[]): number {
 const used = lines.reduce((total, line) => {
  const sharesStock = line.id === product.id && (!product.sizeStock || line.size === size);
  return total + (sharesStock ? line.quantity : 0);
 }, 0);
 return Math.max(0, stockForSize(product, size) - used);
}

export function bagAllowance(product: Product, size: string, lines: StockLine[]): number {
 const unitsInSize = lines.reduce((total, line) =>
  total + (line.id === product.id && line.size === size ? line.quantity : 0), 0);
 return Math.max(0, Math.min(10 - unitsInSize, remainingStock(product, size, lines)));
}
