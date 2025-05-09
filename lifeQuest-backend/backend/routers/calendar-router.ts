import express from "express";
import {Entry} from "../models";
import {initDB, Statement} from "../../database/statements";
import {isAuthenticated} from "../middleware/auth-handlers";
import {StatusCodes} from "http-status-codes";


export const calendarRouter = express.Router()

calendarRouter.get('/entries',isAuthenticated, async (req,res)=>{
    let db;
    try {
        db = await initDB().then(db=>new Statement(db));
        let entries;
        console.log(req.query.userId)
        if(typeof req.query.userId === "string"){
             entries=await db.getEntries(parseInt(req.query.userId));
             console.log("entries",entries);
        }
        if (entries != null) {
            res.status(StatusCodes.OK).json(entries);
        }else
            res.status(StatusCodes.NOT_FOUND).json(entries);
    }catch(err){
        res.status(500).send({error:err});
    }finally{
        await db!.closeDb();
    }
})
calendarRouter.post("/entries",isAuthenticated, async (req,res)=>{
    let db;
    try {
       const {date,title,colour,startTime,endTime,userId} = req.body;
        console.log(req.body);
       db = await initDB().then(db=>new Statement(db));
       const entry:Entry={
           date,
           title,
           color:colour,
           startTime,
           endTime,
           userId
       }
       await db.insertEntry(entry)
        res.status(StatusCodes.OK).json(entry);
    }catch(err){
        res.status(500).send({error:err});
        console.log(err);
    }finally {
        await db!.closeDb();
    }
})