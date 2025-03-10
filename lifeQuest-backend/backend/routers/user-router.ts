import express from "express";
import multer from 'multer';
import {User} from "../models";
import {dbPromise} from "../../database/statements";

export const userRouter = express.Router();


//multer
const upload = multer({dest: '/upload'});

userRouter.post('/login', async (req, res) => {
    try {
        let db = await dbPromise;
        let user = await db.getUser(req.body.email, req.body.password)
        if (!user) {
            res.status(401).json({message:"User Not Found"})
        }else{
            res.status(200).json(user)
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({message:"Something went wrong"});
    }

})

userRouter.post('/signup', upload.single('pfp'), async (req, res) => {
    try {
        let db = await dbPromise;
        if (!req.body.username || !req.body.password || !req.body.sex || !req.body.email || !req.body.age) {
            res.status(401).json({message:"Missing required fields"});
        } else {
            const age = parseInt(req.body.age);
            const user: User = {
                name: req.body.username,
                password: req.body.password,
                sex: req.body.sex,
                email: req.body.email,
                age: age,
                pfp: req.file?.path as string,
            };
            const creatUser=await db.createUser(user);
            if (creatUser) {
                res.status(200).json({message:"User Created Successfully"})
            }else{
                res.status(403).json({message:"User Already exists"})
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({message:'Something went wrong'});
    }
})