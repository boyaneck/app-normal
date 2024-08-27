import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_API_KEY as string;

console.log("꺄르르르르르르르르를", supabaseUrl);
console.log("슈퍼키", supabaseKey);
const supabaseForClient = createClient(
  supabaseUrl as string,
  supabaseKey as string
);

console.log(supabaseKey, "키");
console.log(supabaseUrl, "URL");
export { supabaseForClient };
