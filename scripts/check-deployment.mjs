import { readFileSync } from 'node:fs';
const config=JSON.parse(readFileSync('wrangler.jsonc','utf8'));
const id=config.d1_databases?.find(db=>db.binding==='DB')?.database_id;
if(!id||id==='00000000-0000-4000-8000-000000000000'){
 console.error('Create the hashopee-store D1 database, then replace database_id in wrangler.jsonc with its actual ID before deploying.');process.exit(1);
}
if(!config.r2_buckets?.some(bucket=>bucket.binding==='BUCKET')){console.error('Configure the BUCKET binding for the hashopee-products R2 bucket.');process.exit(1);}
console.log('Deployment bindings are configured. Configure runtime Google sign-in secrets in the Cloudflare dashboard.');
