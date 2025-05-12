import {jwtDecode} from 'jwt-decode';

export interface TokenPayload {
  user:{
    username:string;
    role:string;
    userId:number
  }
  expiresAt: Date;
  message: string;
  accessToken: string;
}
export function getUserId(token:string):number|null{
    try {
      return jwtDecode<TokenPayload>(token).user.userId
    }catch(err){
      console.log(err);
      return null
    }
}
