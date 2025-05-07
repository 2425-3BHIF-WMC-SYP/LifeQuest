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
  title:string
  startTime:string
  endTime:string
  userId?:number
}
