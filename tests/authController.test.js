const authController = require('../src/controllers/authController');
const authService = require('../src/services/authService');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/authService');
jest.mock('jsonwebtoken');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.render = jest.fn();
  res.redirect = jest.fn();
  res.cookie = jest.fn();
  return res;
};

const mockNext = jest.fn();

describe('authController.login', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render error if email or password is missing', () => {
    const req = { body: { email: '', password: '' } };
    const res = mockResponse();

    authController.login(req, res, mockNext);

    expect(res.render).toHaveBeenCalledWith('auth/login', {
      title: 'Inloggen',
      error: 'Email is verplicht',
      formData: { email: '' }
    });
  });

  it('should render error if authentication fails', () => {
    const req = { body: { email: 'test@example.com', password: 'wrong' } };
    const res = mockResponse();
    const error = new Error('Onjuiste inloggegevens');

    authService.authenticate.mockImplementation((email, password, cb) => {
      cb(error, null);
    });

    authController.login(req, res, mockNext);

    expect(res.render).toHaveBeenCalledWith('auth/login', {
      title: 'Inloggen',
      error: 'Onjuiste inloggegevens',
      formData: { email: 'test@example.com' }
    });
  });

  it('should authenticate and set JWT cookie on success', () => {
    const req = { body: { email: 'john@example.com', password: '123456' } };
    const res = mockResponse();
    const user = {
      staff_id: 1,
      email: 'john@example.com',
      first_name: 'John',
      last_name: 'Doe'
    };

    authService.authenticate.mockImplementation((email, password, cb) => {
      cb(null, user);
    });

    jwt.sign.mockReturnValue('mocked-jwt-token');

    authController.login(req, res, mockNext);

    expect(authService.authenticate).toHaveBeenCalledWith(
      'john@example.com',
      '123456',
      expect.any(Function)
    );
    expect(jwt.sign).toHaveBeenCalledWith(
      { staff_id: 1, email: 'john@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    expect(res.cookie).toHaveBeenCalledWith('auth_token', 'mocked-jwt-token', expect.any(Object));
    expect(res.redirect).toHaveBeenCalledWith('/actor');
  });
});
