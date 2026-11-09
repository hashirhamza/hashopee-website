import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
 id: text('id').primaryKey(), name: text('name').notNull(), description: text('description').notNull(),
 category: text('category').notNull(), price: integer('price').notNull(), image: text('image').notNull(),
 gallery: text('gallery').notNull().default('[]'), colour: text('colour').notNull(),
 sizes: text('sizes').notNull().default('["S","M","L","XL","XXL"]'), stock: integer('stock').notNull().default(30),
 sizeStock: text('size_stock'), deletedAt: text('deleted_at'),
 tag: text('tag').notNull().default(''), published: integer('published').notNull().default(1), updatedAt: text('updated_at').notNull()
});
export const profiles = sqliteTable('profiles', { userId: text('user_id').primaryKey(), email: text('email').notNull(), name: text('name').notNull(), address: text('address').notNull().default(''), updatedAt:text('updated_at').notNull() });
export const wishlists = sqliteTable('wishlists', { userId:text('user_id').primaryKey(), productIds:text('product_ids').notNull().default('[]') });
export const orders = sqliteTable('orders', { id:text('id').primaryKey(), userId:text('user_id').notNull(), reference:text('reference').notNull().unique(), customerName:text('customer_name').notNull(), email:text('email').notNull(), address:text('address').notNull(), items:text('items').notNull(), total:integer('total').notNull(), status:text('status').notNull().default('payment_preview'), paymentStatus:text('payment_status').notNull().default('not_charged'), paymentMethod:text('payment_method').notNull().default('preview'), requestKey:text('request_key').notNull().unique(), createdAt:text('created_at').notNull() });
export const authSessions = sqliteTable('auth_sessions', { tokenHash:text('token_hash').primaryKey(), userId:text('user_id').notNull(), email:text('email').notNull(), name:text('name').notNull(), expiresAt:integer('expires_at').notNull() });
export const authFlows = sqliteTable('auth_flows', { idHash:text('id_hash').primaryKey(), state:text('state').notNull(), verifier:text('verifier').notNull(), nonce:text('nonce').notNull(), returnTo:text('return_to').notNull(), expiresAt:integer('expires_at').notNull() });
