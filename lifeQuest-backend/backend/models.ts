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
    color:string
    startTime:string
    endTime:string
    userId:number
}
export interface Quest{
    title:string
    expPoints:string
    day:Date
}

export interface Todo {
    id?: number
    title: string
    deadline: Date
    userId: number
    status: string
}
