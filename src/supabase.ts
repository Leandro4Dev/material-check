import { createClient } from '@supabase/supabase-js'
import { supabaseKey } from './key'

const supabaseUrl = 'https://kcrhocvgxytvmvhyrjjq.supabase.co'

export const supabase = createClient(supabaseUrl, supabaseKey)
