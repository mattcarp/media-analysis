// TODO test will fail (hey, it's TDD after all)
const request = require('supertest')
const app = require('../server')
describe('Image Extraction Endpoints', () => {
    it('should extract image from video', async () => {
        const res = await request(app)
            .post('/extract')
            .send({
                videoUri: 'put a link to a test video on s3 here',
            })
        expect(res.statusCode).toEqual(201)
        expect(res.body).toHaveProperty('post')
    })
})
