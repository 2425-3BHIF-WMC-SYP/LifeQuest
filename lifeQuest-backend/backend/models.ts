export interface User {
    name: string
    email: string
    password: string
    age: number
    sex: number
    pfp:string
    id?: number
}
export interface Entry{
    date:Date
    title:string
    startTime:string
    endTime:string
    userId:number
}