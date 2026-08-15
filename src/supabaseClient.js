import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rayhntlqpvkqfqbmlecv.supabase.co';
const SUPABASE_KEY = 'sb_publishable__6ttq_D0WR05TFF4TK8fXw_2SJ89Y_4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);