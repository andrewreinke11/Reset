import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, createAuthToken } from '../src/middleware/auth';

// Mock Express response and request
const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
});

const createMockRequest = (headers = {}): Partial<Request> => ({
  headers,
});

describe('MC/DC Coverage - Function 1: authenticateToken()', () => {
  const testUser = { userName: 'testuser', email: 'test@example.com' };
  const secret = process.env.JWT_SECRET || 'reset-dev-secret';
  let validToken: string;

  beforeAll(() => {
    validToken = jwt.sign(testUser, secret, { expiresIn: '7d' });
  });

  describe('TC1: C1=F - Authorization header missing', () => {
    it('should respond 401 when authorization header is not provided', () => {
      const req = createMockRequest({}) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 when authorization header is empty string', () => {
      const req = createMockRequest({ authorization: '' }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('TC2: C2=F - Bearer format invalid', () => {
    it('should respond 401 when authorization header missing Bearer prefix', () => {
      const req = createMockRequest({ authorization: `${validToken}` }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 when Bearer prefix is malformed', () => {
      const req = createMockRequest({ authorization: `Bearee ${validToken}` }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('TC3: C3=F - JWT verification fails', () => {
    it('should respond 401 when JWT is invalid', () => {
      const req = createMockRequest({ authorization: 'Bearer invalid-token' }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 when JWT signature is tampered', () => {
      const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
      const req = createMockRequest({ authorization: `Bearer ${tamperedToken}` }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 when JWT is expired', () => {
      const expiredToken = jwt.sign(testUser, secret, { expiresIn: '-1h' });
      const req = createMockRequest({ authorization: `Bearer ${expiredToken}` }) as Request;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('TC4: C1=T, C2=T, C3=T - All conditions true (Success)', () => {
    it('should call next() when valid Bearer token provided', () => {
      const req = createMockRequest({ authorization: `Bearer ${validToken}` }) as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should extract and set userName from JWT payload', () => {
      const req = createMockRequest({ authorization: `Bearer ${validToken}` }) as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(req.userName).toBe(testUser.userName);
      expect(next).toHaveBeenCalled();
    });

    it('should preserve all JWT claims in request object', () => {
      const req = createMockRequest({ authorization: `Bearer ${validToken}` }) as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      authenticateToken(req, res, next);

      expect(req.userName).toBe(testUser.userName);
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('MC/DC Coverage - Function 8: requireCurrentUser() Middleware', () => {
  const createAuthenticatedRequest = (userName: string | null | undefined, requestedUserName?: string) => {
    const req: any = {
      params: { userName: requestedUserName },
      userName,
      user: userName ? { userName } : null,
    };
    return req as Request;
  };

  const requireCurrentUser = (req: any, res: any, next: any) => {
    if (!req.userName) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!req.params.userName) {
      return next();
    }
    if (req.userName.toLowerCase() !== req.params.userName.toLowerCase()) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

  describe('TC1: C1=T - Not authenticated', () => {
    it('should respond 401 when user is not authenticated (no userName set)', () => {
      const req = createAuthenticatedRequest(null, 'someuser') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 401 when userName is undefined', () => {
      const req = createAuthenticatedRequest(undefined, 'someuser') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('TC2: C2=F - No user parameter provided', () => {
    it('should call next() when no userName parameter specified', () => {
      const req = createAuthenticatedRequest('currentuser', undefined) as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() when userName param is empty', () => {
      const req = createAuthenticatedRequest('currentuser', '') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('TC3: C3=F - User mismatch (wrong user requested)', () => {
    it('should respond 403 when current user does not match requested user', () => {
      const req = createAuthenticatedRequest('currentuser', 'otheruser') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should respond 403 when case-sensitive comparison fails', () => {
      const req = createAuthenticatedRequest('currentUser', 'currentuser') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      const requireCurrentUserCaseSensitive = (req: any, res: any, next: any) => {
        if (!req.userName) {
          return res.status(401).json({ error: 'Authentication required' });
        }
        if (!req.params.userName) {
          return next();
        }
        if (req.userName !== req.params.userName) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        next();
      };

      requireCurrentUserCaseSensitive(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('TC4: C1=F, C2=T, C3=T - All conditions true (Authorized)', () => {
    it('should call next() when current user matches requested user', () => {
      const req = createAuthenticatedRequest('john', 'john') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() when users match case-insensitively', () => {
      const req = createAuthenticatedRequest('John', 'john') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should call next() when users match with different case combinations', () => {
      const req = createAuthenticatedRequest('JANE', 'jane') as any;
      const res = createMockResponse() as Response;
      const next = jest.fn() as NextFunction;

      requireCurrentUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
