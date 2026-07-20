const request = require('supertest');
const app = require('../index');
const User = require('../models/User');

// Mock Firebase admin if used in auth
jest.mock('../firebaseAdmin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'mock-uid', email: 'mock@example.com' }),
  }),
}));

describe('Authentication Flow', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'Password123!',
    personalInfo: {
      username: 'testuser',
      institute: 'Test University'
    }
  };

  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');

    // Verify user exists in DB
    const user = await User.findOne({ email: testUser.email });
    expect(user).toBeTruthy();
    expect(user.personalInfo.username).toBe('testuser');
    
    // Ensure password is not plain text
    expect(user.password).not.toBe(testUser.password);
  });

  it('should fail to register an existing user', async () => {
    // First register the user
    await request(app).post('/api/auth/register').send(testUser);

    // Try again
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'User already exists');
  });

  it('should successfully login and return an HttpOnly cookie', async () => {
    // First register the user
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user');
    
    // Check if Set-Cookie header exists
    expect(res.headers['set-cookie']).toBeDefined();
    
    // Check that cookie contains HttpOnly
    if (res.headers['set-cookie']) {
      const cookie = res.headers['set-cookie'][0];
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/token=/);
    }
  });

  it('should fail login with incorrect password', async () => {
    // First register the user
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPassword' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});
