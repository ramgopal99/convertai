export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  requirements: string;
  score: number;
  interest: string;
  closeChance: string;
  conversations: {
    id: string;
    message: string;
    response: string;
    timestamp: Date;
  }[];
}