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
 let response:Response;
 try{response=await fetcher(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,{method:'POST',headers:{Authorization:`Basic ${btoa(`${config.apiKey}:${config.apiSecret}`)}`},body:form,signal:AbortSignal.timeout(30000)});}catch{throw new ImageUploadError('Image storage could not be reached. Please try again.',502);}
 if(!response.ok)throw new ImageUploadError('The image could not be uploaded. Check photo-storage settings and usage, then try again.',502);
 let data:any;try{data=await response.json();}catch{throw new ImageUploadError('Image storage returned an invalid response. Please try again.',502);}
 if(typeof data.secure_url!=='string'||data.public_id!==publicId||!isCloudinaryImageUrl(data.secure_url,config.cloudName))throw new ImageUploadError('Image storage returned an unexpected photo URL. Please try again.',502);
 return data.secure_url;
}
