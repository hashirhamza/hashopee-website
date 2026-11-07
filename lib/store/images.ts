export type CloudinaryConfig={cloudName?:string;apiKey?:string;apiSecret?:string};
export class ImageUploadError extends Error{status:number;constructor(message:string,status=400){super(message);this.status=status;this.name='ImageUploadError';}}
export function isCloudinaryImageUrl(value:string,cloudName?:string){try{const url=new URL(value);if(url.protocol!=='https:'||url.hostname!=='res.cloudinary.com'||url.port||url.username||url.password||url.search||url.hash)return false;const match=url.pathname.match(/^\/([a-zA-Z0-9_-]+)\/image\/upload\/(?:v\d+\/)?hashopee\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/);return !!match&&(!cloudName||match[1]===cloudName);}catch{return false;}}
export function cloudinaryReady(config:CloudinaryConfig){return !!config.cloudName&&/^[a-zA-Z0-9_-]+$/.test(config.cloudName)&&!!config.apiKey&&!!config.apiSecret;}
export async function uploadProductImage(file:File,config:CloudinaryConfig,fetcher:typeof fetch=fetch):Promise<string>{
 if(!cloudinaryReady(config))throw new ImageUploadError('Photo storage is not configured yet. Add the Cloudinary settings in Cloudflare.',503);
 if(file.size>8*1024*1024||file.size<12)throw new ImageUploadError('Choose an image smaller than 8 MB');
 const bytes=new Uint8Array(await file.arrayBuffer());let mime='',extension='';
 if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff){mime='image/jpeg';extension='jpg';}
 else if([137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)){mime='image/png';extension='png';}
 else if(new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP'){mime='image/webp';extension='webp';}
 else throw new ImageUploadError('Upload a JPEG, PNG, or WebP photo');
 const publicId=`hashopee/${crypto.randomUUID()}`;const form=new FormData();
 form.set('file',new File([file],`product.${extension}`,{type:mime}));form.set('public_id',publicId);form.set('overwrite','false');
 const timestamp=String(Math.floor(Date.now()/1000));
 const payload=`overwrite=false&public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`;
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(payload));
 const signature=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
 form.set('timestamp',timestamp);form.set('api_key',config.apiKey!);form.set('signature',signature);
 let response:Response;
 try{response=await fetcher(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,{method:'POST',body:form,signal:AbortSignal.timeout(30000)});}catch{throw new ImageUploadError('Image storage could not be reached. Please try again.',502);}
 if(!response.ok){
  const guidance:Record<number,string>={
   400:'Cloudinary rejected the upload request (400). Check the cloud name and image upload settings.',
   401:'Cloudinary could not authenticate the upload (401). In Cloudflare, replace CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET with values from the same active Cloudinary key pair.',
   403:'Cloudinary refused this upload (403). Check the API key permissions and account restrictions.',
   404:'Cloudinary could not find the upload endpoint (404). Check CLOUDINARY_CLOUD_NAME in Cloudflare.',
   420:'Cloudinary usage limit reached (420). Check your Cloudinary usage dashboard.',
   429:'Cloudinary is receiving too many requests (429). Wait a moment and try again.'
  };
  throw new ImageUploadError(guidance[response.status]||`Cloudinary could not complete the upload (HTTP ${response.status}). Try again, or check the Cloudinary account status.`,502);
 }
 let data:any;try{data=await response.json();}catch{throw new ImageUploadError('Image storage returned an invalid response. Please try again.',502);}
 if(typeof data.secure_url!=='string'||data.public_id!==publicId||!isCloudinaryImageUrl(data.secure_url,config.cloudName))throw new ImageUploadError('Image storage returned an unexpected photo URL. Please try again.',502);
 return data.secure_url;
}
