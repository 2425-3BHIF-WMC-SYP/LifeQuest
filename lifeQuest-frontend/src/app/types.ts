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
export interface ToDo{
   id:number
   title:string
   deadline:Date
   status:string
   userId:number
}
