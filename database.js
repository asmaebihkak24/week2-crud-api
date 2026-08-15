const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialise la base de données
async function initDatabase() {
  // Crée la table si elle n'existe pas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  // Vérifie si la table est vide
  const result = await pool.query(
    "SELECT COUNT(*) AS count FROM tasks"
  );

  // Insère les 3 tâches uniquement si la table est vide
  if (parseInt(result.rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO tasks (title, done)
      VALUES
        ('Learn Express', FALSE),
        ('Study SQLite', FALSE),
        ('Build CRUD API', FALSE);
    `);
  }
}

// Récupérer toutes les tâches
async function getAllTasks() {
  const result = await pool.query(
    "SELECT * FROM tasks ORDER BY id"
  );

  return result.rows;
}

// Récupérer une tâche par son ID
async function getTaskById(id) {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );

  return result.rows[0];
}

// Créer une tâche
async function createTask(title) {
  const result = await pool.query(
    `INSERT INTO tasks (title, done)
     VALUES ($1, FALSE)
     RETURNING *`,
    [title]
  );

  return result.rows[0];
}

// Modifier une tâche
async function updateTask(id, title, done) {
  const result = await pool.query(
    `UPDATE tasks
     SET title = $1, done = $2
     WHERE id = $3
     RETURNING *`,
    [title, done, id]
  );

  return result.rows[0];
}

// Supprimer une tâche
async function deleteTask(id) {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
}

module.exports = {
  initDatabase,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};