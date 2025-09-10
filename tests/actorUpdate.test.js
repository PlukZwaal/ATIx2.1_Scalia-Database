const actorController = require('../src/controllers/actorController');
const actorService = require('../src/services/actorService');

jest.mock('../src/services/actorService');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.render = jest.fn();
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

describe('Actor Update Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEditForm', () => {
    it('should render edit form with actor data when actor exists', () => {
      const req = mockRequest({ id: '123' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe'
      };
      const mockCurrentFilms = [
        { film_id: 1, title: 'Movie 1' },
        { film_id: 2, title: 'Movie 2' }
      ];
      const mockAvailableFilms = [
        { film_id: 3, title: 'Movie 3', release_year: 2020 },
        { film_id: 4, title: 'Movie 4', release_year: 2021 }
      ];

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(null, mockCurrentFilms);
      });

      actorService.getAvailableFilmsForActor.mockImplementation((id, callback) => {
        callback(null, mockAvailableFilms);
      });

      actorController.getEditForm(req, res, mockNext);

      expect(actorService.getById).toHaveBeenCalledWith(123, expect.any(Function));
      expect(actorService.getFilmsByActorId).toHaveBeenCalledWith(123, expect.any(Function));
      expect(actorService.getAvailableFilmsForActor).toHaveBeenCalledWith(123, expect.any(Function));
      expect(res.render).toHaveBeenCalledWith('actorEdit', {
        title: 'John Doe Bewerken',
        actor: mockActor,
        currentFilms: mockCurrentFilms,
        availableFilms: mockAvailableFilms,
        errors: [],
        formData: {
          first_name: 'John',
          last_name: 'Doe'
        }
      });
    });

    it('should call next with 404 error when actor not found', () => {
      const req = mockRequest({ id: '999' });
      const res = mockResponse();

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, null);
      });

      actorController.getEditForm(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Acteur niet gevonden',
          status: 404
        })
      );
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should handle films service errors gracefully', () => {
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
        callback(new Error('Current films fetch failed'), null);
      });

      actorService.getAvailableFilmsForActor.mockImplementation((id, callback) => {
        callback(new Error('Available films fetch failed'), null);
      });

      actorController.getEditForm(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorEdit', {
        title: 'John Doe Bewerken',
        actor: mockActor,
        currentFilms: [],
        availableFilms: [],
        errors: [],
        formData: {
          first_name: 'John',
          last_name: 'Doe'
        }
      });
    });
  });

  describe('update', () => {
    it('should update actor when data is valid', () => {
      const req = mockRequest({ id: '123' }, { first_name: 'Jane', last_name: 'Smith' });
      const res = mockResponse();
      const updatedActor = {
        actor_id: 123,
        first_name: 'Jane',
        last_name: 'Smith',
        full_name: 'Jane Smith'
      };

      actorService.update.mockImplementation((id, actorData, callback) => {
        callback(null, updatedActor);
      });

      actorController.update(req, res, mockNext);

      expect(actorService.update).toHaveBeenCalledWith(
        123,
        { first_name: 'Jane', last_name: 'Smith' },
        expect.any(Function)
      );
      expect(res.redirect).toHaveBeenCalledWith('/actor/123');
    });

    it('should trim whitespace from input data', () => {
      const req = mockRequest({ id: '123' }, { first_name: '  Jane  ', last_name: '  Smith  ' });
      const res = mockResponse();
      const updatedActor = { actor_id: 123, first_name: 'Jane', last_name: 'Smith' };

      actorService.update.mockImplementation((id, actorData, callback) => {
        callback(null, updatedActor);
      });

      actorController.update(req, res, mockNext);

      expect(actorService.update).toHaveBeenCalledWith(
        123,
        { first_name: 'Jane', last_name: 'Smith' },
        expect.any(Function)
      );
    });

    it('should render edit form with validation errors when first_name is missing', () => {
      const req = mockRequest({ id: '123' }, { first_name: '', last_name: 'Smith' });
      const res = mockResponse();
      const mockActor = {
        actor_id: 123,
        first_name: 'John',
        last_name: 'Doe',
        full_name: 'John Doe'
      };
      const mockCurrentFilms = [];
      const mockAvailableFilms = [];

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, mockActor);
      });

      actorService.getFilmsByActorId.mockImplementation((id, callback) => {
        callback(null, mockCurrentFilms);
      });

      actorService.getAvailableFilmsForActor.mockImplementation((id, callback) => {
        callback(null, mockAvailableFilms);
      });

      actorController.update(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorEdit', {
        title: 'John Doe Bewerken',
        actor: mockActor,
        currentFilms: mockCurrentFilms,
        availableFilms: mockAvailableFilms,
        errors: ['Voornaam is verplicht'],
        formData: { first_name: '', last_name: 'Smith' }
      });
      expect(actorService.update).not.toHaveBeenCalled();
    });

    it('should render edit form with validation errors when last_name is missing', () => {
      const req = mockRequest({ id: '123' }, { first_name: 'Jane', last_name: '' });
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
        callback(null, []);
      });

      actorService.getAvailableFilmsForActor.mockImplementation((id, callback) => {
        callback(null, []);
      });

      actorController.update(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorEdit', 
        expect.objectContaining({
          errors: ['Achternaam is verplicht'],
          formData: { first_name: 'Jane', last_name: '' }
        })
      );
    });

    it('should render edit form with multiple validation errors', () => {
      const req = mockRequest({ id: '123' }, { first_name: '', last_name: '   ' });
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
        callback(null, []);
      });

      actorService.getAvailableFilmsForActor.mockImplementation((id, callback) => {
        callback(null, []);
      });

      actorController.update(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorEdit', 
        expect.objectContaining({
          errors: ['Voornaam is verplicht', 'Achternaam is verplicht']
        })
      );
    });

    it('should call next with error when actorService.update fails', () => {
      const req = mockRequest({ id: '123' }, { first_name: 'Jane', last_name: 'Smith' });
      const res = mockResponse();
      const error = new Error('Database update failed');

      actorService.update.mockImplementation((id, actorData, callback) => {
        callback(error, null);
      });

      actorController.update(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should handle actor not found error during validation', () => {
      const req = mockRequest({ id: '999' }, { first_name: '', last_name: 'Smith' });
      const res = mockResponse();

      actorService.getById.mockImplementation((id, callback) => {
        callback(null, null);
      });

      actorController.update(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Acteur niet gevonden',
          status: 404
        })
      );
    });
  });
});