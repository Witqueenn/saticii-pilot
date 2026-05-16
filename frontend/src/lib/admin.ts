import { createClient } from "@/lib/supabase/client";

export async function isAdmin(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single();

  return !!data;
}
