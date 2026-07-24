import { cookies } from "next/headers"
import { createClient } from "../supabase/server"

export async function insert_activity(user_id: number, type: string, message:string, message_id: number): Promise<void>{
    const supabase = createClient(await cookies())
    const {data, error} = await supabase.from('activities').insert({user_id, type, message, message_id})
}