const db = require("./database");
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");


const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0",
        endpoints: ["/tasks"]
    });
});
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});
app.get("/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks").all();

    // Convertit 0/1 en false/true
    const result = tasks.map(task => ({
        ...task,
        done: Boolean(task.done)
    }));

    res.json(result);
});
app.get("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const task = db
        .prepare("SELECT * FROM tasks WHERE id = ?")
        .get(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    task.done = Boolean(task.done);

    res.json(task);

});
app.post("/tasks", (req, res) => {

    const { title } = req.body;

    // Validation
    if (!title || title.trim() === "") {
        return res.status(400).json({
            error: "Title is required"
        });
    }

    // Générer le prochain id
    const newTask = {
        id: tasks.length + 1,
        title: title,
        done: false
    };

    // Ajouter à la liste
    tasks.push(newTask);

    // Retourner la nouvelle tâche
    res.status(201).json(newTask);

});
app.put("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    const { title, done } = req.body;

    // Validation
    if (
        (title !== undefined && title.trim() === "") ||
        (title === undefined && done === undefined)
    ) {
        return res.status(400).json({
            error: "Invalid request body"
        });
    }

    if (title !== undefined) {
        task.title = title;
    }

    if (done !== undefined) {
        task.done = done;
    }

    res.json(task);

});
app.delete("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: `Task ${id} not found`
        });
    }

    tasks.splice(index, 1);

    res.status(204).send();

});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));