declare namespace Cloudflare {
 interface Env {
  DB?:D1Database;
  CLOUDINARY_CLOUD_NAME?:string;
  CLOUDINARY_API_KEY?:string;
  CLOUDINARY_API_SECRET?:string;
  ASSETS?:Fetcher;
  ADMIN_EMAILS?:string;
  AUTH_ORIGIN?:string;
  GOOGLE_CLIENT_ID?:string;
  GOOGLE_CLIENT_SECRET?:string;
 }
}
