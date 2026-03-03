const request = require('supertest');
const { app, todos } = require('../src/app');

beforeEach(() => {
  todos.clear();
});

describe('POST /todos', () => {
  it('creates a todo with valid title', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'Buy groceries' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Buy groceries',
      completed: false,
    });
    expect(res.body.id).toBeDefined();
    expect(res.body.createdAt).toBeDefined();
  });

  it('rejects missing title', async () => {
    const res = await request(app).post('/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it('rejects empty string title', async () => {
    const res = await request(app).post('/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  it('trims whitespace from title', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: '  Walk the dog  ' });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Walk the dog');
  });
});

describe('GET /todos', () => {
  it('returns empty array when no todos', async () => {
    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all todos', async () => {
    await request(app).post('/todos').send({ title: 'First' });
    await request(app).post('/todos').send({ title: 'Second' });

    const res = await request(app).get('/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

describe('GET /todos/:id', () => {
  it('returns a specific todo', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Test' });

    const res = await request(app).get(`/todos/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test');
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).get('/todos/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('PUT /todos/:id', () => {
  it('updates title', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Original' });

    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
  });

  it('updates completed status', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Task' });

    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('rejects invalid completed value', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Task' });

    const res = await request(app)
      .put(`/todos/${created.body.id}`)
      .send({ completed: 'yes' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app)
      .put('/todos/nonexistent')
      .send({ title: 'Nope' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /todos/:id', () => {
  it('deletes a todo', async () => {
    const created = await request(app)
      .post('/todos')
      .send({ title: 'Delete me' });

    const res = await request(app).delete(`/todos/${created.body.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/todos/${created.body.id}`);
    expect(check.status).toBe(404);
  });

  it('returns 404 for non-existent id', async () => {
    const res = await request(app).delete('/todos/nonexistent');
    expect(res.status).toBe(404);
  });
});
