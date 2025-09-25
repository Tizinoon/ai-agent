
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export interface ProCon {
  pros: string[];
  cons:string[];
}

export interface Option {
  id: string;
  title: string;
  analysis?: ProCon;
}

export interface Decision {
  id: string;
  problem: string;
  options: Option[];
  recommendation: {
    choice: string;
    reasoning: string;
  };
  date: string;
}

export type Screen = 'home' | 'history' | 'insights';
