import { get_user } from "@/utils/auth/get_user";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
    const {name, description, isPublic} = await request.json()
    const supabase = await createClient(await cookies())
    const user = await get_user()
    const {data, error} = await supabase.from('channels').insert({name, description, isPublic, created_by: user.id})
    if (error) {
    return NextResponse.json({ error: "unable to insert data" }, { status: 500 })
    }
    console.log(data)
    return NextResponse.json({message: 'success'}, {status: 200})
}