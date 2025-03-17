import express from "express";
import {User} from "../models";
import {initDB} from "../../database/statements";
import {Statement} from "../../database/statements";
import multer from "multer";

import * as path from "node:path";
import * as fs from "node:fs";

export const userRouter = express.Router();

const storage = multer.diskStorage({
    destination:  (req, file, cb)=> {
        const dir = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        cb(null, dir);
    },
    filename:(req, file, cb)=> {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
const upload = multer({storage: storage});


userRouter.post('/login', async (req, res) => {
    let db;
    try {
        db=await initDB().then(db=>new Statement(db));
        let user = await db.getUser(req.body.email, req.body.password)
        if (!user) {
            res.status(401).json({message:"User Not Found"})
        }else{
            res.status(200).json(user)
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({message:"Something went wrong"});
    }finally {
         await db?.closeDb();
    }

})

userRouter.post('/signup', upload.single('picture'), async (req, res) => {
    let db=null;
    try {
        db =await initDB().then(db=>new Statement(db)) ;
        if (!req.body.username || !req.body.password || !req.body.sex || !req.body.email || !req.body.age || !req.file) {
            console.log(req.file)
            res.status(401).json({message:"Missing required fields"});
        } else {
            const age = parseInt(req.body.age);
            const filepath =`/public/images/${req.file.filename}`;
            const user: User = {
                name: req.body.username,
                password: req.body.password,
                sex: req.body.sex,
                email: req.body.email,
                age: age,
                pfp: filepath,
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
    } finally {
        await db?.closeDb();
    }
})