import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// Mock user storage for testing
let mockUserStore: Map<string, any> = new Map();

// Mock functions
const mockRegisterUser = async (userName: string, email: string, password: string) => {
  if (!userName || !email || !password) {
    throw new Error('Missing required fields');
  }
  if (mockUserStore.has(userName)) {
    throw new Error('User already exists');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { userName, email, password: hashedPassword, createdAt: new Date() };
  mockUserStore.set(userName, user);
  return user;
};

const mockLoginUser = async (userName: string, password: string) => {
  if (!userName || !password) {
    throw new Error('Missing credentials');
  }
  const user = mockUserStore.get(userName);
  if (!user) {
    throw new Error('User not found');
  }
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }
  const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET || 'reset-dev-secret');
  return { token, user };
};

describe('MC/DC Coverage - Function 6: User Registration', () => {
  beforeEach(() => {
    mockUserStore.clear();
  });

  describe('TC1: Valid registration', () => {
    it('should register user with valid credentials', async () => {
      const result = await mockRegisterUser('testuser', 'test@example.com', 'password123');
      expect(result.userName).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      expect(mockUserStore.has('testuser')).toBe(true);
    });
  });

  describe('TC2: Missing username', () => {
    it('should fail when username is empty', async () => {
      await expect(
        mockRegisterUser('', 'test@example.com', 'password123')
      ).rejects.toThrow();
    });
  });

  describe('TC3: Missing email', () => {
    it('should fail when email is empty', async () => {
      await expect(
        mockRegisterUser('testuser', '', 'password123')
      ).rejects.toThrow();
    });
  });

  describe('TC4: Missing password', () => {
    it('should fail when password is empty', async () => {
      await expect(
        mockRegisterUser('testuser', 'test@example.com', '')
      ).rejects.toThrow();
    });
  });

  describe('TC5: Duplicate username', () => {
    it('should fail when username already exists', async () => {
      await mockRegisterUser('testuser', 'test@example.com', 'password123');
      await expect(
        mockRegisterUser('testuser', 'another@example.com', 'password456')
      ).rejects.toThrow('User already exists');
    });
  });

  describe('TC6: All fields valid - password hashing', () => {
    it('should hash password during registration', async () => {
      const password = 'mypassword123';
      const result = await mockRegisterUser('newuser', 'new@example.com', password);
      const storedUser = mockUserStore.get('newuser');
      expect(storedUser.password).not.toBe(password);
      expect(await bcrypt.compare(password, storedUser.password)).toBe(true);
    });
  });
});

describe('MC/DC Coverage - Function 7: User Login', () => {
  beforeEach(async () => {
    mockUserStore.clear();
    const hashedPassword = await bcrypt.hash('correctpassword', 10);
    mockUserStore.set('testuser', {
      userName: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
    });
  });

  describe('TC1: Missing username', () => {
    it('should fail when username is empty', async () => {
      await expect(
        mockLoginUser('', 'correctpassword')
      ).rejects.toThrow('Missing credentials');
    });
  });

  describe('TC2: Missing password', () => {
    it('should fail when password is empty', async () => {
      await expect(
        mockLoginUser('testuser', '')
      ).rejects.toThrow('Missing credentials');
    });
  });

  describe('TC3: User not found', () => {
    it('should fail when user does not exist', async () => {
      await expect(
        mockLoginUser('nonexistentuser', 'correctpassword')
      ).rejects.toThrow('User not found');
    });
  });

  describe('TC4: Wrong password', () => {
    it('should fail with incorrect password', async () => {
      await expect(
        mockLoginUser('testuser', 'wrongpassword')
      ).rejects.toThrow('Invalid password');
    });
  });

  describe('TC5: Valid credentials', () => {
    it('should login successfully with correct credentials', async () => {
      const result = await mockLoginUser('testuser', 'correctpassword');
      expect(result.user.userName).toBe('testuser');
      expect(result.token).toBeDefined();
    });
  });

  describe('TC6: JWT token generation', () => {
    it('should generate valid JWT token on successful login', async () => {
      const result = await mockLoginUser('testuser', 'correctpassword');
      const decoded: any = jwt.verify(result.token, process.env.JWT_SECRET || 'reset-dev-secret');
      expect(decoded.userName).toBe('testuser');
    });
  });
});
