import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_API_KEY as string;

const supabaseForClient = createClient(
  supabaseUrl as string,
  supabaseKey as string
);

export { supabaseForClient };
