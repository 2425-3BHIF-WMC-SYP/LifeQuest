import bcrypt from 'bcrypt';
import {User} from "../backend/models";
import {Database, open,} from "sqlite";
import sqlite3 from "sqlite3";

export async function initDB() {
    const db = await open({
        filename: 'database/lifeQuest.db',
        driver: sqlite3.Database,
    });
    let stmt = new Statement(db);
    await stmt.createTables();
    return db;
}


export class Statement {
    private saltRounds = 10;
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    public async getUser(email: string, pwd: string) {
        let stmt;
        try {
             stmt= await this.db.prepare("SELECT * FROM users WHERE email=?;");
            await stmt.bind([{1: email}]);
            const user = await stmt.get();
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
        }finally {
            await stmt?.finalize();
        }

    }

    public async createUser(user: User) {
        let stmt;
        try {
            if (!await this.checkIfExists(user)) {
                const hashedPassword = await bcrypt.hash(user.password, this.saltRounds);
                const userCount = await this.getAllUsers();
                 stmt = await this.db.prepare(
                    `INSERT INTO USERS (email, password, level, exp, rank, pfp_path, sex, age, username)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.email, hashedPassword, 0, 0, userCount, user.pfp, user.sex, user.age, user.name.toLowerCase()]
                );
                return await stmt.run();
            } else {
                return false;
            }
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await stmt?.finalize();
        }
    }

    public async getAllUsers(): Promise<number> {
        let stmt;
        try {
            stmt = await this.db.prepare("SELECT * FROM USERS;");
            const users = await  stmt.all();
            return users == undefined ? 0 : users.length;
        }catch(err) {
            console.log(err);
            throw err;
        }finally {
            await stmt?.finalize();
        }

    }

    public async checkIfExists(user: User): Promise<boolean> {
        let stmt;
        try {
            stmt= await this.db.prepare("SELECT * FROM users WHERE email=?;");
            await stmt.bind([{1: user.email}]);
            const usr = await stmt.get();
            return usr != undefined || usr != null;
        }catch(err) {
            console.log(err);
            throw err;
        }finally {
            await stmt?.finalize();
        }

    }

    public async closeDb() {
        await this.db.close();
    }

    //#region CreateTablesStatement
    public async createTables(): Promise<void> {
        await this.db.run(`CREATE TABLE IF NOT EXISTS USERS (
                                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                               email TEXT NOT NULL UNIQUE,
                                                               username TEXT NOT NULL UNIQUE,
                                                               password TEXT NOT NULL,
                                                               questId INTEGER,
                                                               sex TEXT NOT NULL,
                                                               age INTEGER NOT NULL,
                                                               level INTEGER DEFAULT 1,
                                                               exp INTEGER DEFAULT 0,
                                                               rank INTEGER DEFAULT 0,
                                                               pfp_path TEXT,
                                                               FOREIGN KEY (questId) REFERENCES QUESTS(questId) ON DELETE CASCADE
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS QUESTS (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                title TEXT NOT NULL,
                                                                expPoints INTEGER NOT NULL,
                                                                day DATE NOT NULL
                           )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS STATUS (
                                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                 statusTitle TEXT NOT NULL UNIQUE
                           )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS TODOS (
                                                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                               title TEXT NOT NULL,
                                                               deadline DATE NOT NULL,
                                                               userId INTEGER NOT NULL,
                                                               statusId INTEGER NOT NULL,
                                                               FOREIGN KEY (userId) REFERENCES USERS(userId) ON DELETE CASCADE,
                                                               FOREIGN KEY (statusId) REFERENCES STATUS(statusId) ON DELETE CASCADE
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS ENTRIES (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                date DATE NOT NULL,
                                                                title TEXT NOT NULL,
                                                                duration INTEGER NOT NULL,
                                                                userId INTEGER NOT NULL,
                                                                FOREIGN KEY (userId) REFERENCES USERS(userId) ON DELETE CASCADE
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS LEADERBOARDS (
                                                                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                      expGained INTEGER NOT NULL DEFAULT 0,
                                                                      expLost INTEGER NOT NULL DEFAULT 0,
                                                                      questsDone INTEGER NOT NULL DEFAULT 0,
                                                                      userId INTEGER NOT NULL,
                                                                      FOREIGN KEY (userId) REFERENCES USERS(userId) ON DELETE CASCADE
            )`);
    }

    //#endregion CreateTablesStatement

}

export const dbPromise = initDB().then(db=>new Statement(db));
