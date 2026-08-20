require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./openapi.json");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
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

const PORT = process.env.PORT || 3000;

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
// Public info
app.get("/public/info", (req, res) => {
  res.status(200).json({
    message: "Welcome stranger! This info is public.",
  });
});
// Protected profile
app.get("/protected/profile", (req, res) => {
  const authHeader = req.headers.authorization;

  // Aucun Authorization header
  if (!authHeader) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  // Vérifier le format Bearer <token>
  const parts = authHeader.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer" ||
    !parts[1]
  ) {
    return res.status(401).json({
      error: "Access token required",
    });
  }

  // Stage 2 : on vérifie seulement que le token existe.
  // La vérification réelle avec Supabase sera faite au Stage 3.
  res.status(200).json({
    message: "Token received",
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
// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Signup error:", error);
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(201).json({
      user: data.user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
});
// POST /auth/login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error);
      return res.status(401).json({
        error: "Invalid login credentials",
      });
    }

    res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Internal server error",
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
