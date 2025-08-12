const request = require('supertest');
const express = require('express');
const userRoutes = require('../../src/routes/userRoutes');
const UserController = require('../../src/controllers/UserController');
const middleware = require('../../src/middleware');

// Mock the UserController and middleware
jest.mock('../../src/controllers/UserController');
jest.mock('../../src/middleware', () => ({
  validateToken: jest.fn((req, res, next) => next()),
  requireAdmin: jest.fn((req, res, next) => next()),
  userValidationRules: {
    signup: [],
    login: [],
    passwordChange: [],
  },
  validate: jest.fn((req, res, next) => next()),
}));

describe('User Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', userRoutes);

    // Mock controller methods with simple implementations
    UserController.store.mockImplementation((req, res) =>
      res.status(201).json({ message: 'User created' })
    );
    UserController.index.mockImplementation((req, res) =>
      res.status(200).json({ token: 'fake-token' })
    );
    UserController.validate.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Email validated' })
    );
    UserController.resendEmail.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Email resent' })
    );
    UserController.resetPassword.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Password reset email sent' })
    );
    UserController.passwordChange.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Password changed' })
    );
    UserController.show.mockImplementation((req, res) =>
      res.status(200).json({ user: { id: 1 } })
    );
    UserController.changePassword.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Password changed' })
    );
    UserController.changeUsername.mockImplementation((req, res) =>
      res.status(200).json({ message: 'Username changed' })
    );
    UserController.getUsers.mockImplementation((req, res) =>
      res.status(200).json({ users: [] })
    );
    UserController.getUsersByEmailOrUsername.mockImplementation((req, res) =>
      res.status(200).json({ users: [] })
    );
    UserController.getOnlyBlockedUsers.mockImplementation((req, res) =>
      res.status(200).json({ users: [] })
    );
    UserController.blockUser.mockImplementation((req, res) =>
      res.status(200).json({ message: 'User blocked' })
    );
    UserController.unblockUser.mockImplementation((req, res) =>
      res.status(200).json({ message: 'User unblocked' })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Public Routes', () => {
    test('POST /signup should call UserController.store', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/signup').send(userData);

      expect(response.status).toBe(201);
      expect(middleware.validate).toHaveBeenCalled();
      expect(UserController.store).toHaveBeenCalled();
    });

    test('POST /login should call UserController.index', async () => {
      const loginData = { email: 'test@example.com', password: 'password123' };

      const response = await request(app).post('/login').send(loginData);

      expect(response.status).toBe(200);
      expect(middleware.validate).toHaveBeenCalled();
      expect(UserController.index).toHaveBeenCalled();
    });

    test('GET /confirm/:token should call UserController.validate', async () => {
      const response = await request(app).get('/confirm/test-token');

      expect(response.status).toBe(200);
      expect(UserController.validate).toHaveBeenCalled();
    });

    test('GET /newtoken should call UserController.resendEmail', async () => {
      const response = await request(app).get('/newtoken');

      expect(response.status).toBe(200);
      expect(UserController.resendEmail).toHaveBeenCalled();
    });

    test('POST /reset/password should call UserController.resetPassword', async () => {
      const response = await request(app)
        .post('/reset/password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(UserController.resetPassword).toHaveBeenCalled();
    });

    test('POST /reset/password/change should call UserController.passwordChange', async () => {
      const response = await request(app)
        .post('/reset/password/change')
        .send({ token: 'test-token', password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(UserController.passwordChange).toHaveBeenCalled();
    });
  });

  describe('Protected Routes', () => {
    test('GET / should call UserController.show', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(UserController.show).toHaveBeenCalled();
    });

    test('POST /change/password should call UserController.changePassword', async () => {
      const response = await request(app)
        .post('/change/password')
        .send({ oldPassword: 'password123', newPassword: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.validate).toHaveBeenCalled();
      expect(UserController.changePassword).toHaveBeenCalled();
    });

    test('POST /change/username should call UserController.changeUsername', async () => {
      const response = await request(app)
        .post('/change/username')
        .send({ username: 'newusername' });

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(UserController.changeUsername).toHaveBeenCalled();
    });
  });

  describe('Admin Routes', () => {
    test('GET /all should call UserController.getUsers', async () => {
      const response = await request(app).get('/all');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.requireAdmin).toHaveBeenCalled();
      expect(UserController.getUsers).toHaveBeenCalled();
    });

    test('POST /search should call UserController.getUsersByEmailOrUsername', async () => {
      const response = await request(app)
        .post('/search')
        .send({ search: 'test' });

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.requireAdmin).toHaveBeenCalled();
      expect(UserController.getUsersByEmailOrUsername).toHaveBeenCalled();
    });

    test('GET /blocked should call UserController.getOnlyBlockedUsers', async () => {
      const response = await request(app).get('/blocked');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.requireAdmin).toHaveBeenCalled();
      expect(UserController.getOnlyBlockedUsers).toHaveBeenCalled();
    });

    test('POST /block/:email should call UserController.blockUser', async () => {
      const response = await request(app).post('/block/test@example.com');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.requireAdmin).toHaveBeenCalled();
      expect(UserController.blockUser).toHaveBeenCalled();
    });

    test('POST /unblock/:email should call UserController.unblockUser', async () => {
      const response = await request(app).post('/unblock/test@example.com');

      expect(response.status).toBe(200);
      expect(middleware.validateToken).toHaveBeenCalled();
      expect(middleware.requireAdmin).toHaveBeenCalled();
      expect(UserController.unblockUser).toHaveBeenCalled();
    });
  });
});
