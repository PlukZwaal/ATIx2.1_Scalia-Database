const actorController = require('../src/controllers/actorController');
const actorService = require('../src/services/actorService');


// Mock res object
const mockResponse = () => {
  const res = {};
  res.render = jest.fn();
  res.redirect = jest.fn();
  return res;
};

// Mock next function
const mockNext = jest.fn();

describe('actorController.create', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render form with errors if first_name or last_name is missing', () => {
    const req = { body: { first_name: '', last_name: '' } };
    const res = mockResponse();

    actorController.create(req, res, mockNext);

    expect(res.render).toHaveBeenCalledWith('actorCreate', {
      title: 'Nieuwe Acteur Aanmaken',
      errors: ['Voornaam is verplicht', 'Achternaam is verplicht'],
      formData: { first_name: '', last_name: '' }
    });
  });

  it('should call actorService.create and redirect when data is valid', () => {
    const req = { body: { first_name: 'John', last_name: 'Doe' } };
    const res = mockResponse();

    // Mock actorService.create
    actorService.create = jest.fn((actorData, callback) => {
      callback(null, { actor_id: 123, ...actorData, full_name: 'John Doe' });
    });

    actorController.create(req, res, mockNext);

    expect(actorService.create).toHaveBeenCalledWith(
      { first_name: 'John', last_name: 'Doe' },
      expect.any(Function)
    );
    expect(res.redirect).toHaveBeenCalledWith('/actor/123');
  });

  it('should call next with error if actorService.create returns an error', () => {
    const req = { body: { first_name: 'John', last_name: 'Doe' } };
    const res = mockResponse();
    const error = new Error('Database error');

    actorService.create = jest.fn((actorData, callback) => {
      callback(error, null);
    });

    actorController.create(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});
