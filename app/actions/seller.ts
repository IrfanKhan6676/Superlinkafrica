'use server'
import { createServerClient } from "@/lib/supabase/server"

export async function getUser() {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser();
    if(error) return error;
    return user;
}