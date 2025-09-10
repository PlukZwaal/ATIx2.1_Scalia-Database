const actorController = require('../src/controllers/actorController');
const actorService = require('../src/services/actorService');

jest.mock('../src/services/actorService');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.render = jest.fn();
  res.status = jest.fn().mockReturnThis();
  return res;
};

// Mock request object
const mockRequest = (params = {}) => ({
  params
});

const mockNext = jest.fn();

describe('Actor Read Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should render actor list when actors exist', () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockActors = [
        { actor_id: 1, full_name: 'John Doe', film_count: 5 },
        { actor_id: 2, full_name: 'Jane Smith', film_count: 3 },
        { actor_id: 3, full_name: 'Bob Johnson', film_count: 0 }
      ];

      actorService.getAll.mockImplementation((callback) => {
        callback(null, mockActors);
      });

      actorController.getAll(req, res, mockNext);

      expect(actorService.getAll).toHaveBeenCalledWith(expect.any(Function));
      expect(res.render).toHaveBeenCalledWith('actor', {
        title: 'Actor',
        actor: mockActors
      });
    });

    it('should render empty list when no actors exist', () => {
      const req = mockRequest();
      const res = mockResponse();
      const mockActors = [];

      actorService.getAll.mockImplementation((callback) => {
        callback(null, mockActors);
      });

      actorController.getAll(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actor', {
        title: 'Actor',
        actor: mockActors
      });
    });

    it('should call next with error when actorService.getAll fails', () => {
      const req = mockRequest();
      const res = mockResponse();
      const error = new Error('Database connection failed');

      actorService.getAll.mockImplementation((callback) => {
        callback(error, null);
      });

      actorController.getAll(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should render actor detail when actor exists', () => {
      const req = mockRequest({ id: '123' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe'
      };
      const mockFilms = [
        {
          film_id: 1,
          title: 'Movie 1',
          release_year: 2020,
          category_name: 'Action',
          length: 120,
          rating: 'PG-13',
          description: 'Great action movie'
        },
        {
          film_id: 2,
          title: 'Movie 2',
          release_year: 2021,
          category_name: 'Drama',
          length: 110,
          rating: 'R',
          description: 'Emotional drama'
        }
      ];

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(null, mockFilms);
      });

      actorController.getById(req, res, mockNext);

      expect(actorService.getById).toHaveBeenCalledWith(123, expect.any(Function));
      expect(actorService.getFilmsByActorId).toHaveBeenCalledWith(123, expect.any(Function));
      expect(res.render).toHaveBeenCalledWith('actorDetail', {
        title: 'Details van John Doe',
        actor: mockActor,
        films: mockFilms
      });
    });

    it('should render actor detail with empty films list when no films exist', () => {
      const req = mockRequest({ id: '456' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 456,
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith'
      };

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(null, []);
      });

      actorController.getById(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorDetail', {
        title: 'Details van Jane Smith',
        actor: mockActor,
        films: []
      });
    });

    it('should call next with 404 error when actor not found', () => {
      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, null);
      });

      actorController.getById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Acteur niet gevonden',
          status: 404
        })
      );
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should call next with error when actorService.getById fails', () => {
      const req = mockRequest({ id: '123' });
      const res = mockResponse();
      const error = new Error('Database error');

      actorService.getById.mockImplementation((id, callback) => {
        callback(error, null);
      });

      actorController.getById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should handle films service error gracefully', () => {
      const req = mockRequest({ id: '123' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe'
      };

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(new Error('Films fetch failed'), null);
      });

      actorController.getById(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorDetail', {
        title: 'Details van John Doe',
        actor: mockActor,
        films: []
      });
    });

    it('should convert string id to number', () => {
      const req = mockRequest({ id: '789' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 789,
        first_name: 'Bob',
        last_name: 'Wilson',
        full_name: 'Bob Wilson'
      };

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(null, []);
      });

      actorController.getById(req, res, mockNext);

      expect(actorService.getById).toHaveBeenCalledWith(789, expect.any(Function));
      expect(actorService.getFilmsByActorId).toHaveBeenCalledWith(789, expect.any(Function));
    });
  });
});