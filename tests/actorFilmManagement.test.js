const actorController = require('../src/controllers/actorController');
const actorService = require('../src/services/actorService');

jest.mock('../src/services/actorService');

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

describe('Actor Film Management Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addToFilm', () => {
    it('should add actor to film when film_id is provided', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();

      actorService.addActorToFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.addToFilm(req, res, mockNext);

      expect(actorService.addActorToFilm).toHaveBeenCalledWith(123, 456, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor/123/edit');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next with 400 error when film_id is missing', () => {
      const req = mockRequest({ id: '123' }, {});
      const res = mockResponse();

      actorController.addToFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Geen film geselecteerd',
          status: 400
        })
      );
      expect(actorService.addActorToFilm).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should call next with 400 error when film_id is empty string', () => {
      const req = mockRequest({ id: '123' }, { film_id: '' });
      const res = mockResponse();

      actorController.addToFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Geen film geselecteerd',
          status: 400
        })
      );
      expect(actorService.addActorToFilm).not.toHaveBeenCalled();
    });

    it('should call next with 400 error when film_id is 0', () => {
      const req = mockRequest({ id: '123' }, { film_id: '0' });
      const res = mockResponse();

      actorController.addToFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Geen film geselecteerd',
          status: 400
        })
      );
      expect(actorService.addActorToFilm).not.toHaveBeenCalled();
    });

    it('should convert string IDs to numbers', () => {
      const req = mockRequest({ id: '789' }, { film_id: '101' });
      const res = mockResponse();

      actorService.addActorToFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.addToFilm(req, res, mockNext);

      expect(actorService.addActorToFilm).toHaveBeenCalledWith(789, 101, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor/789/edit');
    });

    it('should call next with error when actorService.addActorToFilm fails', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();
      const error = new Error('Database constraint violation');

      actorService.addActorToFilm.mockImplementation((actorId, filmId, callback) => {
        callback(error);
      });

      actorController.addToFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should handle duplicate film assignment error', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();
      const error = new Error('DUPLICATE_ENTRY');
      error.code = 'ER_DUP_ENTRY';

      actorService.addActorToFilm.mockImplementation((actorId, filmId, callback) => {
        callback(error);
      });

      actorController.addToFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('removeFromFilm', () => {
    it('should remove actor from film when film_id is provided', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(actorService.removeActorFromFilm).toHaveBeenCalledWith(123, 456, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor/123/edit');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should convert string IDs to numbers', () => {
      const req = mockRequest({ id: '789' }, { film_id: '101' });
      const res = mockResponse();

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(actorService.removeActorFromFilm).toHaveBeenCalledWith(789, 101, expect.any(Function));
      expect(res.redirect).toHaveBeenCalledWith('/actor/789/edit');
    });

    it('should call next with error when actorService.removeActorFromFilm fails', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();
      const error = new Error('Film-actor relationship not found');

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(error);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should handle missing film_id gracefully', () => {
      const req = mockRequest({ id: '123' }, {});
      const res = mockResponse();

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(actorService.removeActorFromFilm).toHaveBeenCalledWith(123, NaN, expect.any(Function));
    });

    it('should handle empty film_id', () => {
      const req = mockRequest({ id: '123' }, { film_id: '' });
      const res = mockResponse();

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(null);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(actorService.removeActorFromFilm).toHaveBeenCalledWith(123, 0, expect.any(Function));
    });

    it('should handle database errors during removal', () => {
      const req = mockRequest({ id: '123' }, { film_id: '456' });
      const res = mockResponse();
      const error = new Error('Database connection failed');

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(error);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should handle non-existent relationship removal', () => {
      const req = mockRequest({ id: '123' }, { film_id: '999' });
      const res = mockResponse();
      const error = new Error('No rows affected');
      error.status = 404;

      actorService.removeActorFromFilm.mockImplementation((actorId, filmId, callback) => {
        callback(error);
      });

      actorController.removeFromFilm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});