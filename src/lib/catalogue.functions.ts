import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Listing, Project } from './site';
import { leadSchema, propertySchema } from './forms';
import { resolvePropertyImage } from './property-images';

export const getCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
  const { createPublicPropertyClient } = await import('./public-properties.server');
  const client = createPublicPropertyClient();
  const {data,error}=await client.from('properties').select('*').order('created_at');
  if(error) throw new Error('Unable to load properties');
  const rows=await Promise.all((data ?? []).map(async row=>{
    let image=row.image;
    if(image.startsWith('media:')) {
      const signed=await client.storage.from('property-media').createSignedUrl(image.slice(6),3600);
      if(signed.error) throw new Error('Unable to load property photo');
      image=signed.data.signedUrl;
    }
    return {...row,image:resolvePropertyImage(image)};
  }));
  const listings:Listing[]=rows.map(r=>({id:r.id,title:r.title,category:r.category as Listing['category'],type:r.type as Listing['type'],propertyType:r.property_type,location:r.location,price:r.price,...(r.beds!=null?{beds:r.beds}:{}),area:r.area,image:r.image,projectSlug:r.slug}));
  const projects:(Project & {brochureUrl:string})[]=rows.map(r=>({slug:r.slug,name:r.title,category:r.category as Project['category'],type:r.type as Project['type'],location:r.location,price:r.price,config:r.config || r.area,status:r.status,image:r.image,summary:r.summary,highlights:r.highlights,brochureUrl:r.brochure_url}));
  return { listings,projects,featured:projects.filter(p=>rows.find(r=>r.slug===p.slug)?.featured) };
});

export const submitEnquiry=createServerFn({method:'POST'}).inputValidator(input=>leadSchema.extend({context:z.string().trim().min(1).max(200)}).parse(input)).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  // Guest enquiries are intentional. No private rows or caller-selected ownership are returned.
  const {error}=await supabaseAdmin.from('enquiries').insert({...data,city:data.city ?? ''});
  if(error) throw new Error('Your enquiry could not be saved. Please try again.');
  return {success:true};
});

export const getAdminData=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) return {authorized:false as const,enquiries:[],properties:[]};
  const [enquiries,properties]=await Promise.all([context.supabase.from('enquiries').select('*').order('created_at',{ascending:false}).limit(500),context.supabase.from('properties').select('*').order('created_at',{ascending:false})]);
  if(enquiries.error || properties.error) throw new Error('Unable to load management data');
  return {authorized:true as const,enquiries:enquiries.data,properties:properties.data};
});

export const addProperty=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>propertySchema.parse(input)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data){
    console.error('[addProperty] has_role failed', {userId:context.userId, roleError:role.error, roleData:role.data});
    throw new Error('Administrator access required');
  }
  const {error}=await context.supabase.from('properties').insert(data);
  if(error){
    // Surface the real Postgres/Supabase error so admin failures are diagnosable.
    console.error('[addProperty] insert failed', {code:error.code, message:error.message, details:error.details, hint:error.hint});
    throw new Error(error.code==='23505'?'This property address already exists. Change the slug.':`Unable to add property: ${error.message}${error.code?` [${error.code}]`:''}`);
  }
  return {success:true};
});
export const removeProperty=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Administrator access required');
  const {error}=await context.supabase.from('properties').delete().eq('id',data.id);
  if(error) throw new Error('Unable to remove property');
  return {success:true};
});
export const getBrochure=createServerFn({method:'POST'}).inputValidator(input=>z.object({slug:z.string().min(1).max(100)}).parse(input)).handler(async({data})=>{
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data:row,error}=await supabaseAdmin.from('properties').select('brochure_url').eq('slug',data.slug).single();
  if(error || !row) throw new Error('Brochure unavailable');
  if(!row.brochure_url.startsWith('media:')) return {url:row.brochure_url || `/downloads/${data.slug}.pdf`};
  const signed=await supabaseAdmin.storage.from('property-media').createSignedUrl(row.brochure_url.slice(6),300);
  if(signed.error) throw new Error('Brochure unavailable');
  return {url:signed.data.signedUrl};
});

export const updateProperty=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({id:z.string().uuid(),property:propertySchema}).parse(input)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Administrator access required');
  const {error}=await context.supabase.from('properties').update(data.property).eq('id',data.id);
  if(error) throw new Error(error.code==='23505'?'This property address already exists. Change the slug.':'Unable to save changes');
  return {success:true};
});

const uploadSchema=z.object({
  kind:z.enum(['photo','brochure']),
  fileName:z.string().min(1).max(200),
  contentType:z.string().min(1).max(100),
  base64:z.string().min(1).max(21_000_000),
});
export const uploadPropertyFile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>uploadSchema.parse(input)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Administrator access required');
  const allowed=data.kind==='photo'?['image/jpeg','image/png','image/webp']:['application/pdf'];
  if(!allowed.includes(data.contentType)) throw new Error(data.kind==='photo'?'Photo must be a JPG, PNG or WebP image':'Brochure must be a PDF');
  const bytes=Uint8Array.from(atob(data.base64),c=>c.charCodeAt(0));
  if(bytes.byteLength>15_000_000) throw new Error('File must be under 15 MB');
  const safe=data.fileName.toLowerCase().replace(/[^a-z0-9.]+/g,'-').slice(-60);
  const path=`${data.kind==='photo'?'photos':'brochures'}/${crypto.randomUUID()}-${safe}`;
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {error}=await supabaseAdmin.storage.from('property-media').upload(path,bytes,{contentType:data.contentType});
  if(error) throw new Error('Upload failed. Please try again.');
  return {ref:`media:${path}`};
});

const aiSettingsSchema=z.object({apiKey:z.string().trim().max(200),model:z.string().trim().min(1).max(80).regex(/^[a-z0-9.\-]+$/i),clear:z.boolean().optional()});
async function requireAdmin(context:{supabase:any;userId:string}){
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
  if(role.error || !role.data) throw new Error('Administrator access required');
}
export const getAiSettings=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  await requireAdmin(context);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const {data}=await supabaseAdmin.from('ai_settings').select('gemini_api_key,gemini_model,updated_at').eq('id',true).maybeSingle();
  const k=data?.gemini_api_key ?? '';
  return {hasKey:!!k,keyEnding:k?k.slice(-4):'',model:data?.gemini_model ?? 'gemini-3.5-flash-lite',updatedAt:data?.updated_at ?? null};
});
export const saveAiSettings=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>aiSettingsSchema.parse(input)).handler(async({data,context})=>{
  await requireAdmin(context);
  const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
  const patch:{gemini_model:string;updated_at:string;gemini_api_key?:string}={gemini_model:data.model,updated_at:new Date().toISOString()};
  if(data.clear) patch.gemini_api_key='';
  else if(data.apiKey) patch.gemini_api_key=data.apiKey;
  const {error}=await supabaseAdmin.from('ai_settings').upsert({id:true,...patch});
  if(error) throw new Error('Unable to save the assistant settings');
  return {success:true};
});
