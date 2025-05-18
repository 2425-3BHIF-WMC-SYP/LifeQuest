import express from "express";
import { Todo } from "../models";
import { initDB, Statement } from "../../database/statements";
import { isAuthenticated } from "../middleware/auth-handlers";
import { StatusCodes } from "http-status-codes";

export const todoRouter = express.Router();

todoRouter.get("/", isAuthenticated, async (req, res) => {
    let db;
    try {
        db = await initDB().then(db => new Statement(db));

        if (typeof req.query.userId === "string") {
            const todos = await db.getTodos(parseInt(req.query.userId));
            res.status(StatusCodes.OK).json(todos);
        } else {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
        }
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    } finally {
        await db?.closeDb();
    }
});

todoRouter.get("/:id", isAuthenticated, async (req, res) => {
    let db;
    try {
        db = await initDB().then(db => new Statement(db));

        const todoId = parseInt(req.params.id);

        if (typeof req.query.userId !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "User ID is required" });
        }

        const userId = parseInt(req.query.userId);
        const todo = await db.getTodoById(todoId, userId);

        if (!todo) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Todo not found or does not belong to the user" });
        }

        res.status(StatusCodes.OK).json(todo);
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    } finally {
        await db?.closeDb();
    }
});

todoRouter.post("/", isAuthenticated, async (req, res) => {
    let db;
    try {
        const { title, deadline, userId, status } = req.body;
        if (!title || !deadline || !userId || !status) {
            console.log(title)
            console.log(deadline)
            console.log(userId)
            console.log(status)
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Missing required fields" });
        }

        db = await initDB().then(db => new Statement(db));

        const todo = {
            title,
            deadline,
            userId: parseInt(userId),
            status
        };

        await db.insertTodo(todo);
        res.status(StatusCodes.CREATED).json({ message: "Todo created successfully", todo });
    } catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    } finally {
        await db?.closeDb();
    }
});

todoRouter.delete("/:id", isAuthenticated, async (req, res) => {
    let db;
    try{
        db = await initDB().then(db => new Statement(db));
        const todoId = parseInt(req.params.id);
        await db.deleteTodo(todoId);
        res.status(StatusCodes.OK).json({message: "Todo removed successfully"});
    }catch(err){
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
    }finally {
        await db?.closeDb();
    }
})
