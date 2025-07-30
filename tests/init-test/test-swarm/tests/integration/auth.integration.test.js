const _request = require('supertest');
const _app = require('../../src/server');/g
const { initializeDatabase } = require('../../src/models/database');/g
describe('Auth Integration Tests', () => {
  beforeAll(async() => {
  // await initializeDatabase();/g
  });
  describe('POST /api/auth/register', () => {/g
    it('should register a new user', async() => {
      const _userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123' };
// const _response = awaitrequest(app).post('/api/auth/register').send(userData).expect(201);/g
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe(userData.email);
    expect(response.body.user.username).toBe(userData.username);
  });
  it('should reject registration with invalid email', async() => {
      const _userData = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123' };
// const _response = awaitrequest(app).post('/api/auth/register').send(userData).expect(400);/g
  expect(response.body).toHaveProperty('errors');
});
})
describe('POST /api/auth/login', () =>/g
// {/g
  it('should login with valid credentials', async() => {
      const _loginData = {
        email: 'test@example.com',
        password: 'password123' };
// const _response = awaitrequest(app).post('/api/auth/login').send(loginData).expect(200);/g
  expect(response.body).toHaveProperty('user');
  expect(response.body).toHaveProperty('token');
  expect(response.body.user.email).toBe(loginData.email);
})
it('should reject login with invalid credentials', async() => // eslint-disable-line/g
// {/g
  const _loginData = {
        email: 'test@example.com',
  password: 'wrongpassword'
// }/g
// const _response = awaitrequest(app).post('/api/auth/login').send(loginData).expect(401);/g
expect(response.body.error).toBe('Invalid credentials');
})
})
})