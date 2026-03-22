/** Alinhado a grants em supabase/consolidated_full_schema.sql */

export const OFFICES_SELECT_PUBLIC =
  'id,name,slug,city,state,tier,verified,chat_juridico_client,is_plus,logo_url,description,website_url,instagram_url,linkedin_url,practice_areas,map_position_x,map_position_z,latitude,longitude,created_at';

/** Literal completo (evita template: o parser de tipos do supabase-js falha em concat) */
export const OFFICES_SELECT_MEMBER =
  'id,name,slug,city,state,tier,verified,chat_juridico_client,is_plus,logo_url,description,website_url,instagram_url,linkedin_url,practice_areas,map_position_x,map_position_z,latitude,longitude,created_at,email,oab_number,address,revenue';
