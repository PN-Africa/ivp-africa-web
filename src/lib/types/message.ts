// export interface Message {
//   id: string;
//   sender: "me" | "them";
//   text: string;
//   sentAt: string; // ISO date
// }


export interface RealConversation {
  id: string;
  applicationId: string;
  otherPartyName: string;
  otherPartyAvatar?: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface RealMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}