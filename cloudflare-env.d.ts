declare namespace Cloudflare {
 interface Env {
  DB?:D1Database;
  BUCKET?:R2Bucket;
  ASSETS?:Fetcher;
  ADMIN_EMAILS?:string;
  AUTH_ORIGIN?:string;
  GOOGLE_CLIENT_ID?:string;
  GOOGLE_CLIENT_SECRET?:string;
 }
}
