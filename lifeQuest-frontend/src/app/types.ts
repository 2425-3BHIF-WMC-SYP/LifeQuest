export interface requiredUserInformation {
  username: string;
  email: string;
  password:string;
  age:number|null;
  sex:string;
  picture: File | null;
  userId?:number;
}

export interface Entry{
  date:Date
  entryDate?: string
  title:string
  colour:string
  startTime:string
  endTime:string
  userId?:number
  id?: number
}
export interface Quest{
  id:number;
  title:string;
  expPoints:number;
  day:Date;
}
export interface ToDo{
   id:number
   title:string
   deadline:Date
   status:string
   userId:number
}

export interface Thought {
  id: number;
  userId: number;
  text: string;
  category: ThoughtCategory;
  createdAt: Date;
}

export type ThoughtCategory = 'Idee' | 'Konzept' | 'Frage' | 'Theorie';

export interface ThoughtNode {
  id: number;
  label: string;
  group: ThoughtCategory;
  title: string;
}

export interface ThoughtEdge {
  id?: string | number;
  from: number;
  to: number;
  arrows?: string;
  color?: string;
  smooth?: {
    enabled: boolean;
    type: string;
    forceDirection?: string | boolean;
    roundness: number;
  };
}

export interface ThoughtNetworkData {
  nodes: ThoughtNode[];
  edges: ThoughtEdge[];
}

export interface ThoughtFormData {
  userId: number;
  text: string;
  category: ThoughtCategory;
}
export interface User {
  username: string
  email: string
  password: string
  age: number
  sex: number
  pfp_path:string
  id?: number
}
