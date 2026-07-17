import { get_user } from "@/utils/auth/get_user";
import { NextResponse } from "next/server";

export async function GET(request){
    const user = await get_user()
    console.log(user)
    return NextResponse.json({data: user}, {status: 200})
}