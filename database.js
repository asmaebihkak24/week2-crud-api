const Database = require("better-sqlite3");

// Ouvre ou crée automatiquement tasks.db
const db = new Database("tasks.db");

// Crée la table si elle n'existe pas
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
);
`);

// Vérifie si la table est vide
const row = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (row.count === 0) {
    const insert = db.prepare(
        "INSERT INTO tasks (title, done) VALUES (?, ?)"
    );

    insert.run("Learn Express", 0);
    insert.run("Study SQLite", 0);
    insert.run("Build CRUD API", 0);
}

module.exports = db;