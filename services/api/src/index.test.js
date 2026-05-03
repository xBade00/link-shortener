const request = require('supertest');
const app = require('./index');

afterAll((done) => {
  done();
});

test('Health Check gibt 200 zurück', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
});

test('Link kürzen funktioniert', async () => {
  const res = await request(app)
    .post('/shorten')
    .send({ url: 'https://google.com' });
  expect(res.statusCode).toBe(200);
  expect(res.body.shortUrl).toBeDefined();
});
