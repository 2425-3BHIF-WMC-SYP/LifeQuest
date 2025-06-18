import bcrypt from 'bcrypt';
import {Entry, User} from "../backend/models";
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
    //#region UserStatements

    public async getUser(email: string, pwd: string) {
        let stmt;
        try {
            stmt = await this.db.prepare("SELECT * FROM users WHERE email = ?;");
            const user: User | undefined = await stmt.get(email);
            if (!user) {
                console.log("No user found");
                return null;
            }
            console.log(user);
            const isMatch = await bcrypt.compare(pwd, user.password);
            console.log(isMatch);
            return isMatch ? user : null;
        } catch (err) {
            console.error("Error in getUser:", err);
            throw err;
        } finally {
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


    //#endregion UserStatements

    //#region EntriesStatements
    public async getEntries(id: number): Promise<Entry[]> {
        let stmt;
        try {
            stmt= await this.db.prepare("SELECT * FROM ENTRIES WHERE userId=?")
            await stmt.bind(id);
            console.log(id)
            const einstein:Entry[]= await stmt.all();
            console.log(einstein);
            return einstein;
        }catch (err){
           console.log(err);
           throw err;
        }finally {
            await stmt?.finalize();
        }
    }


    public async insertEntry(entry: Entry): Promise<void> {
        let stmt;
        try {
            console.log(entry.color)
            stmt = await this.db.prepare(`INSERT INTO ENTRIES(entryDate, title, colour, startTime, endTime, userId) VALUES(?, ?, ?, ?, ?, ?)`);
            await stmt.run(entry.date, entry.title, entry.color, entry.startTime, entry.endTime, entry.userId);

        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await stmt?.finalize();
        }
    }
    public async updateEntry(entry: Entry, id: number): Promise<void> {
        let stmt;
        try {
            stmt= await this.db.prepare(`UPDATE ENTRIES SET entryDate = ?, title = ?, colour = ?, startTime = ?, endTime = ?, userId = ? WHERE id = ?`);
            await stmt.run(entry.date, entry.title, entry.color, entry.startTime, entry.endTime, entry.userId, id);
        }catch(err) {
            console.log(err);
            throw err;
        }finally {
            await stmt?.finalize();
        }
    }
    public async deleteEntry(id: number): Promise<void> {
        let stmt;
        try {
            stmt= await this.db.prepare(`DELETE FROM ENTRIES WHERE id=?`);
            await stmt.run(id);
        }catch(err) {
            console.log(err);
            throw err;
        }finally {
            await stmt?.finalize();
        }
    }
    //#endregion EntriesStatements

    //#region ToDosStatements
    public async getTodos(userId: number) {
        let stmt;
        try {
            stmt = await this.db.prepare("SELECT * FROM TODOS WHERE userId=?");
            await stmt.bind(userId);
            const todos = await stmt.all();
            return todos;
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await stmt?.finalize();
        }
    }

    public async getTodoById(id: number, userId: number) {
        let stmt;
        try {
            stmt = await this.db.prepare("SELECT * FROM TODOS WHERE id=? AND userId=?");
            await stmt.bind([id, userId]);
            const todo = await stmt.get();
            return todo;
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await stmt?.finalize();
        }
    }

    public async insertTodo(todo: { title: string, deadline: Date, userId: number, status: string }) {
        let stmt;
        try {
            stmt = await this.db.prepare(`INSERT INTO TODOS(title, deadline, userId, status) VALUES(?, ?, ?, ?)`);
            await stmt.run(todo.title, todo.deadline, todo.userId, todo.status);
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            await stmt?.finalize();
        }
    }
    public async deleteTodo(id: number) {
        let stmt;
        try {
            stmt = await this.db.prepare(`DELETE FROM TODOS WHERE id=?`);
            await stmt.run(id);
        }catch(err) {
            console.log(err);
            throw err;
        }finally {
            await stmt?.finalize();
        }
    }
    //#endregion ToDosStatements

    public async closeDb() {
        await this.db.close();
    }


    //#region CreateTablesStatement
    public async createTables(): Promise<void> {
        await this.db.run(`CREATE TABLE IF NOT EXISTS QUESTS (
                                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                 title TEXT NOT NULL,
                                                                 expPoints INTEGER NOT NULL,
                                                                 day DATE NOT NULL
                           )`);

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
                                                                FOREIGN KEY (questId) REFERENCES QUESTS(id) ON DELETE CASCADE
            )`);
        await this.db.run(` CREATE TABLE IF NOT EXISTS USER_QUESTS (
                                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                    userId INTEGER NOT NULL,
                                                                    questId INTEGER NOT NULL,
                                                                    assignedDate DATE NOT NULL DEFAULT (DATE('now')),
                                                                    completed BOOLEAN DEFAULT 0,
                                                                    FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE,
                                                                    FOREIGN KEY (questId) REFERENCES QUESTS(id) ON DELETE CASCADE
            );`)

        await this.db.run(`CREATE TABLE IF NOT EXISTS STATUS (
                                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                 statusTitle TEXT NOT NULL UNIQUE,
                                                                 questsID INTEGER NOT NULL,
                                                                 FOREIGN KEY (questsID) REFERENCES QUESTS(id)
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS TODOS (
                                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                title TEXT NOT NULL,
                                                                deadline DATE NOT NULL,
                                                                userId INTEGER NOT NULL,
                                                                status TEXT NOT NULL,
                                                                FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS ENTRIES (
                                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                  entryDate DATE NOT NULL,
                                                                  title TEXT NOT NULL,
                                                                  colour TEXT NOT NULL,
                                                                  startTime TEXT NOT NULL,
                                                                  endTime TEXT NOT NULL,
                                                                  userId INTEGER NOT NULL,
                                                                  FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE
            )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS LEADERBOARDS (
                                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                                       expGained INTEGER NOT NULL DEFAULT 0,
                                                                       expLost INTEGER NOT NULL DEFAULT 0,
                                                                       questsDone INTEGER NOT NULL DEFAULT 0,
                                                                       userId Integer NOT NULL,
                                                                       FOREIGN KEY (userId) REFERENCES USERS(id) ON DELETE CASCADE
            )`);
    }


    //#endregion CreateTablesStatement

}

export const dbPromise = initDB().then(db=>new Statement(db));
