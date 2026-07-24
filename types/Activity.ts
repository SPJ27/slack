export interface ActivityProps {
    id: number, 
    created_at: string,
    user_id: number,
    type: string,
    message: string,
    read: boolean,
    message_id: number
}