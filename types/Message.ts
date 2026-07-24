import { UserData } from "./UserData";

export interface SimpleMessageInterface {
  name: string;
  time: string;
  text: string;
  pfp?: string;
  special: boolean;
  isSame: boolean;
  user: UserData | undefined;
  attachments: string[] | null;
  app: boolean;
}

export interface Message {
  id: number;
  from: number;
  to: number;
  message: string;
  created_at: string;
  attachments: string[] | null;
  app: boolean;
  type: string;
}