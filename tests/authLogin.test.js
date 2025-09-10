const authController = require('../src/controllers/authController');
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
  res.render = jest.fn();
  res.redirect = jest.fn();
  res.cookie = jest.fn();
  res.clearCookie = jest.fn();
  return res;
};

// Mock request object
const mockRequest = (body = {}, cookies = {}) => ({
  body,
  cookies
});

const mockNext = jest.fn();

describe('Authentication Login Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoginForm', () => {
    it('should render login form with empty data', () => {
      const req = mockRequest();
      const res = mockResponse();

      authController.getLoginForm(req, res);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: null,
        formData: {}
      });
    });
  });

  describe('login', () => {
    it('should render form with error when email is missing', () => {
      const req = mockRequest({ email: '', password: 'password123' });
      const res = mockResponse();

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Email is verplicht',
        formData: { email: '' }
      });
      expect(authService.authenticate).not.toHaveBeenCalled();
    });

    it('should render form with error when password is missing', () => {
      const req = mockRequest({ email: 'test@example.com', password: '' });
      const res = mockResponse();

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Wachtwoord is verplicht',
        formData: { email: 'test@example.com' }
      });
      expect(authService.authenticate).not.toHaveBeenCalled();
    });

    it('should render form with error when both email and password are missing', () => {
      const req = mockRequest({ email: '', password: '' });
      const res = mockResponse();

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Email is verplicht',
        formData: { email: '' }
      });
    });

    it('should render form with error when email is whitespace only', () => {
      const req = mockRequest({ email: '   ', password: 'password123' });
      const res = mockResponse();

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Email is verplicht',
        formData: { email: '   ' }
      });
    });

    it('should render form with error when password is whitespace only', () => {
      const req = mockRequest({ email: 'test@example.com', password: '   ' });
      const res = mockResponse();

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Wachtwoord is verplicht',
        formData: { email: 'test@example.com' }
      });
    });

    it('should render form with authentication error when credentials are invalid', () => {
      const req = mockRequest({ email: 'test@example.com', password: 'wrongpassword' });
      const res = mockResponse();
      const authError = new Error('Onjuiste inloggegevens');
      authError.status = 401;

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(authError, null);
      });

      authController.login(req, res, mockNext);

      expect(authService.authenticate).toHaveBeenCalledWith(
        'test@example.com',
        'wrongpassword',
        expect.any(Function)
      );
      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Onjuiste inloggegevens',
        formData: { email: 'test@example.com' }
      });
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should successfully authenticate and redirect when credentials are valid', () => {
      const req = mockRequest({ email: 'john@example.com', password: 'correct-password' });
      const res = mockResponse();
      const mockUser = {
        staff_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      };
      const mockToken = 'mocked-jwt-token-12345';

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(null, mockUser);
      });

      jwt.sign.mockReturnValue(mockToken);

      authController.login(req, res, mockNext);

      expect(authService.authenticate).toHaveBeenCalledWith(
        'john@example.com',
        'correct-password',
        expect.any(Function)
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { 
          staff_id: 1,
          email: 'john@example.com'
        },
        'test-secret-key',
        { expiresIn: '24h' }
      );
      expect(res.cookie).toHaveBeenCalledWith('auth_token', mockToken, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
      });
      expect(res.redirect).toHaveBeenCalledWith('/actor');
    });

    it('should trim email whitespace before authentication', () => {
      const req = mockRequest({ email: '  john@example.com  ', password: 'password123' });
      const res = mockResponse();
      const mockUser = {
        staff_id: 1,
        email: 'john@example.com'
      };

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(null, mockUser);
      });

      jwt.sign.mockReturnValue('token');

      authController.login(req, res, mockNext);

      expect(authService.authenticate).toHaveBeenCalledWith(
        'john@example.com',
        'password123',
        expect.any(Function)
      );
    });

    it('should handle database errors during authentication', () => {
      const req = mockRequest({ email: 'john@example.com', password: 'password123' });
      const res = mockResponse();
      const dbError = new Error('Database connection failed');

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(dbError, null);
      });

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Database connection failed',
        formData: { email: 'john@example.com' }
      });
    });

    it('should handle user not found scenarios', () => {
      const req = mockRequest({ email: 'nonexistent@example.com', password: 'password123' });
      const res = mockResponse();
      const userNotFoundError = new Error('Gebruiker niet gevonden');
      userNotFoundError.status = 404;

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(userNotFoundError, null);
      });

      authController.login(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('auth/login', {
        title: 'Inloggen',
        error: 'Gebruiker niet gevonden',
        formData: { email: 'nonexistent@example.com' }
      });
    });

    it('should handle JWT signing errors', () => {
      const req = mockRequest({ email: 'john@example.com', password: 'password123' });
      const res = mockResponse();
      const mockUser = {
        staff_id: 1,
        email: 'john@example.com'
      };

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(null, mockUser);
      });

      jwt.sign.mockImplementation(() => {
        throw new Error('JWT signing failed');
      });

      expect(() => {
        authController.login(req, res, mockNext);
      }).toThrow('JWT signing failed');

      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should handle missing JWT_SECRET environment variable', () => {
      delete process.env.JWT_SECRET;
      
      const req = mockRequest({ email: 'john@example.com', password: 'password123' });
      const res = mockResponse();
      const mockUser = {
        staff_id: 1,
        email: 'john@example.com'
      };

      authService.authenticate.mockImplementation((email, password, callback) => {
        callback(null, mockUser);
      });

      jwt.sign.mockReturnValue('token');

      authController.login(req, res, mockNext);

      expect(jwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        undefined,
        { expiresIn: '24h' }
      );
    });
  });

  describe('logout', () => {
    it('should clear auth cookie and redirect to login', () => {
      const req = mockRequest();
      const res = mockResponse();

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });

    it('should work even when no cookie is present', () => {
      const req = mockRequest();
      const res = mockResponse();

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('auth_token');
      expect(res.redirect).toHaveBeenCalledWith('/auth/login');
    });
  });
});