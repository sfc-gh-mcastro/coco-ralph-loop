const crypto = require('crypto');
const express = require('express');

const app = express();
app.use(express.json());

// In-memory store
const todos = new Map();

// GET /todos - List all todos
app.get('/todos', (req, res) => {
  const list = Array.from(todos.values());
  res.json(list);
});

// GET /todos/:id - Get a single todo
app.get('/todos/:id', (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

// POST /todos - Create a new todo
app.post('/todos', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'title is required and must be a non-empty string' });
  }

  const todo = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };

  todos.set(todo.id, todo);
  res.status(201).json(todo);
});

// PUT /todos/:id - Update a todo
app.put('/todos/:id', (req, res) => {
  const todo = todos.get(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    todo.title = title.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'completed must be a boolean' });
    }
    todo.completed = completed;
  }

  res.json(todo);
});

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', (req, res) => {
  if (!todos.has(req.params.id)) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.delete(req.params.id);
  res.status(204).end();
});

// Export app and todos map (for testing)
module.exports = { app, todos };
