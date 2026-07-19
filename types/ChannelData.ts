import { Timestamp } from "next/dist/server/lib/cache-handlers/types";

export interface ChannelData {
    id: number, 
    created_at: string,
    created_by: string,
    name: string,
    description: string,
    isPublic: boolean
}