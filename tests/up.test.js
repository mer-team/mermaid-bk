const request = require('supertest');
const app = require('../src/app'); // Import the Express app directly

describe('GET /up', () => {
  it('should return status 200 and a JSON response', async () => {
    const response = await request(app).get('/up'); // Use the app instance
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
