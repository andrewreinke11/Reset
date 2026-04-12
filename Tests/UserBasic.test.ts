import request from "supertest";
import app from "../src/index";
import { users, loadUsers, saveUsers } from "../src/models/User";

describe("User API", () => {
  beforeEach(() => {
    users.length = 0;
    saveUsers();
  });

  it("should create a new user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ userName: "testuser", email: "test@example.com", password: "password123" });
    expect(res.status).toBe(201);
    expect(res.body.userName).toBe("testuser");
    expect(res.body.email).toBe("test@example.com");
    expect(res.body.passwordHash).toBeUndefined();
  });

  // ...other basic user API tests
});
