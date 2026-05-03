import request from 'supertest';
import app from '../src/index';
import { users, saveUsers } from '../src/models/User';

describe('UserController API - Edge Cases & Error Handling', () => {
  const userName = 'edgeuser';
  const email = 'edge@example.com';
  const password = 'edgepass';
  const baseUrl = '/api/users';

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
});
