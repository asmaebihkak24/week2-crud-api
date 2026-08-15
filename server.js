const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");

const {
  initDatabase,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require("./database");

const app = express();

app.use(express.json());

const PORT = 3000;

// Home
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"],
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// GET /tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await getAllTasks();

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database error",
    });
  }
});

// GET /tasks/:id
app.get("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database error",
    });
  }
});

// POST /tasks
app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    // Validation
    if (!title || title.trim() === "") {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const newTask = await createTask(title);

    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database error",
    });
  }
});

// PUT /tasks/:id
app.put("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, done } = req.body;

    // Vérifier que la tâche existe
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Validation
    if (
      (title !== undefined && title.trim() === "") ||
      (title === undefined && done === undefined)
    ) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    // Garder les anciennes valeurs si elles ne sont pas modifiées
    const newTitle = title !== undefined ? title : task.title;
    const newDone = done !== undefined ? Boolean(done) : task.done;

    const updatedTask = await updateTask(
      id,
      newTitle,
      newDone
    );

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database error",
    });
  }
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Vérifier que la tâche existe
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    // Supprimer la tâche
    await deleteTask(id);

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Database error",
    });
  }
});

// Swagger
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// Initialiser la base puis démarrer le serveur
async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running at http://localhost:${PORT}`
  );
});
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

startServer();