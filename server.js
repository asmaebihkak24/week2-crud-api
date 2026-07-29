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

    
   // Insérer la tâche dans la base de données
    const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title, 0);

// Créer l'objet à retourner
    const newTask = {
    id: result.lastInsertRowid,
    title: title,
    done: false
};

res.status(201).json(newTask);

});
app.put("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    // Vérifier que la tâche existe
    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    // Validation
    if (
        (title !== undefined && title.trim() === "") ||
        (title === undefined && done === undefined)
    ) {
        return res.status(400).json({
            error: "Invalid request body"
        });
    }

    // Garder les anciennes valeurs si elles ne sont pas modifiées
    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? (done ? 1 : 0) : task.done;

    db.prepare(
        "UPDATE tasks SET title = ?, done = ? WHERE id = ?"
    ).run(newTitle, newDone, id);

    const updatedTask = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    updatedTask.done = Boolean(updatedTask.done);

    res.json(updatedTask);

});
app.delete("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    // Vérifier que la tâche existe
    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    // Supprimer la tâche
    db.prepare(
        "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    res.status(204).send();

});
app.delete("/tasks/:id", (req, res) => {

    const id = parseInt(req.params.id);

    // Vérifier que la tâche existe
    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    // Supprimer la tâche
    db.prepare(
        "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    res.status(204).send();

});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));