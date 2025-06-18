import express from "express";
import {Entry} from "../models";
import {initDB, Statement} from "../../database/statements";
import {isAuthenticated} from "../middleware/auth-handlers";
import {StatusCodes} from "http-status-codes";

/*
const router = express.Router();

router.get("/", isAuthenticated, async (req,res)=>{
    let db;
    try {
        db = await initDB();

    }catch(err){

    }finally{

    }
})

 */