// TODO test will fail (hey, it's TDD after all)
const request = require('supertest')
const app = require('../app')

describe('Image Extraction Endpoints', () => {
    it('should be the right endpoint', async () => {
        const res = await request(app)
            .post('/extract-frame')
            .send({
                videoUri: 'stubUriForVideo',
            })
        expect(res.body.key).toEqual('hello')
    })
})
