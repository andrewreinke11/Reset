import request from 'supertest';
import app from '../src/index';
import { users, saveUsers } from '../src/models/User';
import { createAuthToken } from '../src/middleware/auth';

describe('User API', () => {
  beforeEach(() => {
    users.length = 0;
    saveUsers();
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.user.userName).toBe('testuser');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('should not allow duplicate usernames', async () => {
    await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test2@example.com', password: 'password456' });
    expect(res.status).toBe(409);
  });

  it('should login with correct credentials', async () => {
    await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/users/login')
      .send({ userName: 'testuser', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.userName).toBe('testuser');
  });

  it('should not login with incorrect password', async () => {
    await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .post('/api/users/login')
      .send({ userName: 'testuser', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('should update user email', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .put('/api/users/testuser')
      .set({ Authorization: `Bearer ${createRes.body.token}` })
      .send({ email: 'new@example.com' });
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('new@example.com');
  });

  it('should delete a user', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .delete('/api/users/testuser')
      .set({ Authorization: `Bearer ${createRes.body.token}` });
    expect(res.status).toBe(200);
    expect(res.body.userName).toBe('testuser');
  });

  it('should get all users', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .get('/api/users')
      .set({ Authorization: `Bearer ${createRes.body.token}` });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a single user', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ userName: 'testuser', email: 'test@example.com', password: 'password123' });
    const res = await request(app)
      .get('/api/users/testuser')
      .set({ Authorization: `Bearer ${createRes.body.token}` });
    expect(res.status).toBe(200);
    expect(res.body.userName).toBe('testuser');
  });
});

describe('UserController API - Edge Cases & Error Handling', () => {
  const userName = 'edgeuser';
  const email = 'edge@example.com';
  const password = 'edgepass';
  const baseUrl = '/api/users';

  beforeEach(() => {
    users.length = 0;
    saveUsers();
  });

  beforeEach(() => {
    users.length = 0;
    saveUsers();
  });

  it('should not create a user with missing fields', async () => {
    const res = await request(app)
      .post(baseUrl)
      .send({ userName });
    expect(res.status).toBe(400);
  });

  it('should not create a user with duplicate username', async () => {
    await request(app)
      .post(baseUrl)
      .send({ userName, email, password });
    const res = await request(app)
      .post(baseUrl)
      .send({ userName, email: 'other@example.com', password: 'otherpass' });
    expect(res.status).toBe(409);
  });

  it('should return 404 when updating a non-existent user', async () => {
    const res = await request(app)
      .put(`${baseUrl}/doesnotexist`)
      .set({ Authorization: `Bearer ${createAuthToken('doesnotexist')}` })
      .send({ email: 'new@example.com' });
    expect(res.status).toBe(404);
  });

  it('should return 404 when deleting a non-existent user', async () => {
    const res = await request(app)
      .delete(`${baseUrl}/doesnotexist`)
      .set({ Authorization: `Bearer ${createAuthToken('doesnotexist')}` });
    expect(res.status).toBe(404);
  });

  it('should return 401 for login with incorrect username', async () => {
    const res = await request(app)
      .post(`${baseUrl}/login`)
      .send({ userName: 'wronguser', password });
    expect(res.status).toBe(401);
  });

  it('should return 401 for login with incorrect password', async () => {
    await request(app)
      .post(baseUrl)
      .send({ userName, email, password });
    const res = await request(app)
      .post(`${baseUrl}/login`)
      .send({ userName, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('should never return passwordHash in API responses', async () => {
    const createRes = await request(app)
      .post(baseUrl)
      .send({ userName, email, password });
    const headers = { Authorization: `Bearer ${createRes.body.token}` };
    const res = await request(app)
      .get(`${baseUrl}/${userName}`)
      .set(headers);
    expect(res.body.passwordHash).toBeUndefined();
    const resAll = await request(app)
      .get(baseUrl)
      .set(headers);
    for (const user of resAll.body) {
      expect(user.passwordHash).toBeUndefined();
    }
  });
});
