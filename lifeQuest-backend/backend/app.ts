import express from 'express'
import cors from 'cors'
import {userRouter} from "./routers/user-router";
import {calendarRouter} from "./routers/calendar-router";


const app = express();

app.use(cors())

app.use(express.json())
app.use('/',userRouter)
app.use('/calendar',calendarRouter)
app.use(express.urlencoded({ extended: true }));

app.listen(3000,()=>{
    console.log("app listening on port 3000")
})