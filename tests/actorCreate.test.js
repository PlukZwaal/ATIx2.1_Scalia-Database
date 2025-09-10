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
const mockRequest = (body = {}) => ({
  body
});

const mockNext = jest.fn();

describe('Actor Create Functionality', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCreateForm', () => {
    it('should render create form with empty data', () => {
      const req = mockRequest();
      const res = mockResponse();

      actorController.getCreateForm(req, res);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: [],
        formData: {}
      });
    });
  });

  describe('create', () => {
    it('should render form with errors when first_name is missing', () => {
      const req = mockRequest({ first_name: '', last_name: 'Doe' });
      const res = mockResponse();

      actorController.create(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: ['Voornaam is verplicht'],
        formData: { first_name: '', last_name: 'Doe' }
      });
    });

    it('should render form with errors when last_name is missing', () => {
      const req = mockRequest({ first_name: 'John', last_name: '' });
      const res = mockResponse();

      actorController.create(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: ['Achternaam is verplicht'],
        formData: { first_name: 'John', last_name: '' }
      });
    });

    it('should render form with errors when both names are missing', () => {
      const req = mockRequest({ first_name: '', last_name: '' });
      const res = mockResponse();

      actorController.create(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: ['Voornaam is verplicht', 'Achternaam is verplicht'],
        formData: { first_name: '', last_name: '' }
      });
    });

    it('should render form with errors when names are whitespace only', () => {
      const req = mockRequest({ first_name: '   ', last_name: '   ' });
      const res = mockResponse();

      actorController.create(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: ['Voornaam is verplicht', 'Achternaam is verplicht'],
        formData: { first_name: '   ', last_name: '   ' }
      });
    });

    it('should trim whitespace and create actor when data is valid', () => {
      const req = mockRequest({ first_name: '  John  ', last_name: '  Doe  ' });
      const res = mockResponse();
      const newActor = { actor_id: 123, first_name: 'John', last_name: 'Doe' };

      actorService.create.mockImplementation((actorData, callback) => {
        callback(null, newActor);
      });

      actorController.create(req, res, mockNext);

      expect(actorService.create).toHaveBeenCalledWith(
        { first_name: 'John', last_name: 'Doe' },
        expect.any(Function)
      );
      expect(res.redirect).toHaveBeenCalledWith('/actor/123');
    });

    it('should call next with error when actorService.create fails', () => {
      const req = mockRequest({ first_name: 'John', last_name: 'Doe' });
      const res = mockResponse();
      const error = new Error('Database connection failed');

      actorService.create.mockImplementation((actorData, callback) => {
        callback(error, null);
      });

      actorController.create(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.render).not.toHaveBeenCalled();
    });

    it('should handle missing body parameters gracefully', () => {
      const req = mockRequest({});
      const res = mockResponse();

      actorController.create(req, res, mockNext);

      expect(res.render).toHaveBeenCalledWith('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: ['Voornaam is verplicht', 'Achternaam is verplicht'],
        formData: { first_name: undefined, last_name: undefined }
      });
    });

    it('should create actor successfully with valid data', () => {
      const req = mockRequest({ first_name: 'Jane', last_name: 'Smith' });
      const res = mockResponse();
      const newActor = { 
        actor_id: 456, 
        first_name: 'Jane', 
        last_name: 'Smith',
        full_name: 'Jane Smith'
      };

      actorService.create.mockImplementation((actorData, callback) => {
        callback(null, newActor);
      });

      actorController.create(req, res, mockNext);

      expect(actorService.create).toHaveBeenCalledWith(
        { first_name: 'Jane', last_name: 'Smith' },
        expect.any(Function)
      );
      expect(res.redirect).toHaveBeenCalledWith('/actor/456');
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});