import bcrypt from 'bcrypt';
import {User} from "../backend/models";
import {open, Database,} from "sqlite";
import sqlite3 from "sqlite3";

async function initDB() {
    return await open({
        filename: 'database/lifeQuest.db',
        driver: sqlite3.Database,
    })
}

class Statement {
    private saltRounds = 10;
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }
    public async getUser(email:string, pwd:string){
        try {
            const user = await this.db.get<User>(
                `SELECT * FROM USER WHERE email=?`, [email.toLowerCase()]
            );
            if (!user) {
                console.log("No user found");
                return null;
            }
            const isMatch = await bcrypt.compare(pwd, user.password);
            if (!isMatch) {
                return null;
            }
            return user;
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    public async createUser(user: User) {
        try {
            if (!await this.checkIfExists(user)) {
                const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);
                await this.db.run(
                    `INSERT INTO USER (email, password, level, exp, rank, pfp_path, sex, age, username)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.email, hashedPassword, 0, 0, this.getAllUsers.length, user.pfp, user.sex, user.age, user.name.toLowerCase()]
                );
                return true;
            }else {
                return false;
            }
        } catch (err) {
            console.log(err);
            throw err;
        }

    }

    public async getAllUsers(): Promise<number> {
        const users = await this.db.get<User[]>(`SELECT *
                                                 FROM User`);
        return users == undefined ? 0 : users.length;
    }
    public async checkIfExists(user: User): Promise<boolean> {
        const usr= await this.db.get<User>(`SELECT * FROM USER WHERE email=?`, [user.email]);
        return usr != undefined || usr != null;
    }
}

export const dbPromise = initDB().then(db => new Statement(db))
