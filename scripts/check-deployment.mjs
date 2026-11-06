import { readFileSync } from 'node:fs';
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
const id=config.d1_databases?.find(db=>db.binding==='DB')?.database_id;
if(!id||id==='00000000-0000-4000-8000-000000000000'){
 console.error('Create the hashopee-store D1 database, then replace database_id in wrangler.jsonc with its actual ID before deploying.');process.exit(1);
}
console.log('Database binding is configured. Configure Google sign-in and Cloudinary runtime values in Cloudflare before using accounts and photo uploads.');
