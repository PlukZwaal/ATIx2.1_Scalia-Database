const { requireAuth } = require('../src/middleware/authMiddleware');
const authService = require('../src/services/authService');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/authService');
jest.mock('jsonwebtoken');

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.JWT_SECRET = 'test-secret-key';
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock response object
const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

// Mock request object
const mockRequest = (cookies = {}) => ({
  cookies,
  user: undefined
});

const mockNext = jest.fn();

describe('Authentication Middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should redirect to login when no token is present', () => {
      const req = mockRequest({});
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should redirect to login when token is empty string', () => {
      const req = mockRequest({ auth_token: '' });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(jwt.verify).not.toHaveBeenCalled();
    });

    it('should redirect to login when token is null', () => {
      const req = mockRequest({ auth_token: null });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should redirect to login when token is undefined', () => {
      const req = mockRequest({ auth_token: undefined });
      const res = mockResponse();

      requireAuth(req, res, mockNext);

      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should clear cookie and redirect when JWT verification fails', () => {
      const req = mockRequest({ auth_token: 'invalid-token' });
      const res = mockResponse();
      const jwtError = new Error('Invalid token');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(jwtError, null);
      });

      requireAuth(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        'invalid-token',
        'test-secret-key',
        expect.any(Function)
      );
      expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should clear cookie and redirect when JWT is expired', () => {
      const req = mockRequest({ auth_token: 'expired-token' });
      const res = mockResponse();
      const expiredError = new Error('jwt expired');
      expiredError.name = 'TokenExpiredError';

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(expiredError, null);
      });

      requireAuth(req, res, mockNext);

      expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should clear cookie and redirect when user is not found', () => {
      const req = mockRequest({ auth_token: 'valid-token' });
      const res = mockResponse();
      const decodedToken = { staff_id: 999, email: 'nonexistent@example.com' };

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, decodedToken);
      });

      authService.getById.mockImplementation((id, callback) => {
        callback(null, null);
      });

      requireAuth(req, res, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        'test-secret-key',
        expect.any(Function)
      );
      expect(authService.getById).toHaveBeenCalledWith(999, expect.any(Function));
      expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should clear cookie and redirect when authService.getById returns error', () => {
      const req = mockRequest({ auth_token: 'valid-token' });
      const res = mockResponse();
      const decodedToken = { staff_id: 1, email: 'john@example.com' };
      const dbError = new Error('Database connection failed');

      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, decodedToken);
      });

      authService.getById.mockImplementation((id, callback) => {
        callback(dbError, null);
      });

      requireAuth(req, res, mockNext);
    });
  });
});