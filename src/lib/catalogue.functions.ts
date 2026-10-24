import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { Database } from '@/integrations/supabase/types';
import type { Listing, Project } from './site';
import { leadSchema, propertySchema } from './forms';

export const getCatalogue = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Property service unavailable');
  const client = createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{
    const headers=new Headers(init?.headers); if(key.startsWith('sb_') && headers.get('Authorization')===`Bearer ${key}`) headers.delete('Authorization'); headers.set('apikey',key); return fetch(input,{...init,headers});
  }}});
  const {data,error}=await client.from('properties').select('*').order('created_at');
  if(error) throw new Error('Unable to load properties');
  const rows=await Promise.all((data ?? []).map(async row=>{
    let image=row.image;
    if(image.startsWith('media:')) {
      const signed=await client.storage.from('property-media').createSignedUrl(image.slice(6),3600);
      if(signed.error) throw new Error('Unable to load property photo');
      image=signed.data.signedUrl;
    }
    return {...row,image};
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
  if(role.error || !role.data) throw new Error('Administrator access required');
  const {error}=await context.supabase.from('properties').insert(data);
  if(error) throw new Error(error.code==='23505'?'This property address already exists. Change the slug.':'Unable to add property');
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