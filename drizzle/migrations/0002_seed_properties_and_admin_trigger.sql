INSERT INTO public.properties (slug, title, category, type, property_type, location, price, beds, area, image, config, status, summary, highlights, featured, brochure_url) VALUES
('oceans-crest-residences','Oceans Crest Residences','Residential','New Projects','Apartment','Sector 150, Noida','₹1.85 Cr onwards',3,'1,950 sq ft','/__l5e/assets-v1/7559df91-286d-47fa-85aa-7e70617f512d/hero-residential.jpg','3 & 4 BHK Apartments','Under construction','Landscaped high-rise living with a central water garden, clubhouse and wide-span homes.',ARRAY['80% open green area','Clubhouse & pool','RERA registered','Metro within 2 km'],true,''),
('earthline-business-park','Earthline Business Park','Commercial','New Projects','Retail Shop','Golf Course Ext. Road, Gurugram','₹65 L onwards',NULL,'320 sq ft','/__l5e/assets-v1/b94ea766-c60d-4386-be41-7c7b1f8ee560/retail.jpg','Retail shops & office suites','Launching soon','High-street retail with office floors above, on a busy arterial road with strong footfall.',ARRAY['Assured rental options','Double-height retail','Ample parking','Food court'],true,''),
('shoreline-plots','Shoreline Plots','Plots & Land','New Projects','Residential Plot','Yamuna Expressway','₹45 L onwards',NULL,'200 sq yd','/__l5e/assets-v1/fa3c68f7-7243-4c25-9a17-acc211d84d5c/plots.jpg','150 – 500 sq yd plots','Ready to register','Gated plotted township near the upcoming airport, with parks, wide roads and full security.',ARRAY['Near Jewar Airport','Gated & secured','40 ft internal roads','Clear titles'],true,''),
('skyline-apartment','Skyline Apartment','Residential','Resale','Apartment','Preet Vihar, East Delhi','₹2.40 Cr',4,'2,300 sq ft','/__l5e/assets-v1/5810cb83-76ee-4049-9457-49324eee1b1c/interior.jpg','','','',ARRAY[]::text[],false,''),
('palm-grove-villas','Palm Grove Villas','Residential','New Projects','Villa','Sohna Road, Gurugram','₹4.75 Cr',4,'3,800 sq ft','/__l5e/assets-v1/ea7efb8f-5d28-48b1-9af0-5abede7fc78c/villas.jpg','','','',ARRAY[]::text[],false,''),
('sea-facing-holiday-villa','Sea-facing Holiday Villa','Residential','Resale','Holiday Home','North Goa','₹6.20 Cr',5,'5,200 sq ft','/__l5e/assets-v1/78ef80ea-9af7-4de8-b35f-03c95b8175d5/hero-villa.jpg','','','',ARRAY[]::text[],false,''),
('grade-a-office-floor','Grade-A Office Floor','Commercial','Resale','Office','Karkardooma, East Delhi','₹3.10 Cr',NULL,'4,000 sq ft','/__l5e/assets-v1/ce81b2d3-ed70-4196-b10c-e8e40680519e/hero-commercial.jpg','','','',ARRAY[]::text[],false,''),
('farmhouse-land','Farmhouse Land','Plots & Land','Resale','Farm Land','Chattarpur, South Delhi','₹8.50 Cr',NULL,'1 acre','/__l5e/assets-v1/ea7efb8f-5d28-48b1-9af0-5abede7fc78c/villas.jpg','','','',ARRAY[]::text[],false,'');

CREATE OR REPLACE FUNCTION public.assign_verified_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'saaurabh@oceansandearthrealty.com' AND NEW.email_confirmed_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.email_confirmed_at IS NULL) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_verified_admin ON auth.users;
CREATE TRIGGER on_auth_user_verified_admin
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_verified_admin();