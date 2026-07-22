import { get_user } from "@/utils/auth/get_user";
import { all_direct_messages } from "@/utils/db/user_data";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse>{
    const user = await get_user()
    if (!user) return NextResponse.json({status: 403})
    const data = await all_direct_messages(user?.id)
    return NextResponse.json({data}, {status: 200})
}