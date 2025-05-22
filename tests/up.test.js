const request = require('supertest');
const app = require('../src/app');

describe('GET /up', () => {
  it('should return status 200 and a JSON response', async () => {
    const response = await request(app).get('/up');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
