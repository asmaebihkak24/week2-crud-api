const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ----------------------------------------------------------------------
// "Base de données" en mémoire
// ----------------------------------------------------------------------
let tasks = [
  { id: 1, titre: 'Apprendre Express', done: false },
  { id: 2, titre: 'Construire une API CRUD', done: false },
];
let nextId = 3; // compteur auto-incrémenté pour les nouveaux ID

// ----------------------------------------------------------------------
// Configuration Swagger
// ----------------------------------------------------------------------
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de gestion de tâches',
      version: '1.0.0',
      description:
        "API CRUD simple pour gérer une liste de tâches (stockage en mémoire, sans base de données).",
    },
    servers: [{ url: `http://localhost:${PORT}`, description: 'Serveur local' }],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            titre: { type: 'string', example: 'Faire les courses' },
            done: { type: 'boolean', example: false },
          },
        },
        TaskInput: {
          type: 'object',
          required: ['titre'],
          properties: {
            titre: { type: 'string', example: 'Faire les courses' },
            done: { type: 'boolean', example: false },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  },
  // On lit les annotations JSDoc directement dans ce fichier
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ----------------------------------------------------------------------
// Fonction utilitaire : recherche d'une tâche par ID
// ----------------------------------------------------------------------
function findTaskIndex(id) {
  return tasks.findIndex((t) => t.id === Number(id));
}

// ----------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Récupère la liste de toutes les tâches
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: Liste des tâches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Récupère une tâche par son ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tâche trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/tasks/:id', (req, res) => {
  const index = findTaskIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: `Tâche avec l'id ${req.params.id} introuvable` });
  }
  res.status(200).json(tasks[index]);
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Tâche créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Le titre est manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/tasks', (req, res) => {
  const { titre, done } = req.body;

  if (!titre || typeof titre !== 'string' || titre.trim() === '') {
    return res.status(400).json({ message: 'Le champ "titre" est requis' });
  }

  const newTask = {
    id: nextId++,
    titre: titre.trim(),
    done: typeof done === 'boolean' ? done : false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Met à jour une tâche existante
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Le titre est manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/tasks/:id', (req, res) => {
  const index = findTaskIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: `Tâche avec l'id ${req.params.id} introuvable` });
  }

  const { titre, done } = req.body;

  if (!titre || typeof titre !== 'string' || titre.trim() === '') {
    return res.status(400).json({ message: 'Le champ "titre" est requis' });
  }

  tasks[index] = {
    ...tasks[index],
    titre: titre.trim(),
    done: typeof done === 'boolean' ? done : tasks[index].done,
  };

  res.status(200).json(tasks[index]);
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Supprime une tâche
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tâche supprimée (pas de contenu)
 *       404:
 *         description: Tâche non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.delete('/tasks/:id', (req, res) => {
  const index = findTaskIndex(req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: `Tâche avec l'id ${req.params.id} introuvable` });
  }

  tasks.splice(index, 1);
  res.status(204).send();
});

// ----------------------------------------------------------------------
// Route racine (petit confort pour vérifier que le serveur tourne)
// ----------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'API de gestion de tâches. Documentation disponible sur /docs',
  });
});

// ----------------------------------------------------------------------
// Démarrage du serveur
// ----------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📚 Documentation Swagger disponible sur http://localhost:${PORT}/docs`);
});
