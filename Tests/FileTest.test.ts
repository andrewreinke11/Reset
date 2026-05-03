import request from 'supertest';
import express from 'express';
import fileRouter from '../src/Controllers/FileController';
import userController from '../src/Controllers/UserController';
import { storageService } from '../src/services/StorageService';
import { users, saveUsers } from '../src/models/User';
import { authHeadersFor } from './testAuth';

const app = express();
app.use(express.json());
app.use('/file', fileRouter);
app.use('/api/users', userController);

const userName = 'testuser';
const fileName = 'testfile';

async function createUser() {
  const res = await request(app)
    .post('/api/users')
    .send({ userName, email: 'test@example.com', password: 'password123' });

  expect(res.status).toBe(201);
  return res.body.token as string;
}

describe('FileController API', () => {
  beforeEach(() => {
    users.length = 0;
    saveUsers();
    storageService.deleteAllUserFiles(userName);
  });

  it('creates a new file', async () => {
    const token = await createUser();
    const res = await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });

    expect(res.status).toBe(201);
    expect(res.body.fileName).toBe(fileName);
    expect(res.body.model).toBeDefined();
  });

  it('adds a color to the palette', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });

    const res = await request(app)
      .post(`/file/${fileName}/palette/add`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ red: 100, green: 150, blue: 200, alpha: 255 });

    expect(res.status).toBe(200);
    expect(res.body.model).toBeDefined();
    expect(res.body.canUndo).toBeDefined();
    expect(res.body.canRedo).toBeDefined();
  });

  it('updates a palette color', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });
    await request(app)
      .post(`/file/${fileName}/palette/add`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ red: 100, green: 150, blue: 200, alpha: 255 });

    const res = await request(app)
      .put(`/file/${fileName}/palette/0`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ red: 50, green: 50, blue: 50, alpha: 255 });

    expect(res.status).toBe(200);
    expect(res.body.model).toBeDefined();
  });

  it('recolors a pixel', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });
    await request(app)
      .post(`/file/${fileName}/palette/add`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ red: 100, green: 150, blue: 200, alpha: 255 });

    const res = await request(app)
      .put(`/file/${fileName}/pixel`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ x: 0, y: 0, colorIndex: 0 });

    expect(res.status).toBe(200);
    expect(res.body.model).toBeDefined();
  });

  it('undoes and redoes', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });
    await request(app)
      .post(`/file/${fileName}/palette/add`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ red: 100, green: 150, blue: 200, alpha: 255 });
    await request(app)
      .put(`/file/${fileName}/pixel`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ x: 0, y: 0, colorIndex: 0 });

    const undoRes = await request(app)
      .post(`/file/${fileName}/undo`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` });
    expect(undoRes.status).toBe(200);
    expect(undoRes.body.model).toBeDefined();

    const redoRes = await request(app)
      .post(`/file/${fileName}/redo`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` });
    expect(redoRes.status).toBe(200);
    expect(redoRes.body.model).toBeDefined();
  });

  it('gets file state', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });

    const res = await request(app)
      .get(`/file/${fileName}`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect(res.body.model).toBeDefined();
  });

  it('deletes a file', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });

    const res = await request(app)
      .delete(`/file/${fileName}`)
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  it('lists all files for user', async () => {
    const token = await createUser();
    await request(app)
      .post('/file/create')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` })
      .send({ fileName, width: 5, height: 5 });

    const res = await request(app)
      .get('/file/')
      .set({ ...authHeadersFor(userName), Authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.files)).toBe(true);
  });
});
