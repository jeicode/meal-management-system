import { createClient, RealtimePostgresChangesFilter } from '@supabase/supabase-js'
import { environment } from './environment.config'

export const supabase = createClient(
  environment.SUPABASE_URL,
  environment.SUPABASE_ANON_KEY
)

export const dbChannel = supabase.channel('schema-db-changes')
export const ingredientTableChangeFilter: RealtimePostgresChangesFilter<any> = { 
  event: 'UPDATE', 
  schema: 'public', 
  table: 'Ingredient' 
}