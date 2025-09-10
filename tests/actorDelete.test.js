const actorController = require('../src/controllers/actorController');
const actorService = require('../src/services/actorService');

jest.mock('../src/services/actorService');

// Mock process.env
const originalEnv = process.env;
beforeEach(() => {
  process.env = { ...originalEnv };
  process.env.STAFF_PASSWORD = 'correct-password';
});

afterEach(() => {
  process.env = originalEnv;
});

// Mock response object
const mockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.status = jest.fn().mockReturnThis();
  return res;
};

// Mock request object
const mockRequest = (params = {}, body = {}) => ({
  params,
  body
});

const mockNext = jest.fn();

describe('Actor Delete Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete', () => {
    it('should delete actor when password is correct', () => {
      const req = mockRequest({ id: '123' }, { password: 'correct-password' });
      const res = mockResponse();

      actorService.delete.mockImplementation((id, callback) => {
        callback(null);
      });

      actorController.delete(req, res, mockNext);

      expect(actorService.delete).toHaveBeenCalledWith(123, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 401 error when password is incorrect', () => {
      const req = mockRequest({ id: '123' }, { password: 'wrong-password' });
      const res = mockResponse();

      actorController.delete(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ongeldig wachtwoord',
          status: 401
        })
      );
      expect(actorService.delete).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next with 401 error when password is empty', () => {
      const req = mockRequest({ id: '123' }, { password: '' });
      const res = mockResponse();

      actorController.delete(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ongeldig wachtwoord',
          status: 401
        })
      );
      expect(actorService.delete).not.toHaveBeenCalled();
    });

    it('should call next with 401 error when password is undefined', () => {
      const req = mockRequest({ id: '123' }, {});
      const res = mockResponse();

      actorController.delete(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ongeldig wachtwoord',
          status: 401
        })
      );
      expect(actorService.delete).not.toHaveBeenCalled();
    });

    it('should call next with 404 error when actor not found', () => {
      const req = mockRequest({ id: '999' }, { password: 'correct-password' });
      const res = mockResponse();
      const error = new Error('Actor not found in database');

      actorService.delete.mockImplementation((id, callback) => {
        callback(error);
      });

      actorController.delete(req, res, mockNext);

      expect(actorService.delete).toHaveBeenCalledWith(999, expect.any(Function));
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Acteur niet gevonden',
          status: 404
        })
      );
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should convert string id to number', () => {
      const req = mockRequest({ id: '456' }, { password: 'correct-password' });
      const res = mockResponse();

      actorService.delete.mockImplementation((id, callback) => {
        callback(null);
      });

      actorController.delete(req, res, mockNext);

      expect(actorService.delete).toHaveBeenCalledWith(456, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor');
    });

    it('should handle database errors during deletion', () => {
      const req = mockRequest({ id: '123' }, { password: 'correct-password' });
      const res = mockResponse();
      const error = new Error('Database connection failed');

      actorService.delete.mockImplementation((id, callback) => {
        callback(error);
      });

      actorController.delete(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Acteur niet gevonden',
          status: 404
        })
      );
    });

    it('should handle case-sensitive password comparison', () => {
      process.env.STAFF_PASSWORD = 'MyPassword123';
      
      const req1 = mockRequest({ id: '123' }, { password: 'mypassword123' });
      const req2 = mockRequest({ id: '123' }, { password: 'MyPassword123' });
      const res1 = mockResponse();
      const res2 = mockResponse();

      actorService.delete.mockImplementation((id, callback) => {
        callback(null);
      });

      // Wrong case
      actorController.delete(req1, res1, mockNext);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ongeldig wachtwoord',
          status: 401
        })
      );

      mockNext.mockClear();

      // Correct case
      actorController.delete(req2, res2, mockNext);
      expect(res2.redirect).toHaveBeenCalledWith('/actor');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle whitespace in password', () => {
      process.env.STAFF_PASSWORD = 'test-password';
      
      const req = mockRequest({ id: '123' }, { password: ' test-password ' });
      const res = mockResponse();

      actorController.delete(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Ongeldig wachtwoord',
          status: 401
        })
      );
      expect(actorService.delete).not.toHaveBeenCalled();
    });
  });
});